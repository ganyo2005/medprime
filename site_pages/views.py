import datetime

from django.db.models import F
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods
from django_ratelimit.decorators import ratelimit

from .models import Counter, Enquiry

VISITS = "visits"


@require_http_methods(["GET", "POST"])
@ratelimit(key="ip", rate="20/m", block=True)
def visits_api(request):
    if request.method == "POST":
        Counter.objects.update_or_create(name=VISITS, defaults={})
        Counter.objects.filter(name=VISITS).update(value=F("value") + 1)
    row, _ = Counter.objects.get_or_create(name=VISITS)
    return JsonResponse({"visits": row.value})


@require_http_methods(["POST"])
@csrf_protect
def enquiry_submit(request):
    data = request.POST
    if data.get("bot-field"):  # honeypot — a human never fills this in
        return JsonResponse({"ok": True})

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()
    enquiry_type = data.get("enquiry_type", "")
    if not name or not email or not message or enquiry_type not in dict(Enquiry.ENQUIRY_TYPES):
        return JsonResponse({"error": "Please fill in all required fields."}, status=400)

    preferred_date = data.get("preferred_date") or None
    if preferred_date:
        try:
            preferred_date = datetime.date.fromisoformat(preferred_date)
        except ValueError:
            preferred_date = None

    participants = data.get("participants") or None
    try:
        participants = int(participants) if participants else None
    except ValueError:
        participants = None

    Enquiry.objects.create(
        enquiry_type=enquiry_type,
        name=name[:120],
        email=email[:160],
        phone=data.get("phone", "")[:40],
        role=data.get("role", "")[:60],
        institution=data.get("institution", "")[:160],
        participants=participants,
        format=data.get("format", "")[:20],
        preferred_date=preferred_date,
        preferred_time=data.get("preferred_time", "")[:20],
        topics=data.get("topics", "")[:300],
        message=message[:3000],
    )
    return JsonResponse({"ok": True})
