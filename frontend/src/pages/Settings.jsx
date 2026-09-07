// frontend/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Cog6ToothIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BellIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

const Settings = () => {
  const { user, isSystemAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    company_name: 'My Company',
    company_address: '',
    company_phone: '',
    company_email: '',
    timezone: 'UTC',
    language: 'en',
    session_timeout: 60,
    password_expiry_days: 90,
    require_2fa: false,
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_use_tls: true,
    mail_from: 'noreply@erpsystem.com',
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'company', name: 'Company', icon: BuildingOfficeIcon },
    { id: 'email', name: 'Email', icon: EnvelopeIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'users', name: 'Users', icon: UserGroupIcon },
  ];

  // Only Super Admin and Admin can access settings
  if (!isSystemAdmin && !user?.isAdmin) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access settings.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save settings API call
      await api.put('/settings/', settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Configure system preferences and settings</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#33CC33] text-[#33CC33]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* General Settings */}
            {activeTab === 'general' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Name
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={settings.company_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Zone
                    </label>
                    <select
                      name="timezone"
                      value={settings.timezone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
                      <option value="Asia/Dubai">Asia/Dubai</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      name="language"
                      value={settings.language}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="am">Amharic</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Company Settings */}
            {activeTab === 'company' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={settings.company_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="company_address"
                      value={settings.company_address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                      placeholder="Company address..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="company_phone"
                      value={settings.company_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Email
                    </label>
                    <input
                      type="email"
                      name="company_email"
                      value={settings.company_email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h3>
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      name="smtp_host"
                      value={settings.smtp_host}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      name="smtp_port"
                      value={settings.smtp_port}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="smtp_use_tls"
                      checked={settings.smtp_use_tls}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#33CC33] focus:ring-[#33CC33] border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Use TLS/SSL Encryption
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sender Email
                    </label>
                    <input
                      type="email"
                      name="mail_from"
                      value={settings.mail_from}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      name="session_timeout"
                      value={settings.session_timeout}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto logout after inactivity</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      name="password_expiry_days"
                      value={settings.password_expiry_days}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Force password change after X days</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Two-Factor Authentication
                      </label>
                      <p className="text-xs text-gray-500">Require 2FA for all users</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({...settings, require_2fa: !settings.require_2fa})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.require_2fa ? 'bg-[#33CC33]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.require_2fa ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* User Settings */}
            {activeTab === 'users' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Settings</h3>
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Allow User Registration
                      </label>
                      <p className="text-xs text-gray-500">Allow new users to register</p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#33CC33] transition-colors"
                    >
                      <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Require Email Verification
                      </label>
                      <p className="text-xs text-gray-500">Verify email before account activation</p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors"
                    >
                      <span className="inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default User Role
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] focus:border-transparent">
                      <option value="standard">Standard User</option>
                      <option value="admin">Administrator</option>
                      <option value="super_admin">Super Administrator</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#33CC33] text-white rounded-lg hover:bg-[#2db82d] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;