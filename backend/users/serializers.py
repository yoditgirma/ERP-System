# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from accounts.models import Role, UserRole
from accounts.serializers import RoleSerializer

User = get_user_model()

class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    role_id = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 
                  'phone', 'is_active', 'role_id']
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def create(self, validated_data):
        role_id = validated_data.pop('role_id', None)
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, password=password)
        
        # Assign default role if no role specified
        if role_id:
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

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating users"""
    role_id = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'is_active', 'role_id']
    
    def update(self, instance, validated_data):
        role_id = validated_data.pop('role_id', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance

class UserRoleSerializer(serializers.ModelSerializer):
    """Serializer for user roles"""
    role = RoleSerializer(read_only=True)
    
    class Meta:
        model = UserRole
        fields = ['id', 'role', 'assigned_at']