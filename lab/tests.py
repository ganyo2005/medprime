from django.contrib.auth import get_user_model
from django.test import TestCase

from .ai_topics import _validate_shape, TopicGenerationError
from .course import BASE_TOPICS, topic_count
from .gating import filter_exam_for_access, filter_quiz_for_access
from .models import GeneratedTopic, Progress
from .progress_merge import clean_exam, clean_quiz, merge
from .views import _dynamic_topics_payload

User = get_user_model()


def _published_topic(**overrides):
    defaults = dict(
        status=GeneratedTopic.Status.PUBLISHED,
        n="Test Topic", g="A goal.", ctl=[["f", "Freq", "MHz", 1, 10, 3, 0.5]],
        d_code="T(c,'hi',10,10)", o_code="return [['x','1']]",
        tip="Try this.", lo="do a thing.", kt="A takeaway.", cs="A case.", mk="A tip.",
        quiz=[[f"Q{i}?", ["a", "b", "c"], 0] for i in range(5)],
        quiz_explanations=[f"Because {i}." for i in range(5)],
        prompt="test prompt", publish_order=1,
    )
    defaults.update(overrides)
    return GeneratedTopic.objects.create(**defaults)


class CleanQuizTests(TestCase):
    def test_drops_out_of_range_topics_and_scores(self):
        self.assertEqual(clean_quiz({"0": 3, "33": 5, "34": 2, "5": -1, "x": 1}), {"0": 3, "33": 5})

    def test_rejects_non_dict(self):
        self.assertEqual(clean_quiz(None), {})
        self.assertEqual(clean_quiz("nope"), {})


class CleanExamTests(TestCase):
    def test_filters_bad_history_entries(self):
        x = {"h": [{"d": 1, "ok": 2, "n": 5, "pc": 40}, {"d": 2, "ok": 999, "n": 5, "pc": 40}], "t": {}}
        out = clean_exam(x)
        self.assertEqual(len(out["h"]), 1)
        self.assertEqual(out["h"][0]["d"], 1)

    def test_topic_tally_requires_ok_le_total(self):
        x = {"h": [], "t": {"0": [5, 3], "1": [2, 5]}}
        out = clean_exam(x)
        self.assertEqual(out["t"], {"1": [2, 5]})


class MergeTests(TestCase):
    def test_keeps_best_quiz_score(self):
        merged = merge({"0": 3}, {"0": 2, "1": 4}, {"h": [], "t": {}, "a": None}, {"h": [], "t": {}, "a": None}, False)
        self.assertEqual(merged["quiz"], {"0": 3, "1": 4})

    def test_exam_history_dedupes_by_timestamp_and_caps_at_20(self):
        old = {"h": [{"d": i, "ok": 1, "n": 1, "pc": 100} for i in range(15)], "t": {}, "a": None}
        new = {"h": [{"d": i, "ok": 1, "n": 1, "pc": 100} for i in range(10, 25)], "t": {}, "a": None}
        merged = merge({}, {}, old, new, False)
        self.assertEqual(len(merged["exam"]["h"]), 20)
        self.assertEqual(merged["exam"]["h"][-1]["d"], 24)

    def test_in_progress_exam_kept_only_on_first_sync(self):
        old = {"h": [], "t": {}, "a": {"q": [1]}}
        new = {"h": [], "t": {}, "a": None}
        self.assertEqual(merge({}, {}, old, new, True)["exam"]["a"], {"q": [1]})
        self.assertIsNone(merge({}, {}, old, new, False)["exam"]["a"])


class GatingTests(TestCase):
    def test_user_without_premium_restricted_to_first_ten_topics(self):
        quiz = {str(i): 5 for i in range(15)}
        out = filter_quiz_for_access(quiz, has_topics=False)
        self.assertEqual(set(out.keys()), {str(i) for i in range(10)})

    def test_user_with_premium_keeps_all_topics(self):
        quiz = {str(i): 5 for i in range(15)}
        self.assertEqual(filter_quiz_for_access(quiz, has_topics=True), quiz)

    def test_user_without_exam_unlock_blocks_only_the_110q_preset(self):
        exam = {"h": [{"n": 25}, {"n": 50}, {"n": 110}], "t": {"0": [1, 1], "11": [1, 1]}, "a": {"q": list(range(50))}}
        out = filter_exam_for_access(exam, has_exam=False)
        self.assertEqual(out["h"], [{"n": 25}, {"n": 50}])
        self.assertEqual(out["t"], {"0": [1, 1], "11": [1, 1]})  # topic tallies aren't restricted for exams
        self.assertEqual(out["a"], {"q": list(range(50))})  # in-progress 50Q exam is fine, not the 110Q one

    def test_user_without_exam_unlock_loses_in_progress_110q_exam(self):
        exam = {"h": [], "t": {}, "a": {"q": list(range(110))}}
        out = filter_exam_for_access(exam, has_exam=False)
        self.assertIsNone(out["a"])


class TopicCountTests(TestCase):
    def test_zero_published_rows_returns_base(self):
        self.assertEqual(topic_count(), BASE_TOPICS)

    def test_one_published_row_adds_one(self):
        _published_topic()
        self.assertEqual(topic_count(), BASE_TOPICS + 1)

    def test_draft_and_rejected_rows_are_ignored(self):
        _published_topic(status=GeneratedTopic.Status.DRAFT, publish_order=None)
        _published_topic(status=GeneratedTopic.Status.REJECTED, publish_order=None)
        self.assertEqual(topic_count(), BASE_TOPICS)


