from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartView.as_view(), name='cart'),
    path('clear/', views.CartView.as_view(), name='cart-clear'),
    path('items/', views.CartItemView.as_view(), name='cart-item-add'),
    path('items/<int:item_id>/', views.CartItemView.as_view(), name='cart-item-detail'),
]
