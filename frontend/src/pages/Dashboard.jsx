// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { getDashboardStats } from '../services/dashboard';

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`h-14 w-14 rounded-full flex items-center justify-center ${bgColor}`}>
          <Icon className={`h-7 w-7 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    recent_activity_count: 0,
    system_status: 'Loding...',
    recent_activity: [],
    role_counts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const data = await getDashboardStats();
      setStats(data);
    } catch(e){
      console.error('Error loading dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  
  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: UserGroupIcon,
      bgColor: 'bg-blue-400',
      iconColor: 'text-blue-900',
    },
    {
      title: 'Active Users',
      value: stats.active_users,
      icon: UserIcon,
      bgColor: 'bg-green-400',
      iconColor: 'text-green-900',
    },
    {
      title: 'Recent Activity',
      value: stats.recent_activity_count,
      icon: CalendarIcon,
      bgColor: 'bg-purple-400',
      iconColor: 'text-purple-900',
    },
    {
      title: 'System Status',
      value: stats.system_status,
      icon: ChartBarIcon,
      bgColor: 'bg-yellow-400',
      iconColor: 'text-yellow-900',
    },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user?.full_name || user?.username || 'System Administrator'}
        </p>
      </div>

      {/* Stats Grid - 4 columns */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      {/* Role Distribution (Optional) */}
      {stats.role_counts.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Roles Distribution</h3>
          <div className="flex gap-6 flex-wrap">
            {stats.role_counts.map((role) => (
              <div key={role.role__name} className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {role.role__name}
                </span>
                <span className="font-bold text-lg">{role.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section - 2 columns */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity - Takes 2/3 of the space */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : stats.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activity to display
            </div>
          )}
        </div>

        {/* Quick Actions - Takes 1/3 of the space */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              View all users
            </button>
            <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              Add new user
            </button>
            <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
              System settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
