"""Ports the exact validation/merge logic from netlify/functions/progress.ts,
so progress saved on one device never clobbers progress saved on another."""

from .course import QUESTIONS, topic_count


def _is_int(x, lo, hi) -> bool:
    return isinstance(x, int) and not isinstance(x, bool) and lo <= x <= hi


def clean_quiz(q) -> dict:
    out = {}
    tmax = topic_count() - 1
    if isinstance(q, dict):
        for k, v in q.items():
            try:
                ik = int(k)
            except (TypeError, ValueError):
                continue
            if _is_int(ik, 0, tmax) and _is_int(v, 0, QUESTIONS):
                out[str(ik)] = v
    return out


def clean_exam(x) -> dict:
    x = x or {}
    tmax = topic_count() - 1
    h = []
    for e in x.get("h") or []:
        if (
            isinstance(e, dict)
            and _is_int(e.get("d"), 0, 9_000_000_000_000_000)
            and _is_int(e.get("ok"), 0, 500)
            and _is_int(e.get("n"), 1, 500)
            and _is_int(e.get("pc"), 0, 100)
        ):
            h.append({"d": e["d"], "m": str(e.get("m") or "")[:80], "ok": e["ok"], "n": e["n"], "pc": e["pc"]})
    t = {}
    tt = x.get("t")
    if isinstance(tt, dict):
        for k, v in tt.items():
            try:
                ik = int(k)
            except (TypeError, ValueError):
                continue
            if _is_int(ik, 0, tmax) and isinstance(v, list) and len(v) == 2 and _is_int(v[1], 0, 1_000_000) and _is_int(v[0], 0, v[1]):
                t[str(ik)] = [v[0], v[1]]
    a = x.get("a")
    a = a if isinstance(a, dict) else None
    return {"h": h, "t": t, "a": a}


def merge(old_quiz, new_quiz, old_exam, new_exam, first: bool) -> dict:
    """Best score per quiz, every exam in the history (deduped by timestamp,
    capped at 20), the larger tally per topic, and the incoming in-progress
    exam (on first sync after login, a saved in-progress exam is kept if this
    device has none)."""
    quiz = dict(old_quiz)
    for k, v in new_quiz.items():
        quiz[k] = max(quiz.get(k, 0), v)

    seen = {}
    for e in [*old_exam["h"], *new_exam["h"]]:
        seen[e["d"]] = e
    h = sorted(seen.values(), key=lambda e: e["d"])[-20:]

    t = dict(old_exam["t"])
    for k, v in new_exam["t"].items():
        if k not in t or v[1] >= t[k][1]:
            t[k] = v

    a = new_exam["a"] if new_exam["a"] is not None else (old_exam["a"] if first else None)
    return {"quiz": quiz, "exam": {"h": h, "t": t, "a": a}}
