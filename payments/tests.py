import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from .models import Organization, Payment

User = get_user_model()


class InitializePremiumTests(TestCase):
    """Exercises exactly the request shape the browser's startCheckout() sends."""

    def setUp(self):
        self.user = User.objects.create_user(username="buyer", email="buyer@example.com", password="pw12345678")
        self.client.force_login(self.user)

    @patch("payments.views.initialize_transaction", return_value={"access_code": "AC_TEST"})
    def test_unknown_plan_is_rejected(self, mock_init):
        r = self.client.post(
            "/api/payments/initialize", data=json.dumps({"plan": "weekly"}), content_type="application/json"
        )
        self.assertEqual(r.status_code, 400)

    @patch("payments.views.initialize_transaction", return_value={"access_code": "AC_TEST"})
    def test_valid_plan_succeeds(self, mock_init):
        r = self.client.post(
            "/api/payments/initialize", data=json.dumps({"plan": "monthly"}), content_type="application/json"
        )
        self.assertEqual(r.status_code, 200)
        payment = Payment.objects.get(reference=r.json()["reference"])
        self.assertEqual(payment.plan, Payment.MONTHLY)
        self.assertEqual(payment.amount_ghs, 60)


class OrgEnrollmentDisabledByDefaultTests(TestCase):
    def test_signup_page_is_404_while_taken_out(self):
        self.assertEqual(self.client.get("/enrol/").status_code, 404)

    def test_join_is_404_while_taken_out(self):
        u = User.objects.create_user(username="s", email="s@example.com", password="pw12345678")
        self.client.force_login(u)
        r = self.client.post("/api/payments/org/join", data=json.dumps({"code": "ORG-TEST-CODE"}), content_type="application/json")
        self.assertEqual(r.status_code, 404)


@override_settings(ORG_ENROLLMENT_ENABLED=True)
class OrgJoinViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="student1", email="student1@example.com", password="pw12345678")
        self.client.force_login(self.user)

    def test_join_with_valid_code_grants_premium(self):
        org = Organization.objects.create(name="Test Hospital", contact_name="Jane", contact_email="jane@test.com", seat_limit=2, is_active=True)
        r = self.client.post("/api/payments/org/join", data=json.dumps({"code": org.join_code}), content_type="application/json")
        self.assertEqual(r.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.profile.is_premium)
        self.assertEqual(org.seats_used, 1)

    def test_join_with_invalid_code_fails(self):
        r = self.client.post("/api/payments/org/join", data=json.dumps({"code": "ORG-FAKE-CODE"}), content_type="application/json")
        self.assertEqual(r.status_code, 404)

    def test_join_rejected_when_org_full(self):
        org = Organization.objects.create(name="Full Co", contact_name="J", contact_email="j@test.com", seat_limit=1, is_active=True)
        other = User.objects.create_user(username="student0", email="student0@example.com", password="pw12345678")
        other.profile.organization = org
        other.profile.save()
        r = self.client.post("/api/payments/org/join", data=json.dumps({"code": org.join_code}), content_type="application/json")
        self.assertEqual(r.status_code, 403)

    def test_join_rejected_when_org_not_yet_active(self):
        org = Organization.objects.create(name="Pending Co", contact_name="J", contact_email="j@test.com", is_active=False)
        r = self.client.post("/api/payments/org/join", data=json.dumps({"code": org.join_code}), content_type="application/json")
        self.assertEqual(r.status_code, 404)


class OrganizationCapacityTests(TestCase):
    def test_has_capacity_when_unlimited(self):
        org = Organization.objects.create(name="Acme", contact_name="A", contact_email="a@example.com", seat_limit=None)
        self.assertTrue(org.has_capacity())

    def test_has_capacity_respects_seat_limit(self):
        org = Organization.objects.create(name="Acme", contact_name="A", contact_email="a@example.com", seat_limit=1)
        self.assertTrue(org.has_capacity())
        u = User.objects.create_user(username="s1", email="s1@example.com", password="x")
        u.profile.organization = org
        u.profile.save()
        self.assertFalse(org.has_capacity())

    def test_profile_is_premium_via_active_organization(self):
        org = Organization.objects.create(name="Acme", contact_name="A", contact_email="a@example.com", is_active=True)
        u = User.objects.create_user(username="s2", email="s2@example.com", password="x")
        u.profile.organization = org
        u.profile.save()
        self.assertTrue(u.profile.is_premium)

    def test_profile_not_premium_when_organization_inactive(self):
        org = Organization.objects.create(name="Acme", contact_name="A", contact_email="a@example.com", is_active=False)
        u = User.objects.create_user(username="s3", email="s3@example.com", password="x")
        u.profile.organization = org
        u.profile.save()
        self.assertFalse(u.profile.is_premium)
