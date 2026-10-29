"""Staff-only pages for the AI topic-authoring pipeline. Mounted under the
hardened ADMIN_URL prefix in config/urls.py — @staff_member_required is the
same primitive Django admin itself uses, no new permission system."""

from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.db import transaction
from django.db.models import Max
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .ai_topics import TopicGenerationError, generate_topic_draft
from .models import GeneratedTopic


@staff_member_required
def staff_topics_list(request):
    topics = GeneratedTopic.objects.all().order_by("-created_at")
    return render(request, "lab/staff_topics.html", {"topics": topics})


@staff_member_required
@require_POST
def staff_topic_generate(request):
    prompt = (request.POST.get("prompt") or "").strip()
    if not prompt:
        messages.error(request, "Type a prompt describing the topic first.")
        return redirect("lab_staff:staff_topics_list")
    try:
        topic = generate_topic_draft(prompt, request.user)
    except TopicGenerationError as e:
        messages.error(request, str(e))
        return redirect("lab_staff:staff_topics_list")
    messages.success(request, f"Draft “{topic.n}” generated — review it below before approving.")
    return redirect("lab_staff:staff_topics_list")


@staff_member_required
def staff_topic_preview_data(request, pk):
    topic = get_object_or_404(GeneratedTopic, pk=pk)
    return JsonResponse({
        "n": topic.n, "g": topic.g, "ctl": topic.ctl, "d": topic.d_code, "o": topic.o_code,
        "tip": topic.tip, "quiz": topic.quiz, "quiz_explanations": topic.quiz_explanations,
    })


@staff_member_required
@require_POST
def staff_topic_approve(request, pk):
    topic = get_object_or_404(GeneratedTopic, pk=pk, status=GeneratedTopic.Status.DRAFT)
    with transaction.atomic():
        next_order = (
            GeneratedTopic.objects.filter(status=GeneratedTopic.Status.PUBLISHED).aggregate(Max("publish_order"))[
                "publish_order__max"
            ]
            or 0
        ) + 1
        topic.status = GeneratedTopic.Status.PUBLISHED
        topic.publish_order = next_order
        topic.approved_by = request.user
        topic.approved_at = timezone.now()
        topic.save(update_fields=["status", "publish_order", "approved_by", "approved_at"])
    messages.success(request, f"“{topic.n}” is now live on the site.")
    return redirect("lab_staff:staff_topics_list")


@staff_member_required
@require_POST
def staff_topic_reject(request, pk):
    topic = get_object_or_404(GeneratedTopic, pk=pk, status=GeneratedTopic.Status.DRAFT)
    topic.status = GeneratedTopic.Status.REJECTED
    topic.rejected_reason = (request.POST.get("reason") or "").strip()[:500]
    topic.save(update_fields=["status", "rejected_reason"])
    messages.success(request, f"“{topic.n}” was rejected.")
    return redirect("lab_staff:staff_topics_list")


@staff_member_required
@require_POST
def staff_topic_unpublish(request, pk):
    topic = get_object_or_404(GeneratedTopic, pk=pk, status=GeneratedTopic.Status.PUBLISHED)
    topic.status = GeneratedTopic.Status.REJECTED
    topic.rejected_reason = "Unpublished by staff after errors in production."
    topic.publish_order = None
    topic.save(update_fields=["status", "rejected_reason", "publish_order"])
    messages.success(request, f"“{topic.n}” was taken offline.")
    return redirect("lab_staff:staff_topics_list")
