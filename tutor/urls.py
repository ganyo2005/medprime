from django.urls import path

from . import views

app_name = "tutor"

urlpatterns = [
    path("ask", views.tutor_ask, name="ask"),
]
