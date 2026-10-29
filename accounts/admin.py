from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "full_name", "organization", "is_premium")
    list_filter = ("organization",)
    search_fields = ("full_name", "user__email", "organization__name")
    autocomplete_fields = ["organization"]

    @admin.display(boolean=True)
    def is_premium(self, obj):
        return obj.is_premium
