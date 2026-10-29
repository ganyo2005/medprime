"""Generates a new simulation topic from a staff prompt via the Anthropic API.

Mirrors payments/services.py's PaystackError pattern: a dedicated exception
carrying a real, specific message, never a bare 500. See lab/models.py's
GeneratedTopic for the row this writes, and the "AI-generated simulation
topics" plan for why this exists and what it deliberately does and doesn't
guard against (the denylist below is a tripwire for accidents, not a security
boundary — real containment is the client-side sandboxing in staff_topics.js
and the try/catch hardening in app.js)."""

from anthropic import Anthropic
from django.conf import settings

from .models import GeneratedTopic

MODEL = "claude-opus-5-5"

# One full existing topic (index 0, "Wave Properties"), copied verbatim from
# static/js/app.js/lab-helpers.js, as a concrete style/shape reference.
STYLE_EXAMPLE = """{n:'Wave Properties',g:'See how frequency, wavelength and speed are linked: c = f × λ.',
ctl:[['f','Frequency','MHz',1,10,3,.5],['a','Amplitude','',1,10,5,1],['m','Medium',K.slice(0,4),0]],
d(c,t,v){const cs=M[K[v.m]][1],lam=cs/v.f/1e3,Lw=lam*80,A=v.a*13,mid=190;
c.setLineDash([4,5]);[-A,0,A].forEach(o=>ln(c,0,mid+o,W,mid+o,'#1d4d8f',1));c.setLineDash([]);
c.strokeStyle='#fcd034';c.lineWidth=3;c.beginPath();for(let x=0;x<=W;x++){const y=mid-A*Math.sin(6.2832*(x/Lw-t*.7));x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
let x1=Lw*((.25+t*.7)%1);while(x1<50)x1+=Lw;
ln(c,x1,44,x1+Lw,44,'#ff3b30',3);ln(c,x1,36,x1,52,'#ff3b30',3);ln(c,x1+Lw,36,x1+Lw,52,'#ff3b30',3);
T(c,'λ = '+lam.toFixed(2)+' mm',x1+Lw/2,28,'#ff3b30',14,'center');T(c,'Amplitude',W-10,mid-A-6,'#9db4d8',12,'right');T(c,'Wave travels →  (view width = 10 mm)',10,H-12)},
o:v=>{const cs=M[K[v.m]][1],lam=cs/v.f/1e3;return[['Wavelength',lam.toFixed(3)+' mm'],['Period',(1/v.f).toFixed(3)+' µs'],['Speed (c)',cs+' m/s'],['Check: f × λ',Math.round(v.f*lam*1e3)+' m/s']]},
tip:'Try this: raise the frequency and the wavelength shrinks. Switch the medium to bone: same frequency, longer wavelength. Frequency comes from the source, speed from the medium, wavelength follows.'}

// lo (learning outcome): "explain how frequency, wavelength and speed are linked, and work out the wavelength in soft tissue."
// kt (key takeaway): "c = f × λ: frequency comes from the source, speed from the medium, and wavelength follows."
// cs (clinical case): "At a rural outreach clinic a sonographer swaps a 3.5 MHz curvilinear probe for a 10 MHz linear probe to scan a swollen thyroid. The wavelength falls from about 0.44 mm to about 0.15 mm, and the gland looks much sharper."
// mk (on your machine): "Probe choice: swap between, say, a 3.5 MHz curvilinear and a 10 MHz linear probe to change frequency and wavelength."
// quiz[0]: ["If frequency doubles in soft tissue, wavelength…", ["doubles","halves","stays the same"], 1]
// quiz_explanations[0]: "Wavelength and frequency are inversely related at a fixed speed: λ = c ÷ f. Doubling f in soft tissue (c = 1540 m/s) halves λ, for example 0.77 mm at 2 MHz becomes 0.385 mm at 4 MHz."
"""

