from django.urls import path
from . import views

urlpatterns = [
    path('create-order/', views.CreatePaymentOrderView.as_view(), name='create-payment'),
    path('verify/', views.VerifyPaymentView.as_view(), name='verify-payment'),
    path('status/<str:order_id>/', views.PaymentStatusView.as_view(), name='payment-status'),
]
