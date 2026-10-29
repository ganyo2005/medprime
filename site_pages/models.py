from django.db import models


class Counter(models.Model):
    """Ports db/schema.ts `counters` — simplified to one row per name (no
    sharding needed at this traffic volume; MySQL row-level locking via
    F('value') + 1 handles concurrent visits fine)."""

    name = models.CharField(max_length=40, primary_key=True)
    value = models.PositiveIntegerField(default=0)


class Enquiry(models.Model):
    """Replaces Netlify Forms — the "Book a tutorial or demo" form now posts
    here, visible and actionable in Django admin."""

    ENQUIRY_TYPES = [
        ("Individual tutorial", "Individual tutorial"),
        ("Group tutorial", "Group tutorial"),
        ("Institutional demo", "Institutional demo"),
    ]
    enquiry_type = models.CharField(max_length=40, choices=ENQUIRY_TYPES)
    name = models.CharField(max_length=120)
    email = models.EmailField(max_length=160)
    phone = models.CharField(max_length=40, blank=True)
    role = models.CharField(max_length=60, blank=True)
    institution = models.CharField(max_length=160, blank=True)
    participants = models.PositiveIntegerField(null=True, blank=True)
    format = models.CharField(max_length=20, blank=True)
    preferred_date = models.DateField(null=True, blank=True)
    preferred_time = models.CharField(max_length=20, blank=True)
    topics = models.CharField(max_length=300, blank=True)
    message = models.TextField(max_length=3000)
    created_at = models.DateTimeField(auto_now_add=True)
    contacted = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.enquiry_type}"
