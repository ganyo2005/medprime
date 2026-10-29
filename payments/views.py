import json
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt, csrf_protect, ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .models import Organization, OrgPayment, Payment
from .services import PaystackError, initialize_transaction, new_reference, verify_transaction, verify_webhook_signature


PRICE_BY_PLAN = {
    Payment.MONTHLY: "PRICE_SUB_MONTHLY_GHS",
    Payment.SIX_MONTH: "PRICE_SUB_SIX_MONTH_GHS",
    Payment.YEARLY: "PRICE_SUB_YEARLY_GHS",
}


@login_required
@require_POST
def initialize(request):
    try:
        body = json.loads(request.body)
    except (ValueError, TypeError):
        return JsonResponse({"error": "Bad request"}, status=400)
    plan = body.get("plan")
    if plan not in PRICE_BY_PLAN:
        return JsonResponse({"error": "Unknown plan"}, status=400)

    if not request.user.email:
        return JsonResponse({"error": "Your account needs a valid email before you can pay. Please update it and try again."}, status=400)

    reference = new_reference("MPLAB")
    amount_ghs = getattr(settings, PRICE_BY_PLAN[plan])
    payment = Payment.objects.create(user=request.user, plan=plan, reference=reference, amount_ghs=amount_ghs)
    callback_url = request.build_absolute_uri(reverse("payments:status"))
    try:
        data = initialize_transaction(
            email=request.user.email,
            amount_ghs=payment.amount_ghs,
            reference=reference,
            callback_url=callback_url,
        )
    except PaystackError as e:
        payment.status = Payment.FAILED
        payment.save(update_fields=["status"])
        return JsonResponse({"error": str(e)}, status=502)
    return JsonResponse({"reference": reference, "access_code": data["access_code"]})


@login_required
def status(request):
    profile = request.user.profile
    for pending in request.user.payments.filter(status=Payment.PENDING):
        _reconcile(pending)
    return JsonResponse({"is_premium": profile.is_premium})


def _reconcile(payment):
    """Shared by Payment and OrgPayment — both have status/paid_at/reference fields."""
    try:
        data = verify_transaction(payment.reference)
    except PaystackError:
        return payment.status  # leave it pending; the next poll/webhook try again
    if data.get("status") == "success":
        payment.status = payment.SUCCESS
        payment.paid_at = timezone.now()
        update_fields = ["status", "paid_at"]
        if hasattr(payment, "plan"):  # Payment (subscription) — OrgPayment has no plan/expiry
            payment.expires_at = payment.paid_at + timedelta(days=Payment.PLAN_DAYS[payment.plan])
            update_fields.append("expires_at")
        payment.save(update_fields=update_fields)
    elif data.get("status") in ("failed", "abandoned"):
        payment.status = payment.FAILED
        payment.save(update_fields=["status"])
    return payment.status


