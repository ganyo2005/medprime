from django.contrib import admin

from .models import Certificate, GeneratedTopic, Progress


@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "last_sim", "updated_at")
    search_fields = ("user__email",)


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "score", "issued_at")
    search_fields = ("id", "name", "user__email")
    readonly_fields = ("id", "issued_at")


@admin.register(GeneratedTopic)
class GeneratedTopicAdmin(admin.ModelAdmin):
    """Read-only here — the actual generate/preview/approve/reject workflow
    lives on the dedicated staff page (see lab/staff_views.py); this is just
    a visibility/audit backstop."""

    list_display = ("n", "status", "publish_order", "error_count", "created_by", "created_at")
    list_filter = ("status",)
    search_fields = ("n", "prompt")
    readonly_fields = [f.name for f in GeneratedTopic._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
