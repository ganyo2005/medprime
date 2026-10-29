import json

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.db.models import F
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods, require_POST
from django_ratelimit.decorators import ratelimit

from .certificates import new_id, qr_svg
from .course import PASS_MARK, QUESTIONS, topic_count
from .gating import filter_exam_for_access, filter_quiz_for_access
from .models import Certificate, GeneratedTopic, Progress
from .progress_merge import clean_exam, clean_quiz, merge


def _dynamic_topics_payload():
    rows = GeneratedTopic.objects.filter(status=GeneratedTopic.Status.PUBLISHED).order_by("publish_order")
    return [
        {
            "n": r.n, "g": r.g, "ctl": r.ctl, "d": r.d_code, "o": r.o_code, "tip": r.tip,
            "lo": r.lo, "kt": r.kt, "cs": r.cs, "mk": r.mk, "qz": r.quiz, "qx": r.quiz_explanations,
        }
        for r in rows
    ]


@ensure_csrf_cookie
def index(request):
    user = request.user
    profile = user.profile if user.is_authenticated else None
    config = {
        "isAuthenticated": user.is_authenticated,
        "isPremium": bool(profile and profile.is_premium),
        "freeTopicCount": settings.FREE_TOPIC_COUNT,
        "premiumExamPresetIndex": settings.PREMIUM_EXAM_PRESET_INDEX,
        "priceMonthlyGhs": settings.PRICE_SUB_MONTHLY_GHS,
        "priceSixMonthGhs": settings.PRICE_SUB_SIX_MONTH_GHS,
        "priceYearlyGhs": settings.PRICE_SUB_YEARLY_GHS,
        "tutorEnabled": settings.TUTOR_ENABLED,
        "orgEnrollmentEnabled": settings.ORG_ENROLLMENT_ENABLED,
        "dynamicTopics": _dynamic_topics_payload(),
    }
    return render(
        request,
        "lab/index.html",
        {"lab_config_json": json.dumps(config), "org_enrollment_enabled": settings.ORG_ENROLLMENT_ENABLED},
    )


def verify_page(request):
    return render(request, "lab/verify.html")


def _public(cert: Certificate) -> dict:
    return {"id": cert.id, "name": cert.name, "score": cert.score, "issuedAt": cert.issued_at.isoformat()}


def _with_qr(cert: Certificate, origin: str) -> dict:
    url = f"{origin}/verify?id={cert.id}"
    return {**_public(cert), "url": url, "qr": qr_svg(url)}


@login_required
@require_http_methods(["GET", "PUT"])
@csrf_protect
def progress_api(request):
    row, _ = Progress.objects.get_or_create(user=request.user)
    profile = request.user.profile

    if request.method == "GET":
        return JsonResponse({"quiz": row.quiz, "exam": row.exam or {"h": [], "t": {}, "a": None}, "lastSim": row.last_sim})

    try:
        body = json.loads(request.body)
    except (ValueError, TypeError):
        return JsonResponse({"error": "Bad request"}, status=400)

    new_quiz = filter_quiz_for_access(clean_quiz(body.get("quiz")), profile.has_topics)
    new_exam = filter_exam_for_access(clean_exam(body.get("exam")), profile.has_exam)
    old_exam = row.exam if isinstance(row.exam, dict) and "h" in row.exam else {"h": [], "t": {}, "a": None}
    merged = merge(row.quiz or {}, new_quiz, old_exam, new_exam, body.get("first") is True)

    last_sim = body.get("lastSim")
    if not (isinstance(last_sim, int) and not isinstance(last_sim, bool) and 0 <= last_sim < topic_count()):
        last_sim = row.last_sim

    row.quiz = merged["quiz"]
    row.exam = merged["exam"]
    row.last_sim = last_sim
    row.save(update_fields=["quiz", "exam", "last_sim", "updated_at"])
    return JsonResponse({"quiz": row.quiz, "exam": row.exam, "lastSim": row.last_sim})


@require_http_methods(["GET", "POST"])
def certificate_api(request):
    origin = request.build_absolute_uri("/").rstrip("/")

    cert_id = request.GET.get("id")
    if request.method == "GET" and cert_id:
        cert_id = cert_id.strip().upper()[:20]
        try:
            cert = Certificate.objects.get(id=cert_id)
        except Certificate.DoesNotExist:
            return JsonResponse({"error": "No certificate has this ID."}, status=404)
        return JsonResponse(_public(cert))

    if not request.user.is_authenticated:
        return JsonResponse({"error": "Please log in."}, status=401)

    mine = Certificate.objects.filter(user=request.user).first()

    if request.method == "GET":
        return JsonResponse(_with_qr(mine, origin) if mine else None, safe=False)

    return _issue(request, mine, origin)


@csrf_protect
def _issue(request, mine, origin):
    try:
        body = json.loads(request.body)
    except (ValueError, TypeError):
        return JsonResponse({"error": "Bad request"}, status=400)

    name = " ".join(str(body.get("name") or "").split()).strip()[:60]
    if len(name) < 2:
        return JsonResponse({"error": "Please type your full name."}, status=400)

    n_topics = topic_count()
    progress = Progress.objects.filter(user=request.user).first()
    quiz = progress.quiz if progress else {}
    done = 0
    total = 0
    for t in range(n_topics):
        v = quiz.get(str(t))
        if isinstance(v, int) and not isinstance(v, bool):
            done += 1
            total += min(v, QUESTIONS)
    score = round(100 * total / (n_topics * QUESTIONS))
    if done < n_topics or score < PASS_MARK:
        return JsonResponse({"error": f"Finish all {n_topics} quick checks with an overall score of {PASS_MARK}% or more first."}, status=403)

    if mine:
        mine.name = name
        mine.score = max(mine.score, score)
        mine.updated_at = timezone.now()
        mine.save(update_fields=["name", "score", "updated_at"])
        cert = mine
    else:
        cert = Certificate.objects.create(id=new_id(), user=request.user, name=name, score=score)

    return JsonResponse(_with_qr(cert, origin))


@require_POST
@csrf_protect
@ratelimit(key="ip", rate="20/m", block=True)
def topic_error_report(request):
    """Beacon fired by app.js's loop()/build-loop catches — since published
    AI-generated topics skip a human code-review step, this is how staff find
    out one is erroring in production without watching server logs."""
    try:
        body = json.loads(request.body)
    except (ValueError, TypeError):
        return JsonResponse({"error": "Bad request"}, status=400)

    idx = body.get("topicIndex")
    if not (isinstance(idx, int) and not isinstance(idx, bool)):
        return JsonResponse({"error": "Bad request"}, status=400)

    dynamic_idx = idx - settings.TOPICS
    if dynamic_idx >= 0:
        topic = (
            GeneratedTopic.objects.filter(status=GeneratedTopic.Status.PUBLISHED)
            .order_by("publish_order")[dynamic_idx : dynamic_idx + 1]
            .first()
        )
        if topic:
            GeneratedTopic.objects.filter(pk=topic.pk).update(
                error_count=F("error_count") + 1,
                last_error_at=timezone.now(),
                last_error_message=str(body.get("message", ""))[:1000],
            )
    return JsonResponse({"ok": True})
