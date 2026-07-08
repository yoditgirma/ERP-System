// frontend/src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'User Management', href: '/users', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
];

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0b2544] shadow-sm px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-bold text-green-500">ERP System</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-white hover:bg-white/10"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0b2544] shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6">
            <h1 className="text-2xl font-extrabold text-green-500">ERP System</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-3 text-base font-bold rounded-lg text-white hover:bg-white/10 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`h-6 w-6 mr-3 ${
                    isActive(item.href) ? 'text-green-500' : 'text-white'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="px-6 py-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="shrink-0">
                <div className="h-12 w-12 rounded-full bg-green-400 flex items-center justify-center">
                  <span className="text-green-900 font-bold">
                    {user?.first_name?.charAt(0) || 'S'}
                    {user?.last_name?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user?.full_name || user?.username || 'System Administrator'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@erp.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-0 py-2 text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-red-500" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