def _activate_org(org_payment):
    org = org_payment.organization
    if org.seat_limit is not None:
        org.seat_limit = org.seat_limit + org_payment.seats
    org.is_active = True
    org.save(update_fields=["seat_limit", "is_active"])
    try:
        send_mail(
            subject="Your Ultrasound Physics Lab organization access is ready",
            message=(
                f"Thanks for enrolling {org.name} with the Ultrasound Physics Interactive Lab.\n\n"
                f"Your join code is: {org.join_code}\n\n"
                f"Share this with your students. Each one creates their own free account on the site "
                f"and enters this code from their dashboard to unlock full access — no further payment needed.\n\n"
                f"Seats purchased so far: {org.seat_limit if org.seat_limit is not None else 'unlimited'}.\n\n"
                "Medprime Education Group"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[org.contact_email],
            fail_silently=True,
        )
    except Exception:
        pass


@csrf_exempt
@require_POST
def webhook(request):
    signature = request.headers.get("x-paystack-signature", "")
    if not verify_webhook_signature(request.body, signature):
        return JsonResponse({"error": "invalid signature"}, status=403)

    event = json.loads(request.body)
    if event.get("event") == "charge.success":
        reference = event["data"]["reference"]
        payment = Payment.objects.filter(reference=reference).first()
        if payment:
            if payment.status != Payment.SUCCESS:
                _reconcile(payment)
            return JsonResponse({"ok": True})

        org_payment = OrgPayment.objects.filter(reference=reference).first()
        if org_payment and org_payment.status != OrgPayment.SUCCESS:
            if _reconcile(org_payment) == OrgPayment.SUCCESS:
                _activate_org(org_payment)
    return JsonResponse({"ok": True})


# ---------- Organization enrollment (self-serve, no company login) ----------

@ensure_csrf_cookie
def org_signup_page(request):
    if not settings.ORG_ENROLLMENT_ENABLED:
        return render(request, "payments/org_unavailable.html", status=404)
    return render(request, "payments/org_signup.html", {"price_per_seat": settings.ORG_SEAT_PRICE_GHS})


@require_POST
@csrf_protect
def org_initialize(request):
    if not settings.ORG_ENROLLMENT_ENABLED:
        return JsonResponse({"error": "Organization enrollment isn't available right now."}, status=404)
    try:
        body = json.loads(request.body)
    except (ValueError, TypeError):
        return JsonResponse({"error": "Bad request"}, status=400)

    name = str(body.get("name") or "").strip()[:160]
    contact_name = str(body.get("contact_name") or "").strip()[:120]
    contact_email = str(body.get("contact_email") or "").strip()[:160]
    contact_phone = str(body.get("contact_phone") or "").strip()[:40]
    try:
        seats = int(body.get("seats"))
    except (TypeError, ValueError):
        seats = 0
    if not name or not contact_name or not contact_email or not (1 <= seats <= 10000):
        return JsonResponse({"error": "Please fill in all fields with a valid number of seats."}, status=400)

    org = Organization.objects.create(
        name=name, contact_name=contact_name, contact_email=contact_email, contact_phone=contact_phone
    )
    amount_ghs = seats * settings.ORG_SEAT_PRICE_GHS
    reference = new_reference("MPORG")
    org_payment = OrgPayment.objects.create(organization=org, reference=reference, seats=seats, amount_ghs=amount_ghs)
    callback_url = request.build_absolute_uri(reverse("payments:org_signup_page"))
    try:
        data = initialize_transaction(email=contact_email, amount_ghs=amount_ghs, reference=reference, callback_url=callback_url)
    except PaystackError as e:
        org_payment.status = OrgPayment.FAILED
        org_payment.save(update_fields=["status"])
        return JsonResponse({"error": str(e)}, status=502)
    return JsonResponse({"reference": org_payment.reference, "access_code": data["access_code"]})


@require_GET
def org_status(request):
    reference = request.GET.get("reference", "")
    org_payment = OrgPayment.objects.filter(reference=reference).first()
    if not org_payment:
        return JsonResponse({"error": "Not found"}, status=404)
    if org_payment.status == OrgPayment.PENDING:
        if _reconcile(org_payment) == OrgPayment.SUCCESS:
            _activate_org(org_payment)
            org_payment.refresh_from_db()
    if org_payment.status == OrgPayment.SUCCESS:
        return JsonResponse({"status": "success", "join_code": org_payment.organization.join_code})
    return JsonResponse({"status": org_payment.status})


@login_required
@require_http_methods(["POST"])
@csrf_protect
def org_join(request):
    if not settings.ORG_ENROLLMENT_ENABLED:
        return JsonResponse({"error": "Organization enrollment isn't available right now."}, status=404)
    try:
        body = json.loads(request.body)
    except (ValueError, TypeError):
        return JsonResponse({"error": "Bad request"}, status=400)
    code = str(body.get("code") or "").strip().upper()
    org = Organization.objects.filter(join_code=code, is_active=True).first()
    if not org:
        return JsonResponse({"error": "That code wasn't recognised. Check it and try again."}, status=404)
    if not org.has_capacity():
        return JsonResponse({"error": "This organization's seats are all in use. Ask them to add more seats."}, status=403)
    profile = request.user.profile
    profile.organization = org
    profile.save(update_fields=["organization"])
    return JsonResponse({"ok": True, "organization": org.name})
