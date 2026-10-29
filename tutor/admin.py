from django.contrib import admin

from .models import TutorUsage


@admin.register(TutorUsage)
class TutorUsageAdmin(admin.ModelAdmin):
    list_display = ("key", "day", "count")
    list_filter = ("day",)
    search_fields = ("key",)
