from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
import logging

from .models import LoginHistory, Permission, Role
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