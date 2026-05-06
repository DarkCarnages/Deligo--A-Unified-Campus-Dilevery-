from django.contrib import admin
from .models import Product, Category, SubCategory, Review

admin.site.register(Category)
admin.site.register(SubCategory)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'vendor', 'category', 'price', 'is_available', 'avg_rating']
    list_filter = ['category', 'is_available']
    search_fields = ['name', 'vendor__shop_name']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'customer', 'rating', 'created_at']
