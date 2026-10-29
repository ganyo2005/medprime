from django.urls import path

from . import staff_views

app_name = "lab_staff"

urlpatterns = [
    path("", staff_views.staff_topics_list, name="staff_topics_list"),
    path("generate", staff_views.staff_topic_generate, name="staff_topic_generate"),
    path("<int:pk>/data", staff_views.staff_topic_preview_data, name="staff_topic_preview_data"),
    path("<int:pk>/approve", staff_views.staff_topic_approve, name="staff_topic_approve"),
    path("<int:pk>/reject", staff_views.staff_topic_reject, name="staff_topic_reject"),
    path("<int:pk>/unpublish", staff_views.staff_topic_unpublish, name="staff_topic_unpublish"),
]
