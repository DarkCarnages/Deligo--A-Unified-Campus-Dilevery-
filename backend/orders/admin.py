from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'customer', 'status', 'total_price', 'is_paid', 'created_at']
    list_filter = ['status', 'is_paid']
    search_fields = ['order_id', 'customer__username']
    inlines = [OrderItemInline]
