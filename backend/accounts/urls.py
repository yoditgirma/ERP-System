from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('refresh/', views.RefreshTokenView.as_view(), name='refresh'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # User Profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    
    # Roles & Permissions
    path('roles/', views.RoleListView.as_view(), name='role-list'),
    path('permissions/', views.PermissionListView.as_view(), name='permission-list'),

     path('admin/reset-password/', views.AdminInitiateResetView.as_view(), name='admin-reset-password'),
    
    # Password Reset (User Confirmation)
    path('reset-password/validate/', views.ValidateResetTokenView.as_view(), name='validate-reset-token'),
    path('reset-password/confirm/', views.ResetPasswordConfirmView.as_view(), name='reset-password-confirm'),

]