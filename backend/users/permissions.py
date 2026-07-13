# backend/users/permissions.py
from rest_framework import permissions
from accounts.models import UserRole

class IsSystemAdmin(permissions.BasePermission):
    """Allow access only to users with Super Administrator role"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user has Super Administrator role
        return UserRole.objects.filter(
            user=request.user,
            role__name='Super Administrator'
        ).exists()

class IsAdminOrSuperAdmin(permissions.BasePermission):
    """Allow access to Super Administrators and Administrators"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user has Super Administrator or Administrator role
        return UserRole.objects.filter(
            user=request.user,
            role__name__in=['Super Administrator', 'Administrator']
        ).exists()