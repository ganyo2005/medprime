# Ultrasound Physics Interactive Lab

Django app for Medprime Education Group's ultrasound physics course: 34 interactive
canvas simulations, quick-check quizzes, timed mock exams, verified certificates,
a Premium subscription (Paystack), an AI tutor, and a staff tool that generates new
simulation topics from a prompt via Claude.

## Stack

- Django 5.x, MySQL in production (PyMySQL driver) / SQLite for local dev
- WhiteNoise for static files, django-allauth (headless) for auth, django-axes for
  login lockout, django-ratelimit for API throttling
- Anthropic API (`claude-sonnet-5-5` for the tutor, `claude-opus-5-5` for topic
  generation) and Paystack for payments
- Frontend: plain HTML/CSS/vanilla JS, no build step, no framework — see
  `static/js/app.js` (the lab itself) and `static/js/account.js` (auth/billing UI)

## Local setup

```
python -m venv venv
venv\Scripts\activate          # Windows; source venv/bin/activate on Linux/Mac
pip install -r requirements.txt
copy .env.example .env         # fill in the blanks — see below
python manage.py migrate
python manage.py createcachetable
python manage.py createsuperuser
python manage.py runserver
```

Run the test suite with `python manage.py test` (45 tests as of this writing).

## Environment variables (`.env`, see `.env.example`)

| Variable | Notes |
|---|---|
| `SECRET_KEY` | required, never commit a real value |
| `DEBUG` | `True` locally, `False` in production |
| `ALLOWED_HOSTS` | comma-separated |
| `ADMIN_URL` | Django admin is mounted here instead of `/admin/` — keep it private |
| `DB_HOST` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_PORT` | leave `DB_HOST` blank locally to fall back to SQLite |
| `TUTOR_ENABLED` | feature flag for the AI tutor |
| `TUTOR_LIMIT_PREMIUM` | tutor questions/day per Premium user (default 3) |
| `ORG_ENROLLMENT_ENABLED` | feature flag for institutional/organization signup — currently off |
| `ANTHROPIC_API_KEY` | required for the tutor **and** the AI topic-generation staff tool; get it from console.anthropic.com (separate from any claude.ai subscription, pay-as-you-go billing) |
| `PAYSTACK_PUBLIC_KEY` / `PAYSTACK_SECRET_KEY` | from the Paystack dashboard; use live keys in production |
| `PRICE_SUB_MONTHLY_GHS` / `PRICE_SUB_SIX_MONTH_GHS` / `PRICE_SUB_YEARLY_GHS` | Premium plan prices (defaults: 60 / 175 / 350) |
| `ORG_SEAT_PRICE_GHS` | per-seat price for org enrollment (feature currently off) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | "Continue with Google" — currently off, code is commented, not deleted |
| `EMAIL_*`, `DEFAULT_FROM_EMAIL`, `ENQUIRY_NOTIFY_EMAIL` | outbound mail (password reset, enquiry form) |
| `SECURE_SSL_REDIRECT`, `CSRF_TRUSTED_ORIGINS` | only matters once `DEBUG=False`; see deployment notes below |

## Project layout

```
accounts/   custom user Profile, allauth headless adapter/signup form
payments/   Paystack integration, Payment/Organization models, org enrollment (off)
lab/        the course itself — topics, progress, certificates, AI topic authoring
tutor/      the AI tutor endpoint
site_pages/ visit counter, enquiry form
static/     app.js (the lab), lab-helpers.js (shared canvas helpers), account.js,
            auth.js, staff_topics.js (AI topic preview), app.css
```

## How Premium works

One subscription (`payments.Payment`, plan = monthly/six_month/yearly) unlocks
everything at once: all topics beyond the free first 10, the full 110-question mock
exam, and the AI tutor. There's no per-item pricing — see `accounts.Profile.is_premium`
for the single gating check used everywhere. Billing is triggered by clicking the
actual locked content (a topic, the long exam preset, or the tutor), plus a persistent
"⭐ Go Premium" button in the account bar — there's no separate marketing "unlock"
button.

## How the AI topic-authoring tool works

Staff (`is_staff=True`) can generate a brand-new simulation topic from a prompt at
`<ADMIN_URL>ai-topics/`. Claude writes the full interactive canvas code, a goal,
tip, key takeaway, clinical case, machine tip, and a 5-question quiz. Staff review it
with a **live interactive preview** (the generated code actually runs, sliders and all)
before approving — approving publishes it to the real site immediately, no further
deploy needed. See `lab/ai_topics.py` for the generation pipeline and the "AI-generated
simulation topics" plan (if still present in your Claude plans folder) for the full
design rationale, especially around why a single broken topic can't take down the
whole site (`loop()`'s try/catch in `app.js`) and why generated topics are stored as
data, never written into `app.js` itself.

## Deployment (cPanel / Phusion Passenger)

1. Upload and extract the code (exclude `.env`, `db.sqlite3`, `__pycache__`,
   `staticfiles/` — these are gitignored and shouldn't be shipped).
2. In cPanel → Setup Python App, create/point the app at this directory, then in its
   virtualenv:
   ```
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py collectstatic --noinput
   python manage.py createcachetable
   ```
3. Set every env var above through cPanel's Setup Python App UI — never via an
   uploaded `.env` file.
4. Create the MySQL database and user in cPanel → MySQL Databases, **and** add the
   user to the database with ALL PRIVILEGES (a separate step from creating each) —
   this is the single most common "Access denied" cause on a fresh deploy.
5. Confirm `ADMIN_URL` has a trailing slash, SSL is actually live before setting
   `SECURE_SSL_REDIRECT=True`, and restart the app after every env var change —
   cPanel doesn't pick up new env vars without a restart.

## Known issues / things to watch

- **Paystack card payments on live mode**: card shows as enabled in the dashboard
  and works in test mode, but live-mode card transactions have been intermittently
  stuck at "waiting for response from your card issuer" with no OTP step completing.
  This is entirely Paystack/issuing-bank side (not our code) — reported to Paystack
  support, unresolved as of this writing. Mobile money/bank transfer are unaffected.
- **Certificate re-qualification**: if staff publish new AI-generated topics, a
  learner who already qualified for a certificate under the old topic count isn't
  grandfathered in — `lab.views._issue` always re-checks against the current live
  topic count. This is intentional/inherited behavior, not a bug, but worth knowing.
- The AI topic-generation endpoint is staff-only but has no rate/cost limit — each
  generation call costs real Anthropic API credit (Opus 5.5 with extended thinking).
