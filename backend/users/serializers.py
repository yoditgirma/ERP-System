# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from accounts.models import Role, UserRole

User = get_user_model()

# ============ USER CREATE SERIALIZER ============
class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users"""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    role_id = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 
            'first_name', 'last_name', 'phone', 
            'is_active', 'role_id'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'username': {'required': True},
        }
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def create(self, validated_data):
        # Remove role_id from validated_data
        role_id = validated_data.pop('role_id', None)
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Assign role if provided
        if role_id and role_id != '':
            try:
                role = Role.objects.get(id=role_id)
                UserRole.objects.create(user=user, role=role)
            except Role.DoesNotExist:
                pass
        else:
            # Assign default role (Standard User)
            try:
                default_role = Role.objects.get(name='Standard User')
                UserRole.objects.create(user=user, role=default_role)
            except Role.DoesNotExist:
                pass
        
        return user

# ============ USER UPDATE SERIALIZER ============
class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating users"""
    role_id = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'is_active', 'role_id']
        extra_kwargs = {
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }
    
    def update(self, instance, validated_data):
        # Remove role_id from validated_data
        role_id = validated_data.pop('role_id', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update role if provided
        if role_id and role_id != '':
            try:
                role = Role.objects.get(id=role_id)
                # Remove existing roles
                UserRole.objects.filter(user=instance).delete()
                # Assign new role
                UserRole.objects.create(user=instance, role=role)
            except Role.DoesNotExist:
                pass
        
        return instance

# ============ USER ROLE SERIALIZER ============
class UserRoleSerializer(serializers.ModelSerializer):
    """Serializer for user roles"""
    role_name = serializers.CharField(source='role.name', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserRole
        fields = ['id', 'user', 'user_name', 'role', 'role_name', 'assigned_at']
        read_only_fields = ['id', 'assigned_at']