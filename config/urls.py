from django.conf import settings
from django.contrib import admin
from django.urls import include, path

from payments.views import org_signup_page

from . import views

admin.site.site_header = "Medprime Education Group"
admin.site.site_title = "Medprime Admin"
admin.site.index_title = "Ultrasound Physics Lab — site administration"

urlpatterns = [
    # Must come before the admin.site.urls entry below — Django admin's own
    # urlconf ends with a catch_all_view (any sub-path under its mount prefix
    # resolves to a real Http404 raised from inside that view, which Django
    # does not backtrack past), so a more specific prefix under the same
    # ADMIN_URL has to be tried first or it's silently swallowed.
    path(f"{settings.ADMIN_URL}ai-topics/", include("lab.staff_urls")),
    path(settings.ADMIN_URL, admin.site.urls),
    path("_allauth/", include("allauth.headless.urls")),
    path("accounts/", include("allauth.urls")),
    path("sw.js", views.service_worker, name="service_worker"),
    path("robots.txt", views.robots_txt, name="robots_txt"),
    path("enrol/", org_signup_page),  # trailing slash is canonical; CommonMiddleware's APPEND_SLASH
    # redirects a bare "/enrol" request here, so both forms work.
    path("api/tutor/", include("tutor.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/", include("site_pages.urls")),
    path("", include("lab.urls")),
]
