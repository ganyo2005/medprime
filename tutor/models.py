from django.db import models


class TutorUsage(models.Model):
    """AI tutor questions asked per day, keyed by learner ("user:<id>") or by
    hashed IP for visitors who aren't logged in. Ports db/schema.ts `tutorUsage`."""

    key = models.CharField(max_length=80)
    day = models.DateField()
    count = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["key", "day"], name="tutor_usage_key_day")]
