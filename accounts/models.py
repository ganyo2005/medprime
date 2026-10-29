from django.conf import settings
from django.db import models
from django.utils import timezone


class Profile(models.Model):
    """One per User. Holds the display name used on signup/dashboard —
    independent of the per-certificate editable name in lab.Certificate,
    same relationship as the original Netlify Identity user_metadata.full_name."""

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    full_name = models.CharField(max_length=120, blank=True)
    organization = models.ForeignKey(
        "payments.Organization", null=True, blank=True, on_delete=models.SET_NULL, related_name="members"
    )

    def __str__(self):
        return self.full_name or self.user.email

    @property
    def _org_active(self):
        return bool(self.organization and self.organization.is_active)

    @property
    def is_premium(self):
        """One Premium purchase unlocks everything — all topics, the full
        mock exam, and the AI tutor once enabled. An active org seat grants
        the same thing without a personal payment."""
        if self._org_active:
            return True
        from payments.models import Payment

        return self.user.payments.filter(status=Payment.SUCCESS, expires_at__gt=timezone.now()).exists()

    @property
    def has_topics(self):
        return self.is_premium

    @property
    def has_exam(self):
        return self.is_premium

    @property
    def has_tutor(self):
        return self.is_premium
