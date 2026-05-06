from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListView.as_view(), name='order-list'),
    path('stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('<str:order_id>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<str:order_id>/status/', views.OrderStatusUpdateView.as_view(), name='order-status'),
    path('<str:order_id>/assign-delivery/', views.AssignDeliveryView.as_view(), name='assign-delivery'),
]
