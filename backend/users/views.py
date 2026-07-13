# backend/users/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Q
from accounts.models import Role, UserRole, AuditLog
from accounts.serializers import UserSerializer
from .serializers import UserCreateSerializer, UserUpdateSerializer, UserRoleSerializer
from .permissions import IsSystemAdmin, IsAdminOrSuperAdmin

User = get_user_model()

# ============ USER LIST & CREATE ============
class UserListView(generics.ListCreateAPIView):
    """List all users and create new users"""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer
    
    def get_queryset(self):
        queryset = User.objects.filter(is_deleted=False)
        
        # Search functionality
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Filter by role
        role = self.request.query_params.get('role', '')
        if role:
            queryset = queryset.filter(user_roles__role__name=role)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', '')
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)
        
        return queryset.order_by('-date_joined')
    
    def perform_create(self, serializer):
        user = serializer.save()
        
        # Assign role if provided
        role_id = self.request.data.get('role_id')
        if role_id:
            try:
                role = Role.objects.get(id=role_id)
                UserRole.objects.create(
                    user=user,
                    role=role,
                    assigned_by=self.request.user
                )
            except Role.DoesNotExist:
                pass
        
        # Log audit
        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='User',
            object_id=str(user.id),
            object_repr=user.username,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

# ============ USER DETAIL, UPDATE, DELETE ============
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a user"""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]
    queryset = User.objects.filter(is_deleted=False)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer
    
    def perform_update(self, serializer):
        user = serializer.save()
        
        # Update role if provided
        role_id = self.request.data.get('role_id')
        if role_id:
            try:
                role = Role.objects.get(id=role_id)
                # Remove existing roles
                UserRole.objects.filter(user=user).delete()
                # Assign new role
                UserRole.objects.create(
                    user=user,
                    role=role,
                    assigned_by=self.request.user
                )
            except Role.DoesNotExist:
                pass
        
        # Log audit
        AuditLog.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name='User',
            object_id=str(user.id),
            object_repr=user.username,
            changes=self.request.data,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
    
    def perform_destroy(self, instance):
        # Soft delete instead of hard delete
        instance.soft_delete(deleted_by=self.request.user)
        
        # Log audit
        AuditLog.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name='User',
            object_id=str(instance.id),
            object_repr=instance.username,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )

# ============ ACTIVATE/DEACTIVATE USER ============
class ActivateUserView(APIView):
    """Activate or deactivate a user account"""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]
    
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, is_deleted=False)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        is_active = request.data.get('is_active')
        if is_active is None:
            return Response({'error': 'is_active field is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_active = is_active
        user.save()
        
        # Log audit
        AuditLog.objects.create(
            user=request.user,
            action='UPDATE',
            model_name='User',
            object_id=str(user.id),
            object_repr=user.username,
            changes={'is_active': is_active},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'message': f"User {'activated' if is_active else 'deactivated'} successfully",
            'is_active': user.is_active
        })

# ============ RESET USER PASSWORD ============
class ResetPasswordView(APIView):
    """Reset a user's password"""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]
    
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, is_deleted=False)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({'error': 'new_password is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        # Log audit
        AuditLog.objects.create(
            user=request.user,
            action='UPDATE',
            model_name='User',
            object_id=str(user.id),
            object_repr=user.username,
            changes={'password_reset': True},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'message': 'Password reset successfully'})

# ============ ASSIGN USER ROLE ============
class AssignRoleView(APIView):
    """Assign or update user role"""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]
    
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, is_deleted=False)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        role_id = request.data.get('role_id')
        if not role_id:
            return Response({'error': 'role_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            role = Role.objects.get(id=role_id)
        except Role.DoesNotExist:
            return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Remove existing roles and assign new one
        UserRole.objects.filter(user=user).delete()
        UserRole.objects.create(
            user=user,
            role=role,
            assigned_by=request.user
        )
        
        # Log audit
        AuditLog.objects.create(
            user=request.user,
            action='UPDATE',
            model_name='UserRole',
            object_id=str(user.id),
            object_repr=f"{user.username} -> {role.name}",
            changes={'role': role.name},
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'message': f"Role assigned successfully",
            'role': role.name
        })