from django.contrib import admin

from .models import Counter, Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "enquiry_type", "preferred_date", "contacted", "created_at")
    list_filter = ("enquiry_type", "contacted")
    search_fields = ("name", "email", "institution", "message")
    readonly_fields = [f.name for f in Enquiry._meta.fields if f.name not in ("contacted", "notes")]


@admin.register(Counter)
class CounterAdmin(admin.ModelAdmin):
    list_display = ("name", "value")
