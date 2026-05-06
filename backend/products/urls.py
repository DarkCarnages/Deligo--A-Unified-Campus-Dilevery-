from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListView.as_view(), name='product-list'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('my-products/', views.VendorProductListView.as_view(), name='vendor-products'),
    path('<int:product_id>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('reviews/', views.ReviewCreateView.as_view(), name='review-create'),
    path('<int:product_id>/reviews/', views.ReviewListView.as_view(), name='review-list'),
]
