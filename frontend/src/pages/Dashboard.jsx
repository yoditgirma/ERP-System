import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  // Placeholder stats - will be replaced with real data later
  const stats = [
    { title: 'Total Users', value: '0', icon: UserGroupIcon, color: 'blue' },
    { title: 'Active Users', value: '0', icon: UserIcon, color: 'green' },
    { title: 'Recent Activity', value: '0', icon: CalendarIcon, color: 'purple' },
    { title: 'System Status', value: 'Online', icon: ChartBarIcon, color: 'yellow' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back, {user?.full_name || user?.username}!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            No recent activity to display
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              View all users
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Add new user
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              System settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;