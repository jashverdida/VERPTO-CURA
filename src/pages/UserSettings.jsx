import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cog6ToothIcon,
  BellIcon,
  LockClosedIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const UserSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@cura.gov.ph',
    phone: '+63 (2) 8123-0000',
    position: 'System Administrator',
    department: 'Command Center',
    location: 'Metro Manila',
    bio: 'Emergency response coordination specialist',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsAlerts: true,
    incidentUpdates: true,
    systemAlerts: true,
    weeklyReport: false,
    darkMode: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveSuccess(false);
  };

  const handlePreferenceChange = (field) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaveSuccess(true);
    setIsSaving(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaveSuccess(true);
    setIsSaving(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaveSuccess(true);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsSaving(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 px-6 py-6 shadow-lg flex-shrink-0 border-b border-emerald-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600 rounded-lg shadow-lg">
            <Cog6ToothIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-emerald-200 text-sm">Manage your profile and preferences</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BellIcon className="w-4 h-4" />
                <span>Preferences</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'security'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <LockClosedIcon className="w-4 h-4" />
                <span>Security</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 pb-6 border-b border-slate-200">
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{formData.firstName} {formData.lastName}</h3>
                    <p className="text-sm text-slate-500">{formData.position}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>Email</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1">
                      <PhoneIcon className="w-4 h-4" />
                      <span>Phone</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleFormChange('position', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleFormChange('department', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  {/* Location */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>Location</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleFormChange('location', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleFormChange('bio', e.target.value)}
                      rows="4"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                      saveSuccess
                        ? 'bg-emerald-600 text-white'
                        : isSaving
                        ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>Saved</span>
                      </>
                    ) : isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Notification Preferences</h3>

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email' },
                    { key: 'smsAlerts', label: 'SMS Alerts', description: 'Get critical alerts via text message' },
                    { key: 'incidentUpdates', label: 'Incident Updates', description: 'Receive real-time incident updates' },
                    { key: 'systemAlerts', label: 'System Alerts', description: 'Get notified about system status changes' },
                    { key: 'weeklyReport', label: 'Weekly Report', description: 'Receive weekly summary reports' },
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                      <div>
                        <p className="font-medium text-slate-800">{pref.label}</p>
                        <p className="text-sm text-slate-500">{pref.description}</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange(pref.key)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          preferences[pref.key] ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                            preferences[pref.key] ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="font-medium text-slate-800">Dark Mode</p>
                      <p className="text-sm text-slate-500">Use dark theme throughout the application</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('darkMode')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        preferences.darkMode ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                          preferences.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                      saveSuccess
                        ? 'bg-emerald-600 text-white'
                        : isSaving
                        ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>Saved</span>
                      </>
                    ) : isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>Save Preferences</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Change Password</h3>

                <div className="space-y-4 mb-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                    <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Password Requirements:</span> Use a mix of uppercase, lowercase, numbers, and special characters for better security.
                  </p>
                </div>

                {/* Change Button */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                      saveSuccess
                        ? 'bg-emerald-600 text-white'
                        : isSaving
                        ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>Password Changed</span>
                      </>
                    ) : isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
