from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone

from payments.models import Payment

User = get_user_model()


@override_settings(TUTOR_ENABLED=False)
class TutorDisabledTests(TestCase):
    def test_tutor_is_404_when_flagged_off(self):
        r = self.client.post("/api/tutor/ask", data='{"messages":[{"role":"user","content":"hi"}]}', content_type="application/json")
        self.assertEqual(r.status_code, 404)


@override_settings(TUTOR_ENABLED=True)
class TutorPremiumGateTests(TestCase):
    def test_anonymous_user_gets_403(self):
        r = self.client.post("/api/tutor/ask", data='{"messages":[{"role":"user","content":"hi"}]}', content_type="application/json")
        self.assertEqual(r.status_code, 403)

    def test_free_logged_in_user_gets_403(self):
        u = User.objects.create_user(username="free1", email="free1@example.com", password="pw12345678")
        self.client.force_login(u)
        r = self.client.post("/api/tutor/ask", data='{"messages":[{"role":"user","content":"hi"}]}', content_type="application/json")
        self.assertEqual(r.status_code, 403)

    @patch("tutor.views.ask", return_value="Here's the explanation.")
    def test_premium_user_can_ask(self, mock_ask):
        u = User.objects.create_user(username="premium1", email="premium1@example.com", password="pw12345678")
        Payment.objects.create(
            user=u, plan=Payment.MONTHLY, reference="MPLAB-test", amount_ghs=60,
            status=Payment.SUCCESS, expires_at=timezone.now() + timedelta(days=30),
        )
        self.client.force_login(u)
        r = self.client.post("/api/tutor/ask", data='{"messages":[{"role":"user","content":"hi"}]}', content_type="application/json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["reply"], "Here's the explanation.")

    def test_user_with_expired_premium_gets_403(self):
        u = User.objects.create_user(username="expired1", email="expired1@example.com", password="pw12345678")
        Payment.objects.create(
            user=u, plan=Payment.MONTHLY, reference="MPLAB-test3", amount_ghs=60,
            status=Payment.SUCCESS, expires_at=timezone.now() - timedelta(days=1),
        )
        self.client.force_login(u)
        r = self.client.post("/api/tutor/ask", data='{"messages":[{"role":"user","content":"hi"}]}', content_type="application/json")
        self.assertEqual(r.status_code, 403)

    @override_settings(TUTOR_LIMIT_PREMIUM=3)
    @patch("tutor.views.ask", return_value="ok")
    def test_premium_user_is_capped_at_daily_limit(self, mock_ask):
        u = User.objects.create_user(username="premium2", email="premium2@example.com", password="pw12345678")
        Payment.objects.create(
            user=u, plan=Payment.MONTHLY, reference="MPLAB-test4", amount_ghs=60,
            status=Payment.SUCCESS, expires_at=timezone.now() + timedelta(days=30),
        )
        self.client.force_login(u)
        for _ in range(3):
            r = self.client.post("/api/tutor/ask", data='{"messages":[{"role":"user","content":"hi"}]}', content_type="application/json")
            self.assertEqual(r.status_code, 200)
        r = self.client.post("/api/tutor/ask", data='{"messages":[{"role":"user","content":"hi"}]}', content_type="application/json")
        self.assertEqual(r.status_code, 429)
