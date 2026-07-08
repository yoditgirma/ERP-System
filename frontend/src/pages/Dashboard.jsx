// frontend/src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

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

  const stats = [
    {
      title: 'Total Users',
      value: '0',
      icon: UserGroupIcon,
      bgColor: 'bg-blue-400',
      iconColor: 'text-blue-900',
    },
    {
      title: 'Active Users',
      value: '0',
      icon: UserIcon,
      bgColor: 'bg-green-400',
      iconColor: 'text-green-900',
    },
    {
      title: 'Recent Activity',
      value: '0',
      icon: CalendarIcon,
      bgColor: 'bg-purple-400',
      iconColor: 'text-purple-900',
    },
    {
      title: 'System Status',
      value: 'Online',
      icon: ChartBarIcon,
      bgColor: 'bg-yellow-400',
      iconColor: 'text-yellow-900',
    },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-lg text-gray-500 mt-2">
          Welcome back, {user?.full_name || user?.username || 'system Administrator'}
        </p>
      </div>

      {/* Stats Grid - 3 columns, wraps to next row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Bottom Section - 2 columns */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-16 text-gray-500">
            No recent activity to display
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-0 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              View all users
            </button>
            <button className="w-full text-left px-0 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Add new user
            </button>
            <button className="w-full text-left px-0 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              System settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
