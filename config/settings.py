"""
Django settings for the Ultrasound Physics Interactive Lab (Medprime Education Group).

Local dev defaults to SQLite so `manage.py runserver` works with zero setup.
Production (Namecheap cPanel) sets DB_HOST (etc.) as environment variables,
which switches DATABASES to MySQL automatically — see the DATABASES block below.
"""

from pathlib import Path

from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY", default="dev-insecure-secret-key-change-me")
DEBUG = config("DEBUG", default=True, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

SITE_ID = 1

# Not "admin/" on purpose — bots scan for that path specifically. Override
# ADMIN_URL in production (cPanel env vars) to something only staff know.
ADMIN_URL = config("ADMIN_URL", default="staff-portal/")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "allauth",
    "allauth.account",
    "allauth.headless",
    "allauth.socialaccount",
    # Google sign-in taken out for now (no real OAuth credentials yet) —
    # re-add "allauth.socialaccount.providers.google" plus the
    # SOCIALACCOUNT_PROVIDERS block below when ready; no migrations involved.
    "accounts",
    "payments",
    "lab",
    "tutor",
    "site_pages",
    "axes",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "axes.middleware.AxesMiddleware",  # must stay last: locks out brute-forced logins (admin included)
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ---------- Database ----------
# cPanel sets DB_HOST (and friends) as env vars for the live MySQL database.
# With none set (local dev), fall back to SQLite — no local MySQL required.
if config("DB_HOST", default=""):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": config("DB_NAME"),
            "USER": config("DB_USER"),
            "PASSWORD": config("DB_PASSWORD"),
            "HOST": config("DB_HOST"),
            "PORT": config("DB_PORT", default="3306"),
            "OPTIONS": {"charset": "utf8mb4"},
        }
    }
    # cPanel's shared hosting has no mysqlclient build toolchain available;
    # PyMySQL (pure Python) stands in for the MySQLdb driver Django expects.
    import pymysql

    pymysql.install_as_MySQLdb()
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTHENTICATION_BACKENDS = [
    "axes.backends.AxesStandaloneBackend",  # must stay first: axes checks the lockout before any real backend runs
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

# ---------- django-axes: locks out brute-forced logins on every login form (Django admin included) ----------
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = 1  # hours
AXES_LOCKOUT_PARAMETERS = ["ip_address", "username"]
AXES_RESET_ON_SUCCESS = True

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ---------- Static files ----------
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------- Cache (used for AI-tutor burst rate-limiting; no Redis on shared cPanel) ----------
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.db.DatabaseCache",
        "LOCATION": "django_cache_table",
    }
}

# ---------- Email ----------
EMAIL_BACKEND = config(
    "EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend" if DEBUG else "django.core.mail.backends.smtp.EmailBackend"
)
EMAIL_HOST = config("EMAIL_HOST", default="")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="Medprime Education Group <no-reply@medprimeeducationgroup.com>")
ENQUIRY_NOTIFY_EMAIL = config("ENQUIRY_NOTIFY_EMAIL", default="medprimeeducationgroup@gmail.com")

# ---------- django-allauth (headless JSON API backs the account.js modal) ----------
# "none": no verification email is sent — signup creates the account and logs
# the learner straight in. Password-reset emails are a separate flow, unaffected.
ACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_SIGNUP_FORM_CLASS = "accounts.forms.SignupForm"
ACCOUNT_EMAIL_SUBJECT_PREFIX = "[Ultrasound Physics Lab] "
ACCOUNT_RATE_LIMITS = {
    "login_failed": "5/5m/ip,5/5m/key",
}
HEADLESS_ONLY = False
HEADLESS_ADAPTER = "accounts.adapter.HeadlessAdapter"
# Query-string based (not Netlify's hash-fragment tokens) so the existing
# single-page app can read the key straight from location.search.
HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": "/?confirm_email={key}",
    "account_reset_password_from_key": "/?reset_password={key}",
    "socialaccount_login_error": "/?social_login_error=1",
}

# Google sign-in taken out for now — see the INSTALLED_APPS comment above.
# SOCIALACCOUNT_PROVIDERS = {
#     "google": {
#         "APP": {
#             "client_id": config("GOOGLE_CLIENT_ID", default=""),
#             "secret": config("GOOGLE_CLIENT_SECRET", default=""),
#             "key": "",
#         }
#     }
# }
# SOCIALACCOUNT_LOGIN_ON_GET = True

# ---------- Third-party APIs ----------
ANTHROPIC_API_KEY = config("ANTHROPIC_API_KEY", default="")
PAYSTACK_PUBLIC_KEY = config("PAYSTACK_PUBLIC_KEY", default="")
PAYSTACK_SECRET_KEY = config("PAYSTACK_SECRET_KEY", default="")

# ---------- Course / gating constants (tune freely post-launch) ----------
TOPICS = 34
QUESTIONS = 5
PASS_MARK = 70
FREE_TOPIC_COUNT = 10
PREMIUM_EXAM_PRESET_INDEX = 2  # only the 110-question "Full exam (SPI-style)" preset needs premium
# One subscription unlocks everything — see payments.models.Payment.PLAN_CHOICES.
PRICE_SUB_MONTHLY_GHS = config("PRICE_SUB_MONTHLY_GHS", default=60, cast=int)
PRICE_SUB_SIX_MONTH_GHS = config("PRICE_SUB_SIX_MONTH_GHS", default=175, cast=int)
PRICE_SUB_YEARLY_GHS = config("PRICE_SUB_YEARLY_GHS", default=350, cast=int)
# Organizations still buy one bundled seat per student — a distinct
# institutional offer, unaffected by the individual-subscription pricing above.
ORG_SEAT_PRICE_GHS = config("ORG_SEAT_PRICE_GHS", default=50, cast=int)

# The AI tutor (branded "Medprime Physics AI Tutor") is premium-only — this is
# just its daily cap per premium user, not a free/guest tier.
TUTOR_LIMIT_PREMIUM = config("TUTOR_LIMIT_PREMIUM", default=3, cast=int)

# Both taken out "for now" (flags, not deletions, so either switches back on
# with no rebuilding): the AI tutor needs a real ANTHROPIC_API_KEY and a
# pricing decision first; organization enrollment needs the subscription
# question settled first.
TUTOR_ENABLED = config("TUTOR_ENABLED", default=False, cast=bool)
ORG_ENROLLMENT_ENABLED = config("ORG_ENROLLMENT_ENABLED", default=False, cast=bool)

# ---------- Security (tightened automatically once DEBUG=False in production) ----------
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
    CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", default="", cast=Csv())