SYSTEM = f"""You write one new interactive simulation topic for the Ultrasound Physics Interactive Lab,
a paid course by Medprime Education Group. Learners are student and practising sonographers, many
preparing for registry exams (e.g. ARDMS SPI). Explain ultrasound physics clearly and accurately,
in the same style and difficulty as the rest of this course.

Your d(c,t,v) and o(v) code runs in a plain browser <script> (no build step, no modules) alongside
every other topic, sharing these globals — call them, never redeclare them:
  W=800, H=340                — canvas size
  M                           — {{'Soft tissue':[Z,speed m/s,color], 'Fat':[...], 'Muscle':[...], 'Bone':[...], 'Air':[...]}}
  K = Object.keys(M)          — ['Soft tissue','Fat','Muscle','Bone','Air']
  AT                          — attenuation coefficients array, index-matched to K
  T(c,text,x,y,color,size,align)   — draws canvas text
  ln(c,x1,y1,x2,y2,color,width)    — draws a canvas line
  WR(c,text,x,y,maxWidth,lineHeight,color,size)  — word-wrapped canvas text, returns next y
  P(v)                        — reflection/refraction helper; v={{a,b,th}} (medium indices + angle°) -> {{z1,c1,k1,z2,c2,k2,th,R,tir,tt}}
  ZT                          — [[name, impedance], ...] lookup table
  SCI(n)                      — returns {{cv, s}}, a cached speckle-pattern canvas for n-angle compounding

d(c,t,v): c is the 2D canvas context, t is seconds elapsed, v is the current control values object
(keyed by each control's first element — see ctl below). Draw directly with c.* canvas calls and the
helpers above. Keep every frame fast — no loops over more than a few thousand iterations, no network
or timers, nothing that blocks.

o(v): returns an array of [label, valueString] pairs shown as readouts under the canvas. 3-5 pairs is typical.

ctl is an array of control definitions, each either:
  slider: [key, label, unit (plain string, '' if none), min, max, default, step]
  select: [key, label, choicesArray (array of strings), defaultIndex]
2-4 controls is typical.

quiz is exactly 5 entries, each [questionText, [choice0,choice1,choice2], correctIndex(0-2)] — like the
real exam/registry questions this course already uses. quiz_explanations is exactly 5 strings, same
order, each explaining why the correct answer is right (and briefly why a common wrong answer is wrong),
in the same thorough style as the rest of this course.

tip: one "try this" sentence suggesting what to change and what the learner will see.
lo: one sentence completing "After this tab you can: …".
kt: one short, quotable key-takeaway sentence (often with a formula).
cs: one short real-world clinical/scanning scenario paragraph.
mk: one sentence connecting this to an actual control on a real ultrasound machine.

Here is one complete, real topic from this course, verbatim, as your style and shape reference:
{STYLE_EXAMPLE}

Hard rules: do not use document, window, fetch, XMLHttpRequest, import, eval, localStorage, cookies,
or any network/storage API. Do not redeclare W, H, M, K, AT, T, ln, WR, P, ZT, or SCI. Stay strictly on
ultrasound physics/sonography topics appropriate for this course.

You MUST call the submit_topic tool exactly once with your complete result. Do not reply in plain text."""

TOOL_SCHEMA = {
    "name": "submit_topic",
    "description": "Submit one complete ultrasound-physics simulation topic for the course.",
    "input_schema": {
        "type": "object",
        "required": ["n", "g", "ctl", "d_code", "o_code", "tip", "lo", "kt", "cs", "mk", "quiz", "quiz_explanations"],
        "properties": {
            "n": {"type": "string", "description": "Short topic name, e.g. 'Beam Steering & Phased Arrays'."},
            "g": {"type": "string", "description": "One-sentence goal, shown under the topic name."},
            "ctl": {"type": "array", "description": "Control definitions — see system prompt for the two shapes."},
            "d_code": {
                "type": "string",
                "description": "JS statements for function d(c,t,v){...} — the function body only, no 'function d(...)' wrapper.",
            },
            "o_code": {
                "type": "string",
                "description": "JS statements for function o(v){ return [[label,value],...] } — body only.",
            },
            "tip": {"type": "string"},
            "lo": {"type": "string"},
            "kt": {"type": "string"},
            "cs": {"type": "string"},
            "mk": {"type": "string"},
            "quiz": {
                "type": "array",
                "minItems": 5,
                "maxItems": 5,
                "items": {
                    "type": "array",
                    "minItems": 3,
                    "maxItems": 3,
                },
                "description": "Exactly 5 entries, each [questionText, [choice0,choice1,choice2], correctIndex 0-2].",
            },
            "quiz_explanations": {"type": "array", "minItems": 5, "maxItems": 5, "items": {"type": "string"}},
        },
    },
}

