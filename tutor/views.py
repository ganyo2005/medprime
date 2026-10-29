import json

from django.conf import settings
from django.db import transaction
from django.db.models import F
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST
from django_ratelimit.decorators import ratelimit

from .models import TutorUsage
from .services import ask


@transaction.atomic
def _bump(key: str, day, by: int) -> int:
    row, created = TutorUsage.objects.get_or_create(key=key, day=day, defaults={"count": max(by, 0)})
    if not created:
        TutorUsage.objects.filter(pk=row.pk).update(count=F("count") + by)
        row.refresh_from_db(fields=["count"])
    return row.count


# Bursts from a single account are throttled before the AI model ever runs.
@ratelimit(key="ip", rate="10/m", block=True)
@require_POST
@csrf_protect
def tutor_ask(request):
    if not settings.TUTOR_ENABLED:
        return JsonResponse({"error": "The AI tutor isn't available right now."}, status=404)

    # The Medprime Physics AI Tutor is sold individually — a topics or exam
    # unlock alone does not grant it.
    if not request.user.is_authenticated or not request.user.profile.has_tutor:
        return JsonResponse(
            {"error": "The Medprime Physics AI Tutor needs to be unlocked separately. Log in and unlock it to use it."},
            status=403,
        )

    try:
        body = json.loads(request.body)
    except (ValueError, TypeError):
        return JsonResponse({"error": "Bad request"}, status=400)

    raw_messages = body.get("messages") if isinstance(body.get("messages"), list) else []
    messages = [
        {"role": m["role"], "content": m["content"][:2000]}
        for m in raw_messages
        if isinstance(m, dict) and m.get("role") in ("user", "assistant") and isinstance(m.get("content"), str) and m["content"].strip()
    ][-12:]
    while messages and messages[0]["role"] != "user":
        messages.pop(0)
    if not messages or messages[-1]["role"] != "user":
        return JsonResponse({"error": "Bad request"}, status=400)

    screen = body.get("context")
    screen = screen[:3000] if isinstance(screen, str) else ""

    limit = settings.TUTOR_LIMIT_PREMIUM
    key = f"user:{request.user.id}"
    day = timezone.now().date()
    used = _bump(key, day, 1)
    if used > limit:
        _bump(key, day, -1)
        return JsonResponse(
            {"error": f"You've reached today's limit of {limit} tutor questions. Your allowance resets at midnight (UTC)."},
            status=429,
            headers={"X-Tutor-Left": "0"},
        )

    try:
        reply = ask(messages, screen)
    except Exception:
        _bump(key, day, -1)  # don't charge the learner for a question the tutor couldn't answer
        return JsonResponse({"error": "The tutor is unavailable right now."}, status=502)

    return JsonResponse({"reply": reply}, headers={"X-Tutor-Left": str(limit - used)})
