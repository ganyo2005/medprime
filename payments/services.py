import hashlib
import hmac
import secrets

import requests
from django.conf import settings

PAYSTACK_BASE = "https://api.paystack.co"


class PaystackError(Exception):
    """Carries Paystack's own error message, not just the HTTP status —
    raise_for_status() alone discards exactly the detail needed to debug this."""


def _headers():
    return {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}", "Content-Type": "application/json"}


def new_reference(prefix="MPLAB"):
    return f"{prefix}-" + secrets.token_hex(8)


def _raise_with_paystack_message(r):
    try:
        message = r.json().get("message", r.text)
    except ValueError:
        message = r.text
    raise PaystackError(f"Paystack {r.status_code}: {message}")


def initialize_transaction(*, email, amount_ghs, reference, callback_url):
    """Starts a Paystack transaction. Amount is converted to the smallest
    currency unit (pesewas) as the API requires."""
    r = requests.post(
        f"{PAYSTACK_BASE}/transaction/initialize",
        json={
            "email": email,
            "amount": amount_ghs * 100,
            "currency": "GHS",
            "reference": reference,
            "callback_url": callback_url,
        },
        headers=_headers(),
        timeout=15,
    )
    if not r.ok:
        _raise_with_paystack_message(r)
    return r.json()["data"]


def verify_transaction(reference):
    """Server-side confirmation — never trust a client-reported status alone."""
    r = requests.get(f"{PAYSTACK_BASE}/transaction/verify/{reference}", headers=_headers(), timeout=15)
    if not r.ok:
        _raise_with_paystack_message(r)
    return r.json()["data"]


def verify_webhook_signature(raw_body: bytes, signature: str) -> bool:
    expected = hmac.new(settings.PAYSTACK_SECRET_KEY.encode(), raw_body, hashlib.sha512).hexdigest()
    return hmac.compare_digest(expected, signature or "")
