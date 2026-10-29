import secrets

from django.conf import settings
from django.db import models

JOIN_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # no 0/O/1/I — avoids typos when read aloud


def new_join_code() -> str:
    s = "".join(secrets.choice(JOIN_CODE_ALPHABET) for _ in range(8))
    return f"ORG-{s[:4]}-{s[4:]}"


class Payment(models.Model):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    STATUS_CHOICES = [(PENDING, "Pending"), (SUCCESS, "Success"), (FAILED, "Failed")]

    # One Premium purchase unlocks everything — all topics, the full SPI
    # mock exam, and the AI tutor once that's enabled — for a chosen
    # duration (see PLAN_CHOICES). Access just expires at the end; no
    # auto-charge, no per-item/per-topic purchases.
    MONTHLY = "monthly"
    SIX_MONTH = "six_month"
    YEARLY = "yearly"
    PLAN_CHOICES = [
        (MONTHLY, "1 month"),
        (SIX_MONTH, "6 months"),
        (YEARLY, "12 months"),
    ]
    PLAN_DAYS = {MONTHLY: 30, SIX_MONTH: 182, YEARLY: 365}

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default=MONTHLY)
    reference = models.CharField(max_length=100, unique=True)
    amount_ghs = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    paid_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} — Premium / {self.get_plan_display()} ({self.get_status_display()})"


class Organization(models.Model):
    """A company/school/hospital that pays for a block of student seats.
    Students join with `join_code` — there's no separate company login;
    Medprime staff manage this entirely from Django admin."""

    name = models.CharField(max_length=160)
    contact_name = models.CharField(max_length=120)
    contact_email = models.EmailField(max_length=160)
    contact_phone = models.CharField(max_length=40, blank=True)
    join_code = models.CharField(max_length=20, unique=True, default=new_join_code)
    seat_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Blank = unlimited seats.")
    is_active = models.BooleanField(default=False, help_text="On once their first payment succeeds. Staff can flip it off.")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def seats_used(self):
        return self.members.count()

    def has_capacity(self):
        return self.seat_limit is None or self.seats_used < self.seat_limit


class OrgPayment(models.Model):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    STATUS_CHOICES = [(PENDING, "Pending"), (SUCCESS, "Success"), (FAILED, "Failed")]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="payments")
    reference = models.CharField(max_length=100, unique=True)
    seats = models.PositiveIntegerField()
    amount_ghs = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.organization} — {self.reference} ({self.get_status_display()})"
