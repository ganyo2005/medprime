from django.urls import path

from . import views

app_name = "site_pages"

urlpatterns = [
    path("visits", views.visits_api, name="visits_api"),
    path("enquiry", views.enquiry_submit, name="enquiry_submit"),
]
