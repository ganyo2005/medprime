from django.urls import path

from . import views

app_name = "lab"

urlpatterns = [
    path("", views.index, name="index"),
    path("verify", views.verify_page, name="verify_page"),
    path("api/progress", views.progress_api, name="progress_api"),
    path("api/certificate", views.certificate_api, name="certificate_api"),
    path("api/lab/topic-error", views.topic_error_report, name="topic_error_report"),
]
