"""Ports lib/course.ts — the handful of numbers that tie index.html's simulation
count to the server-side scoring/certificate/gating rules. Re-exported from settings
so they stay in one place (settings.py) but keep the same import style the Netlify
functions used (`from lab.course import TOPICS, QUESTIONS, PASS_MARK, ...`)."""

from django.conf import settings

# The 34 built-in topics are a fixed floor; staff-approved AI-generated topics
# (lab.GeneratedTopic, status=published) add to it at runtime. A plain
# `TOPICS = settings.TOPICS` constant would freeze at process start and never
# see new published rows — callers must use topic_count() instead.
BASE_TOPICS = settings.TOPICS
QUESTIONS = settings.QUESTIONS
PASS_MARK = settings.PASS_MARK
FREE_TOPIC_COUNT = settings.FREE_TOPIC_COUNT
PREMIUM_EXAM_PRESET_INDEX = settings.PREMIUM_EXAM_PRESET_INDEX

# Mock-exam question-count presets, same three tiers as XL in app.js
# ([questions, minutes, title, subtitle] — only the question counts matter server-side).
EXAM_PRESET_QUESTION_COUNTS = (25, 50, 110)
PREMIUM_EXAM_QUESTION_COUNT = EXAM_PRESET_QUESTION_COUNTS[PREMIUM_EXAM_PRESET_INDEX]


def topic_count() -> int:
    from .models import GeneratedTopic  # local import: avoids a models->course loading cycle

    return BASE_TOPICS + GeneratedTopic.objects.filter(status=GeneratedTopic.Status.PUBLISHED).count()
