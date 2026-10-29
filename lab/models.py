from django.conf import settings
from django.db import models


class Progress(models.Model):
    """One row per learner: quick-check scores, mock exam history and where
    they left off. Ports db/schema.ts `progress`."""

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="progress")
    quiz = models.JSONField(default=dict)
    exam = models.JSONField(default=dict)
    last_sim = models.PositiveSmallIntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Progress({self.user})"


class Certificate(models.Model):
    """Issued certificates. The id is printed on the certificate and checked
    at /verify. Ports db/schema.ts `certificates`."""

    id = models.CharField(max_length=20, primary_key=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="certificate")
    name = models.CharField(max_length=60)
    score = models.PositiveSmallIntegerField()
    issued_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.id


class GeneratedTopic(models.Model):
    """A simulation topic staff generated from a prompt via Claude. Never
    written into static/js/app.js — published rows are served as JSON
    (see lab.views._dynamic_topics_payload) and merged into the live S/LO/KT/
    CS/MK/QZ/QX arrays by app.js itself, right after the 34 built-in topics."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        REJECTED = "rejected", "Rejected"

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)

    # The 7 array-slot payloads, field names mirroring S/LO/KT/CS/MK/QZ/QX.
    n = models.CharField(max_length=120)
    g = models.CharField(max_length=300)
    ctl = models.JSONField()
    d_code = models.TextField()  # body of d(c,t,v)
    o_code = models.TextField()  # body of o(v)
    tip = models.TextField()
    lo = models.TextField()
    kt = models.TextField()
    cs = models.TextField()
    mk = models.TextField()
    quiz = models.JSONField()  # 5x [prompt, [3 choices], correctIndex]
    quiz_explanations = models.JSONField()  # 5 strings, same order as quiz

    # Assigned only on publish — determines position after the static 34,
    # independent of row id so a rejected draft never leaves a gap.
    publish_order = models.PositiveIntegerField(null=True, blank=True, db_index=True)

    # Audit
    prompt = models.TextField()
    raw_response = models.JSONField(default=dict, blank=True)
    model_used = models.CharField(max_length=60, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="generated_topics"
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_topics"
    )
    rejected_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    # Runtime error beacon — filled in by the public topic-error-report
    # endpoint, since nothing else reviews this code before it's live.
    error_count = models.PositiveIntegerField(default=0)
    last_error_at = models.DateTimeField(null=True, blank=True)
    last_error_message = models.TextField(blank=True)

    class Meta:
        ordering = ["publish_order", "created_at"]

    def __str__(self):
        return f"{self.n} ({self.get_status_display()})"
