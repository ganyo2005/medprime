"""Server-side enforcement of the free/premium split — the client hides locked
topics and exam lengths in the UI, but the server must not trust that alone
(same "don't trust the client" principle netlify/functions/progress.ts used
for field validation)."""

from .course import FREE_TOPIC_COUNT, PREMIUM_EXAM_QUESTION_COUNT


def filter_quiz_for_access(quiz: dict, has_topics: bool) -> dict:
    if has_topics:
        return quiz
    return {k: v for k, v in quiz.items() if int(k) < FREE_TOPIC_COUNT}


def filter_exam_for_access(exam: dict, has_exam: bool) -> dict:
    """Only the 110-question "Full exam (SPI-style)" preset needs the exam
    unlock — the shorter presets (25/50 Q) are free and draw from every
    topic's quiz bank regardless. Topic-level simulation access is gated
    separately by filter_quiz_for_access (a different purchase)."""
    if has_exam:
        return exam
    h = [e for e in exam.get("h", []) if e.get("n") != PREMIUM_EXAM_QUESTION_COUNT]
    a = exam.get("a")
    if a and len(a.get("q", [])) == PREMIUM_EXAM_QUESTION_COUNT:
        a = None
    return {"h": h, "t": exam.get("t", {}), "a": a}