_FORBIDDEN_SNIPPETS = (
    "document.", "window.", "fetch(", "XMLHttpRequest", "import(", "import ", "eval(",
    "<script", "localStorage", "sessionStorage", "document.cookie", "cookie=",
)


class TopicGenerationError(Exception):
    """Carries Anthropic's own error detail, or a description of why the
    model's reply didn't match the required shape — see payments.services.PaystackError
    for the precedent this follows."""


def _validate_shape(data: dict) -> dict:
    required = ("n", "g", "ctl", "d_code", "o_code", "tip", "lo", "kt", "cs", "mk", "quiz", "quiz_explanations")
    for key in required:
        if key not in data:
            raise TopicGenerationError(f"The AI's reply is missing \"{key}\".")

    for key in ("n", "g", "d_code", "o_code", "tip", "lo", "kt", "cs", "mk"):
        if not isinstance(data[key], str) or not data[key].strip():
            raise TopicGenerationError(f"\"{key}\" must be a non-empty string.")

    for key in ("d_code", "o_code"):
        code = data[key]
        if len(code) > 20_000:
            raise TopicGenerationError(f"\"{key}\" is too long ({len(code)} chars) — ask for something simpler.")
        hit = next((s for s in _FORBIDDEN_SNIPPETS if s in code), None)
        if hit:
            raise TopicGenerationError(f"\"{key}\" contains \"{hit}\", which isn't allowed. Try regenerating.")

    if not isinstance(data["ctl"], list) or not (1 <= len(data["ctl"]) <= 6):
        raise TopicGenerationError("\"ctl\" must be a list of 1-6 control definitions.")
    for c in data["ctl"]:
        if not isinstance(c, list) or len(c) < 4:
            raise TopicGenerationError("Each control definition must be a list of at least 4 items.")

    quiz = data["quiz"]
    if not isinstance(quiz, list) or len(quiz) != 5:
        raise TopicGenerationError("\"quiz\" must have exactly 5 questions.")
    for q in quiz:
        if (
            not isinstance(q, list)
            or len(q) != 3
            or not isinstance(q[0], str)
            or not isinstance(q[1], list)
            or len(q[1]) != 3
            or not all(isinstance(c, str) for c in q[1])
            or not isinstance(q[2], int)
            or isinstance(q[2], bool)
            or not (0 <= q[2] <= 2)
        ):
            raise TopicGenerationError("Each quiz question must be [text, [3 choices], correctIndex 0-2].")

    explanations = data["quiz_explanations"]
    if not isinstance(explanations, list) or len(explanations) != 5 or not all(isinstance(e, str) and e.strip() for e in explanations):
        raise TopicGenerationError("\"quiz_explanations\" must have exactly 5 non-empty strings.")

    return {
        "n": data["n"][:120], "g": data["g"][:300], "ctl": data["ctl"],
        "d_code": data["d_code"], "o_code": data["o_code"],
        "tip": data["tip"], "lo": data["lo"], "kt": data["kt"], "cs": data["cs"], "mk": data["mk"],
        "quiz": quiz, "quiz_explanations": explanations,
    }


def generate_topic_draft(prompt: str, user) -> GeneratedTopic:
    client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    try:
        reply = client.messages.create(
            model=MODEL,
            max_tokens=16000,
            thinking={"type": "adaptive"},
            system=SYSTEM,
            tools=[TOOL_SCHEMA],
            tool_choice={"type": "auto"},
            messages=[{"role": "user", "content": f"Create a new topic: {prompt}"}],
        )
    except Exception as e:
        raise TopicGenerationError(f"Anthropic API error: {e}") from e

    tool_use = next((b for b in reply.content if b.type == "tool_use" and b.name == "submit_topic"), None)
    if tool_use is None:
        raise TopicGenerationError("The AI did not return a structured topic. Try rephrasing the prompt.")

    data = _validate_shape(tool_use.input)
    return GeneratedTopic.objects.create(
        status=GeneratedTopic.Status.DRAFT,
        prompt=prompt,
        model_used=MODEL,
        created_by=user,
        raw_response=reply.model_dump(mode="json"),
        **data,
    )
