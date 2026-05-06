from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('mark-all-read/', views.MarkAllReadView.as_view(), name='mark-all-read'),
    path('<int:notification_id>/', views.MarkReadView.as_view(), name='mark-read'),
]
