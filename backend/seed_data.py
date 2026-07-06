# backend/seed_data.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp.settings')
django.setup()

from accounts.models import Role, Permission
from django.contrib.auth import get_user_model

def seed_database():
    """Seed initial roles and permissions"""
    
    print("🌱 Starting database seeding...")
    
    # Create roles
    roles = [
        {'name': 'Super Administrator', 'description': 'Full system access with all permissions'},
        {'name': 'Administrator', 'description': 'Administrative access with limited permissions'},
        {'name': 'Standard User', 'description': 'Basic user access with minimal permissions'},
    ]
    
    for role_data in roles:
        role, created = Role.objects.get_or_create(
            name=role_data['name'], 
            defaults={'description': role_data['description']}
        )
        if created:
            print(f"✅ Created role: {role.name}")
        else:
            print(f"⏭️  Role already exists: {role.name}")
    
    # Create permissions
    permissions = [
        {'name': 'Can View Users', 'codename': 'view_users', 'description': 'Permission to view user list'},
        {'name': 'Can Create Users', 'codename': 'create_users', 'description': 'Permission to create new users'},
        {'name': 'Can Edit Users', 'codename': 'edit_users', 'description': 'Permission to edit existing users'},
        {'name': 'Can Delete Users', 'codename': 'delete_users', 'description': 'Permission to delete users'},
        {'name': 'Can Manage Roles', 'codename': 'manage_roles', 'description': 'Permission to manage roles and permissions'},
        {'name': 'Can View Dashboard', 'codename': 'view_dashboard', 'description': 'Permission to view dashboard'},
    ]
    
    for perm_data in permissions:
        perm, created = Permission.objects.get_or_create(
            codename=perm_data['codename'],
            defaults=perm_data
        )
        if created:
            print(f"✅ Created permission: {perm.name}")
        else:
            print(f"⏭️  Permission already exists: {perm.name}")
    
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()