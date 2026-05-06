from django.urls import path
from . import views

urlpatterns = [
    path('zones/', views.CampusZoneListView.as_view(), name='zone-list'),
    path('validate-address/', views.ValidateAddressView.as_view(), name='validate-address'),
    path('admin/zones/', views.CampusZoneAdminView.as_view(), name='admin-zones'),
    path('admin/zones/<int:zone_id>/', views.CampusZoneDetailAdminView.as_view(), name='admin-zone-detail'),
]
