from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from accounts.models import User, UserRole, LoginHistory

class DashboardStatsView(APIView):
    """API endpoint for dashboard statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get total users count
        total_users = User.objects.count()
        
        # Get active users (logged in within last 24 hours)
        yesterday = timezone.now() - timedelta(days=1)
        active_users = LoginHistory.objects.filter(
            login_time__gte=yesterday
        ).values('user').distinct().count()
        
        # Get recent activity (last 5 logins)
        recent_activity = LoginHistory.objects.select_related('user').order_by('-login_time')[:5]
        
        # Count users by role
        role_counts = UserRole.objects.values('role__name').annotate(
            count=Count('user')
        )
        
        # System status (you can add more logic here)
        system_status = "Online"
        
        # Format recent activity
        activity_data = []
        for activity in recent_activity:
            activity_data.append({
                'user': activity.user.username,
                'action': 'Logged in',
                'time': activity.login_time.strftime('%Y-%m-%d %H:%M'),
                'type': 'login'
            })
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'recent_activity_count': len(activity_data),
            'system_status': system_status,
            'recent_activity': activity_data,
            'role_counts': list(role_counts),
        })