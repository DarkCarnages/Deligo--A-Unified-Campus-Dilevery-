from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.ProfileView.as_view(), name='profile'),
    path('users/', views.AllUsersView.as_view(), name='all-users'),
    path('users/<int:user_id>/', views.ManageUserView.as_view(), name='manage-user'),
    path('delivery-partners/', views.DeliveryPartnersView.as_view(), name='delivery-partners'),
]
