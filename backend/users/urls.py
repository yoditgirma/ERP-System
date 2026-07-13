# backend/users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # User management
    path('', views.UserListView.as_view(), name='user-list'),
    path('<uuid:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # User actions
    path('<uuid:user_id>/activate/', views.ActivateUserView.as_view(), name='user-activate'),
    path('<uuid:user_id>/reset-password/', views.ResetPasswordView.as_view(), name='user-reset-password'),
    path('<uuid:user_id>/assign-role/', views.AssignRoleView.as_view(), name='user-assign-role'),
]