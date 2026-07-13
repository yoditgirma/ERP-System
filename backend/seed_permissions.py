# backend/seed_permissions.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp.settings')
django.setup()

from accounts.models import Permission, Role, RolePermission

def seed_permissions():
    """Create default permissions for the system"""
    
    permissions = [
        # User Management Permissions
        {'name': 'Can View Users', 'codename': 'view_users', 'module': 'users', 'description': 'View list of users'},
        {'name': 'Can Create Users', 'codename': 'create_users', 'module': 'users', 'description': 'Create new users'},
        {'name': 'Can Edit Users', 'codename': 'edit_users', 'module': 'users', 'description': 'Edit existing users'},
        {'name': 'Can Delete Users', 'codename': 'delete_users', 'module': 'users', 'description': 'Delete users'},
        {'name': 'Can Activate Users', 'codename': 'activate_users', 'module': 'users', 'description': 'Activate/deactivate users'},
        {'name': 'Can Assign Roles', 'codename': 'assign_roles', 'module': 'users', 'description': 'Assign roles to users'},
        {'name': 'Can Reset Passwords', 'codename': 'reset_passwords', 'module': 'users', 'description': 'Reset user passwords'},
        
        # Role Management Permissions
        {'name': 'Can View Roles', 'codename': 'view_roles', 'module': 'roles', 'description': 'View list of roles'},
        {'name': 'Can Create Roles', 'codename': 'create_roles', 'module': 'roles', 'description': 'Create new roles'},
        {'name': 'Can Edit Roles', 'codename': 'edit_roles', 'module': 'roles', 'description': 'Edit existing roles'},
        {'name': 'Can Delete Roles', 'codename': 'delete_roles', 'module': 'roles', 'description': 'Delete roles'},
        
        # Dashboard Permissions
        {'name': 'Can View Dashboard', 'codename': 'view_dashboard', 'module': 'dashboard', 'description': 'View dashboard'},
        {'name': 'Can View Reports', 'codename': 'view_reports', 'module': 'dashboard', 'description': 'View reports'},
        
        # Settings Permissions
        {'name': 'Can View Settings', 'codename': 'view_settings', 'module': 'settings', 'description': 'View system settings'},
        {'name': 'Can Edit Settings', 'codename': 'edit_settings', 'module': 'settings', 'description': 'Edit system settings'},
        
        # Audit Permissions
        {'name': 'Can View Audit Logs', 'codename': 'view_audit_logs', 'module': 'audit', 'description': 'View audit logs'},
    ]
    
    print("🌱 Seeding permissions...")
    
    for perm_data in permissions:
        perm, created = Permission.objects.get_or_create(
            codename=perm_data['codename'],
            defaults=perm_data
        )
        if created:
            print(f"✅ Created permission: {perm.name}")
        else:
            print(f"⏭️  Permission already exists: {perm.name}")
    
    # Assign all permissions to Super Administrator
    try:
        super_role = Role.objects.get(name='Super Administrator')
        all_permissions = Permission.objects.all()
        
        for permission in all_permissions:
            RolePermission.objects.get_or_create(
                role=super_role,
                permission=permission
            )
        print(f"✅ All permissions assigned to {super_role.name}")
        
    except Role.DoesNotExist:
        print("⚠️  Super Administrator role not found. Please create roles first.")
    
    # Assign specific permissions to Administrator
    try:
        admin_role = Role.objects.get(name='Administrator')
        admin_permissions = [
            'view_users', 'create_users', 'edit_users', 'activate_users', 'assign_roles',
            'view_roles', 'view_dashboard', 'view_reports'
        ]
        
        for codename in admin_permissions:
            try:
                perm = Permission.objects.get(codename=codename)
                RolePermission.objects.get_or_create(role=admin_role, permission=perm)
            except Permission.DoesNotExist:
                pass
        
        print(f"✅ Assigned permissions to {admin_role.name}")
        
    except Role.DoesNotExist:
        print("⚠️  Administrator role not found.")
    
    print("✨ Permission seeding completed!")

if __name__ == '__main__':
    seed_permissions()