# backend/accounts/services/email_service.py
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
import secrets
import uuid
from datetime import timedelta

User = get_user_model()

class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    def send_password_reset_email(user, reset_token, reset_type='admin_initiated'):
        """
        Send password reset email to user
        """
        # Build reset link
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"
        
        # Email context
        context = {
            'user': user,
            'reset_link': reset_link,
            'reset_type': reset_type,
            'expires_in': 24,  # Hours
        }
        
        # Render HTML email
        html_message = render_to_string('email/password_reset_email.html', context)
        plain_message = strip_tags(html_message)
        
        # Send email
        send_mail(
            subject='Password Reset Request - ERP System',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True
    
    @staticmethod
    def send_password_changed_notification(user, changed_by=None):
        """
        Send notification that password was changed
        """
        context = {
            'user': user,
            'changed_by': changed_by,
            'changed_at': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
        }
        
        html_message = render_to_string('email/password_changed_notification.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject='Password Changed - ERP System',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return True