class DynamicTopicsPayloadTests(TestCase):
    def test_only_published_rows_in_order_with_expected_shape(self):
        _published_topic(n="Second", publish_order=2)
        _published_topic(n="First", publish_order=1)
        _published_topic(n="Still a draft", status=GeneratedTopic.Status.DRAFT, publish_order=None)
        payload = _dynamic_topics_payload()
        self.assertEqual([p["n"] for p in payload], ["First", "Second"])
        self.assertEqual(
            set(payload[0].keys()), {"n", "g", "ctl", "d", "o", "tip", "lo", "kt", "cs", "mk", "qz", "qx"}
        )


class ProgressMergeDynamicTopicTests(TestCase):
    def test_clean_quiz_accepts_newly_added_topic_index(self):
        _published_topic()  # BASE_TOPICS + 1 topics now exist, valid indices 0..BASE_TOPICS
        out = clean_quiz({str(BASE_TOPICS): 3, str(BASE_TOPICS + 1): 2})
        self.assertEqual(out, {str(BASE_TOPICS): 3})

    def test_clean_exam_tally_accepts_newly_added_topic_index(self):
        _published_topic()
        out = clean_exam({"h": [], "t": {str(BASE_TOPICS): [1, 1], str(BASE_TOPICS + 1): [1, 1]}})
        self.assertEqual(out["t"], {str(BASE_TOPICS): [1, 1]})


class CertificateIssuanceDynamicTopicTests(TestCase):
    def test_issue_requires_the_new_topic_once_published(self):
        u = User.objects.create_user(username="learner1", email="learner1@example.com", password="pw12345678")
        self.client.force_login(u)
        Progress.objects.create(user=u, quiz={str(i): 5 for i in range(BASE_TOPICS)})
        r = self.client.post("/api/certificate", data='{"name":"A Learner"}', content_type="application/json")
        self.assertEqual(r.status_code, 200)  # qualifies under the base 34 topics

        _published_topic()  # now BASE_TOPICS + 1 topics are required
        r2 = self.client.post("/api/certificate", data='{"name":"A Learner"}', content_type="application/json")
        self.assertEqual(r2.status_code, 403)  # missing a quiz score for the newly added topic


class ValidateTopicShapeTests(TestCase):
    def _good(self):
        return dict(
            n="x", g="y", ctl=[["f", "Freq", "MHz", 1, 10, 3, 0.5]],
            d_code="T(c,'hi',10,10)", o_code="return [['x','1']]",
            tip="t", lo="l", kt="k", cs="c", mk="m",
            quiz=[[f"Q{i}?", ["a", "b", "c"], 0] for i in range(5)],
            quiz_explanations=[f"e{i}" for i in range(5)],
        )

    def test_accepts_well_formed_payload(self):
        out = _validate_shape(self._good())
        self.assertEqual(out["n"], "x")

    def test_rejects_missing_field(self):
        data = self._good()
        del data["tip"]
        with self.assertRaises(TopicGenerationError):
            _validate_shape(data)

    def test_rejects_wrong_quiz_length(self):
        data = self._good()
        data["quiz"] = data["quiz"][:4]
        with self.assertRaises(TopicGenerationError):
            _validate_shape(data)

    def test_rejects_bad_choice_count(self):
        data = self._good()
        data["quiz"][0] = ["Q?", ["a", "b"], 0]
        with self.assertRaises(TopicGenerationError):
            _validate_shape(data)

    def test_rejects_out_of_range_correct_index(self):
        data = self._good()
        data["quiz"][0] = ["Q?", ["a", "b", "c"], 3]
        with self.assertRaises(TopicGenerationError):
            _validate_shape(data)

    def test_rejects_forbidden_code_snippet(self):
        data = self._good()
        data["d_code"] = "fetch('/x')"
        with self.assertRaises(TopicGenerationError):
            _validate_shape(data)


class StaffTopicApproveViewTests(TestCase):
    def setUp(self):
        self.staff = User.objects.create_user(
            username="staffer", email="staffer@example.com", password="pw12345678", is_staff=True
        )
        self.normal = User.objects.create_user(username="normal", email="normal@example.com", password="pw12345678")

    def _approve_url(self, pk):
        from django.urls import reverse

        return reverse("lab_staff:staff_topic_approve", kwargs={"pk": pk})

    def test_non_staff_cannot_approve(self):
        topic = _published_topic(status=GeneratedTopic.Status.DRAFT, publish_order=None)
        self.client.force_login(self.normal)
        r = self.client.post(self._approve_url(topic.pk))
        self.assertNotEqual(r.status_code, 200)
        topic.refresh_from_db()
        self.assertEqual(topic.status, GeneratedTopic.Status.DRAFT)

    def test_staff_approval_assigns_monotonic_publish_order(self):
        self.client.force_login(self.staff)
        t1 = _published_topic(status=GeneratedTopic.Status.DRAFT, publish_order=None, n="A")
        t2 = _published_topic(status=GeneratedTopic.Status.DRAFT, publish_order=None, n="B")
        self.client.post(self._approve_url(t1.pk))
        self.client.post(self._approve_url(t2.pk))
        t1.refresh_from_db()
        t2.refresh_from_db()
        self.assertEqual(t1.status, GeneratedTopic.Status.PUBLISHED)
        self.assertEqual(t2.publish_order, t1.publish_order + 1)

    def test_cannot_double_approve(self):
        self.client.force_login(self.staff)
        topic = _published_topic(status=GeneratedTopic.Status.DRAFT, publish_order=None)
        r1 = self.client.post(self._approve_url(topic.pk))
        self.assertEqual(r1.status_code, 302)
        r2 = self.client.post(self._approve_url(topic.pk))
        self.assertEqual(r2.status_code, 404)
