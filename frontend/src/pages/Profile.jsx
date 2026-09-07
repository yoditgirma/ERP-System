// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { 
  PencilIcon, 
  CameraIcon, 
  KeyIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

// Helper function to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise, prepend the API base URL
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  // Remove /api if it's there
  const cleanBase = baseURL.replace('/api', '');
  return `${cleanBase}${imagePath}`;
};

const Profile = () => {
  const { user, updateProfile, changePassword, fetchUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const passwordForm = useForm({
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    }
  });

  // Set form values when user data loads
  useEffect(() => {
    if (user) {
      setValue('first_name', user.first_name || '');
      setValue('last_name', user.last_name || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      
      // Set profile image - use the helper function
      if (user.profile_picture) {
        const imageUrl = getImageUrl(user.profile_picture);
        console.log('Profile image URL:', imageUrl);
        setProfileImage(imageUrl);
      } else {
        setProfileImage(null);
      }
    }
  }, [user, setValue]);

  const onSubmitProfile = async (data) => {
    setLoading(true);
    try {
      const result = await updateProfile(data);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        // Refresh user data
        await fetchUserProfile();
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    setLoading(true);
    try {
      const result = await changePassword(data.old_password, data.new_password);
      if (result.success) {
        toast.success('Password changed successfully!');
        setIsChangingPassword(false);
        passwordForm.reset();
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB allowed.');
      return;
    }

    setImageLoading(true);
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const response = await api.post('/auth/profile/upload-picture/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('Upload response:', response.data);
      
      toast.success('Profile picture updated successfully!');
      
      // Update the profile image URL from response
      if (response.data.profile_picture) {
        const imageUrl = getImageUrl(response.data.profile_picture);
        setProfileImage(imageUrl);
      }
      
      // Refresh user data to get the new profile picture URL
      await fetchUserProfile();
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.error || 'Failed to upload image');
      
      // Reset preview if upload failed
      if (user?.profile_picture) {
        setProfileImage(getImageUrl(user.profile_picture));
      } else {
        setProfileImage(null);
      }
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-linear-to-r from-[#33CC33] to-[#103454] rounded-2xl shadow-lg p-8 mb-6">
        <div className="flex items-center space-x-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
              {imageLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', profileImage);
                    e.target.style.display = 'none';
                    // Show initials as fallback
                    const parent = e.target.parentElement;
                    parent.innerHTML = `
                      <span class="text-4xl font-bold text-white">
                        ${user?.first_name?.charAt(0) || 'U'}${user?.last_name?.charAt(0) || ''}
                      </span>
                    `;
                  }}
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {user?.first_name?.charAt(0) || 'U'}
                  {user?.last_name?.charAt(0) || ''}
                </span>
              )}
            </div>
            <label 
              htmlFor="profile-picture-input"
              className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <CameraIcon className="h-4 w-4 text-gray-600" />
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={imageLoading}
              />
            </label>
          </div>

          {/* User Info */}
          <div className="text-white">
            <h2 className="text-2xl font-bold">{user?.full_name || user?.username}</h2>
            <p className="text-white/80">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {user?.roles?.map((role) => (
                <span key={role} className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-3 py-2 text-sm font-medium text-[#33CC33] hover:bg-green-50 rounded-lg transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitProfile)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                {...register('first_name')}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] ${
                  isEditing ? 'border-gray-300' : 'border-gray-100 bg-gray-50'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                {...register('last_name')}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] ${
                  isEditing ? 'border-gray-300' : 'border-gray-100 bg-gray-50'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] ${
                  isEditing ? 'border-gray-300' : 'border-gray-100 bg-gray-50'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                {...register('phone')}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33] ${
                  isEditing ? 'border-gray-300' : 'border-gray-100 bg-gray-50'
                }`}
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#33CC33] text-white rounded-lg hover:bg-[#2db82d] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          <button
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="flex items-center px-3 py-2 text-sm font-medium text-[#33CC33] hover:bg-green-50 rounded-lg transition-colors"
          >
            <KeyIcon className="h-4 w-4 mr-2" />
            {isChangingPassword ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {isChangingPassword && (
          <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  {...passwordForm.register('old_password', { required: 'Current password is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33]"
                  placeholder="Enter current password"
                />
                {passwordForm.errors.old_password && (
                  <p className="text-red-500 text-xs mt-1">{passwordForm.errors.old_password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  {...passwordForm.register('new_password', { 
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33]"
                  placeholder="Enter new password"
                />
                {passwordForm.errors.new_password && (
                  <p className="text-red-500 text-xs mt-1">{passwordForm.errors.new_password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...passwordForm.register('confirm_password', { 
                    required: 'Please confirm your password',
                    validate: value => value === passwordForm.watch('new_password') || 'Passwords do not match'
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33CC33]"
                  placeholder="Confirm new password"
                />
                {passwordForm.errors.confirm_password && (
                  <p className="text-red-500 text-xs mt-1">{passwordForm.errors.confirm_password.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-[#33CC33] text-white rounded-lg hover:bg-[#2db82d] transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;