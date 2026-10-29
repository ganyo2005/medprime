"""Ports netlify/functions/tutor.ts — same system prompt, same model, but a
single JSON reply instead of a streamed response (Passenger/Apache on shared
cPanel hosting doesn't reliably support chunked streaming the way Netlify's
Edge Functions did)."""

from anthropic import Anthropic
from django.conf import settings

SYSTEM = """You are the Medprime Physics AI Tutor, inside the Ultrasound Physics Interactive Lab by Medprime Education Group.
Learners are student and practising sonographers, many preparing for registry exams (e.g. ARDMS SPI).
Explain ultrasound physics clearly and accurately in plain language, linking ideas to real scanning and machine controls.
You are given the simulation the learner has open and its current settings and readouts: refer to those actual numbers,
and suggest a control to change in the simulation to see the effect for themselves.
Keep answers short (about 60-180 words) unless asked for more. Use short paragraphs or brief bullet lists, **bold** for key terms,
and show formulas with numbers worked through when calculations help. If a question is not about ultrasound, physics,
sonography or this app, politely steer back. Never give patient-specific diagnoses; this is an educational tool."""


def ask(messages, screen_context=""):
    client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    system = SYSTEM + (f"\n\nWhat the learner is looking at right now:\n{screen_context}" if screen_context else "")
    reply = client.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=700,
        system=system,
        messages=messages,
    )
    return "".join(block.text for block in reply.content if block.type == "text")
