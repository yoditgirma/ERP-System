import secrets

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
import logging

from users.permissions import IsAdminOrSuperAdmin


from .models import AuditLog, LoginHistory, Permission, Role
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    RoleSerializer, PermissionSerializer
)

logger = logging.getLogger(__name__)
User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Assign default role (Standard User)
        from .models import Role
        try:
            standard_role = Role.objects.get(name='Standard User')
            from .models import UserRole
            UserRole.objects.create(user=user, role=standard_role, assigned_by=None)
        except Role.DoesNotExist:
            logger.warning("Standard User role not found. Please seed roles.")
        
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        
        if not user:
            # Log failed attempt
            logger.warning(f"Failed login attempt for username: {username}")
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'User account is disabled'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Log successful login
        LoginHistory.objects.create(
            user=user,
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            is_successful=True
        )
        
        # Update last login
        user.last_login = timezone.now()
        user.save()
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Update logout time in login history
            login_history = LoginHistory.objects.filter(
                user=request.user,
                logout_time__isnull=True
            ).order_by('-login_time').first()
            if login_history:
                login_history.logout_time = timezone.now()
                login_history.save()
            
            return Response({
                'message': 'Logged out successfully'
            })
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response({
                'error': 'Logout failed'
            }, status=status.HTTP_400_BAD_REQUEST)

class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)
            return Response({
                'access': access_token
            })
        except Exception as e:
            return Response({
                'error': 'Invalid refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class RoleListView(generics.ListAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]

class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({
                'error': 'Both old_password and new_password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        if not user.check_password(old_password):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({
                'error': e.messages
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        })
    

# backend/accounts/views.py
# Add these new views

from .models import PasswordResetToken
from .services.email_service import EmailService
from datetime import timedelta
from django.utils import timezone

class AdminInitiateResetView(APIView):
    """
    View for admin to initiate password reset for a user
    URL: POST /api/auth/admin/reset-password/
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]
    
    def post(self, request):
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if admin can reset this user's password
        if not request.user.is_superuser:
            # Admin cannot reset Super Admin passwords
            user_roles = user.user_roles.all()
            if any(ur.role.name == 'Super Administrator' for ur in user_roles):
                return Response(
                    {'error': 'Cannot reset password for Super Administrator'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Delete any existing valid tokens for this user
        PasswordResetToken.objects.filter(
            user=user,
            used=False,
            expires_at__gt=timezone.now()
        ).update(used=True)
        
        # Generate new token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=24)
        
        reset_token = PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at,
            reset_type='admin_initiated'
        )
        
        # Send email
        try:
            EmailService.send_password_reset_email(user, reset_token, 'admin_initiated')
            
            # Log audit
            AuditLog.objects.create(
                user=request.user,
                action='UPDATE',
                model_name='User',
                object_id=str(user.id),
                object_repr=user.username,
                changes={'password_reset_initiated': True},
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'message': f'Password reset email sent to {user.email}',
                'user': user.username,
                'email': user.email
            })
            
        except Exception as e:
            reset_token.delete()
            return Response({
                'error': f'Failed to send email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResetPasswordConfirmView(APIView):
    """
    View for user to confirm password reset with token
    URL: POST /api/auth/reset-password/confirm/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not token or not new_password or not confirm_password:
            return Response(
                {'error': 'token, new_password, and confirm_password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != confirm_password:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if token is valid
        if not reset_token.is_valid():
            return Response(
                {'error': 'Token has expired or already been used'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password
        try:
            validate_password(new_password, reset_token.user)
        except ValidationError as e:
            return Response(
                {'error': e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        reset_token.user.set_password(new_password)
        reset_token.user.save()
        
        # Mark token as used
        reset_token.used = True
        reset_token.save()
        
        # Send notification email
        try:
            EmailService.send_password_changed_notification(reset_token.user)
        except Exception as e:
            print(f"Failed to send notification email: {e}")
        
        return Response({
            'message': 'Password reset successfully. Please login with your new password.'
        })

class ValidateResetTokenView(APIView):
    """
    View to validate reset token
    URL: GET /api/auth/reset-password/validate/?token=xxx
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        token = request.query_params.get('token')
        
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            
            if reset_token.is_valid():
                return Response({
                    'valid': True,
                    'user': reset_token.user.username,
                    'email': reset_token.user.email,
                    'expires_at': reset_token.expires_at
                })
            else:
                return Response({
                    'valid': False,
                    'message': 'Token has expired or already been used'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except PasswordResetToken.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)