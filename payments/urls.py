from django.urls import path

from . import views

app_name = "payments"

urlpatterns = [
    path("initialize", views.initialize, name="initialize"),
    path("status", views.status, name="status"),
    path("webhook", views.webhook, name="webhook"),
    path("org/signup", views.org_signup_page, name="org_signup_page"),
    path("org/initialize", views.org_initialize, name="org_initialize"),
    path("org/status", views.org_status, name="org_status"),
    path("org/join", views.org_join, name="org_join"),
]
