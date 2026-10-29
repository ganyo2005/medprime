from django.contrib import admin

from .models import OrgPayment, Organization, Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("reference", "user", "plan", "amount_ghs", "status", "paid_at", "expires_at", "created_at")
    list_filter = ("plan", "status")
    search_fields = ("reference", "user__email")
    readonly_fields = ("reference", "user", "plan", "amount_ghs", "created_at")


class OrgPaymentInline(admin.TabularInline):
    model = OrgPayment
    extra = 0
    readonly_fields = ("reference", "seats", "amount_ghs", "status", "paid_at", "created_at")
    can_delete = False


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "contact_name", "contact_email", "seats_used", "seat_limit", "is_active", "join_code", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "contact_name", "contact_email", "join_code")
    readonly_fields = ("join_code", "created_at")
    inlines = [OrgPaymentInline]


@admin.register(OrgPayment)
class OrgPaymentAdmin(admin.ModelAdmin):
    list_display = ("reference", "organization", "seats", "amount_ghs", "status", "paid_at", "created_at")
    list_filter = ("status",)
    search_fields = ("reference", "organization__name")
    readonly_fields = ("reference", "organization", "seats", "amount_ghs", "created_at")
