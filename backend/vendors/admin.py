from django.contrib import admin
from .models import VendorProfile

@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ['shop_name', 'user', 'is_approved', 'created_at']
    list_filter = ['is_approved']
    search_fields = ['shop_name', 'user__username']
    actions = ['approve_vendors']

    def approve_vendors(self, request, queryset):
        queryset.update(is_approved=True)
    approve_vendors.short_description = "Approve selected vendors"
