// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { getDashboardStats } from '../services/dashboard';

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {loading ? '...' : value}
          </p>
        </div>
        <div className={`h-14 w-14 rounded-full flex items-center justify-center ${bgColor}`}>
          <Icon className={`h-7 w-7 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, isSystemAdmin, isAdministrator } = useAuth();
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    recent_activity_count: 0,
    system_status: 'Loading...',
    recent_activity: [],
    role_counts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (e) {
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
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Active Users',
      value: stats.active_users,
      icon: UserIcon,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Recent Activity',
      value: stats.recent_activity_count,
      icon: CalendarIcon,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'System Status',
      value: stats.system_status,
      icon: ChartBarIcon,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
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

      {/* ============ NEW: ADMIN CONTROLS SECTION ============ */}
      {(isSystemAdmin || isAdministrator) && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#33CC33] to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">🔐 Admin Controls</h2>
                <p className="text-green-100 mt-1">Manage users, roles, and system settings</p>
              </div>
              <ShieldCheckIcon className="h-12 w-12 text-white opacity-50" />
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link 
                to="/users" 
                className="bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">User Management</p>
                    <p className="text-sm text-green-100">Manage all users</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/roles" 
                className="bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">Roles & Permissions</p>
                    <p className="text-sm text-green-100">Manage access control</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/settings" 
                className="bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <Cog6ToothIcon className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">System Settings</p>
                    <p className="text-sm text-green-100">Configure system</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - 4 columns */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      {/* Role Distribution */}
      {stats.role_counts && stats.role_counts.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Roles Distribution
          </h3>
          <div className="flex gap-6 flex-wrap">
            {stats.role_counts.map((role) => (
              <div key={role.role__name} className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {role.role__name}
                </span>
                <span className="font-bold text-lg text-[#33CC33]">{role.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section - 2 columns */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity - Takes 2/3 of the space */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <span className="text-xs text-gray-400">Last 24 hours</span>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#33CC33] mx-auto"></div>
              <p className="mt-2">Loading activity...</p>
            </div>
          ) : stats.recent_activity && stats.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activity.slice(0, 5).map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {activity.user?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.user || 'System'}</p>
                      <p className="text-xs text-gray-500">{activity.action || 'Unknown action'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time || 'Just now'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No recent activity to display</p>
            </div>
          )}
        </div>

        {/* Quick Actions - Takes 1/3 of the space */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link 
              to="/users"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all group"
            >
              <UserGroupIcon className="h-5 w-5 text-gray-400 group-hover:text-[#33CC33]" />
              View all users
            </Link>
            <Link 
              to="/users/create"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all group"
            >
              <UserIcon className="h-5 w-5 text-gray-400 group-hover:text-[#33CC33]" />
              Add new user
            </Link>
            <Link 
              to="/settings"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all group"
            >
              <Cog6ToothIcon className="h-5 w-5 text-gray-400 group-hover:text-[#33CC33]" />
              System settings
            </Link>
            <Link 
              to="/audit"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all group"
            >
              <DocumentTextIcon className="h-5 w-5 text-gray-400 group-hover:text-[#33CC33]" />
              View audit logs
            </Link>
          </div>
          
          {/* User info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#33CC33] text-white flex items-center justify-center font-bold">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {isSystemAdmin ? '🔑 Super Admin' : isAdministrator ? '🛡️ Admin' : '👤 User'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;