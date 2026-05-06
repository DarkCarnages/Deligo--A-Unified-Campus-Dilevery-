from django.urls import path
from . import views

urlpatterns = [
    path('', views.VendorListView.as_view(), name='vendor-list'),
    path('<int:vendor_id>/', views.VendorDetailView.as_view(), name='vendor-detail'),
    path('profile/', views.VendorProfileView.as_view(), name='vendor-profile'),
    path('approvals/', views.VendorApprovalView.as_view(), name='vendor-approvals'),
    path('approvals/<int:vendor_id>/', views.VendorApprovalView.as_view(), name='vendor-approve'),
]
