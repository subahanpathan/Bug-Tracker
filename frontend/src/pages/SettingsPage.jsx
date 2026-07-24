import React, { useState, useEffect } from 'react';
import {
  FiBell, FiMoon, FiSun, FiGlobe, FiLock, FiShield,
  FiCheck, FiAlertCircle, FiLoader, FiEye, FiEyeOff, FiKey
} from 'react-icons/fi';
import { useAuthStore } from '../store/index.js';
import toast from 'react-hot-toast';

// ──────────────────────────────────────────────
// Load settings from localStorage (with defaults)
// ──────────────────────────────────────────────
const STORAGE_KEY = 'bugtracker_settings';

const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return {
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    darkMode: false,
    language: 'en',
  };
};

const saveSettings = (settings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

// ──────────────────────────────────────────────
// Apply dark mode to <html> element
// ──────────────────────────────────────────────
const applyDarkMode = (enabled) => {
  if (enabled) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// ──────────────────────────────────────────────
// Toggle Switch Component
// ──────────────────────────────────────────────
const Toggle = ({ enabled, onToggle, disabled = false }) => (
  <button
    onClick={onToggle}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
      enabled ? 'bg-blue-600' : 'bg-gray-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    aria-pressed={enabled}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// ──────────────────────────────────────────────
// Row component
// ──────────────────────────────────────────────
const SettingRow = ({ label, description, icon: Icon, iconBg, iconColor, right }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={16} className={iconColor} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
    <div className="ml-4 flex-shrink-0">{right}</div>
  </div>
);

// ──────────────────────────────────────────────
// Main Settings Page
// ──────────────────────────────────────────────
function SettingsPage() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState(loadSettings);
  const [pushStatus, setPushStatus] = useState('idle'); // idle | requesting | granted | denied
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [verifyStep, setVerifyStep] = useState('idle'); // idle | verifying | verified | failed

  // Apply dark mode on mount + whenever it changes
  useEffect(() => {
    applyDarkMode(settings.darkMode);
  }, [settings.darkMode]);

  // Check current push notification permission on mount
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') setPushStatus('granted');
    else if (Notification.permission === 'denied') setPushStatus('denied');
  }, []);

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // ── Update a single setting key ──
  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // ── Toggle email notifications ──
  const handleEmailNotifications = () => {
    updateSetting('emailNotifications', !settings.emailNotifications);
    toast.success(
      settings.emailNotifications ? 'Email notifications disabled' : 'Email notifications enabled'
    );
  };

  // ── Toggle push notifications (real browser API) ──
  const handlePushNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Your browser does not support push notifications');
      return;
    }

    if (settings.pushNotifications) {
      // Turn off
      updateSetting('pushNotifications', false);
      toast.success('Push notifications disabled');
      return;
    }

    // Request permission
    setPushStatus('requesting');
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushStatus('granted');
        updateSetting('pushNotifications', true);
        // Send a test notification
        new Notification('Bug Tracker', {
          body: '🎉 Push notifications are now enabled!',
          icon: '/favicon.ico',
        });
        toast.success('Push notifications enabled!');
      } else if (permission === 'denied') {
        setPushStatus('denied');
        toast.error('Permission denied. Enable notifications in your browser settings.');
      }
    } catch (err) {
      setPushStatus('idle');
      toast.error('Failed to request notification permission');
    }
  };

  // ── Toggle weekly digest ──
  const handleWeeklyDigest = () => {
    updateSetting('weeklyDigest', !settings.weeklyDigest);
    toast.success(settings.weeklyDigest ? 'Weekly digest disabled' : 'Weekly digest enabled');
  };

  // ── Toggle dark mode ──
  const handleDarkMode = () => {
    const next = !settings.darkMode;
    updateSetting('darkMode', next);
    toast.success(next ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
  };

  // ── Language change ──
  const handleLanguage = (e) => {
    const lang = e.target.value;
    updateSetting('language', lang);
    document.documentElement.setAttribute('lang', lang);
    toast.success('Language updated — some labels may require a page reload');
  };

  // ── Change Password ──
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      toast.error('New password must be different from the current one');
      return;
    }
    setPasswordLoading(true);
    setVerifyStep('verifying');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerifyStep('verified');
        toast.success('Password changed successfully!');
        setTimeout(() => {
          setShowPasswordModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setVerifyStep('idle');
        }, 800);
      } else {
        setVerifyStep('failed');
        toast.error(data.message || 'Failed to change password');
      }
    } catch (err) {
      setVerifyStep('failed');
      toast.error('Server error — could not change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setVerifyStep('idle');
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  const pushDisabled = pushStatus === 'denied' || pushStatus === 'requesting';

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">All settings are saved automatically</p>
      </div>

      {/* ── Notifications ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5 flex items-center gap-2">
          <FiBell size={16} className="text-blue-600" /> Notifications
        </h2>
        <p className="text-xs text-gray-500 mb-4">Control how and when you receive alerts</p>

        <SettingRow
          label="Email Notifications"
          description="Receive ticket updates and mentions via email"
          icon={FiBell} iconBg="bg-blue-50" iconColor="text-blue-600"
          right={<Toggle enabled={settings.emailNotifications} onToggle={handleEmailNotifications} />}
        />

        <SettingRow
          label="Push Notifications"
          description={
            pushStatus === 'denied'
              ? '⚠️ Blocked by browser — update site permissions'
              : 'Real-time alerts in your browser'
          }
          icon={FiBell} iconBg="bg-indigo-50" iconColor="text-indigo-600"
          right={
            <div className="flex items-center gap-2">
              {pushStatus === 'requesting' && <FiLoader size={14} className="animate-spin text-gray-400" />}
              {pushStatus === 'denied' && <FiAlertCircle size={14} className="text-orange-500" />}
              <Toggle
                enabled={settings.pushNotifications}
                onToggle={handlePushNotifications}
                disabled={pushDisabled}
              />
            </div>
          }
        />

        <SettingRow
          label="Weekly Digest"
          description="Get a Monday summary of all open tickets"
          icon={FiBell} iconBg="bg-purple-50" iconColor="text-purple-600"
          right={<Toggle enabled={settings.weeklyDigest} onToggle={handleWeeklyDigest} />}
        />
      </div>

      {/* ── Appearance ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5 flex items-center gap-2">
          {settings.darkMode
            ? <FiMoon size={16} className="text-indigo-600" />
            : <FiSun size={16} className="text-yellow-500" />}
          Appearance
        </h2>
        <p className="text-xs text-gray-500 mb-4">Customize how Bug Tracker looks for you</p>

        <SettingRow
          label="Dark Mode"
          description={settings.darkMode ? 'Dark theme is active' : 'Switch to a darker color scheme'}
          icon={settings.darkMode ? FiMoon : FiSun}
          iconBg={settings.darkMode ? 'bg-indigo-50' : 'bg-yellow-50'}
          iconColor={settings.darkMode ? 'text-indigo-600' : 'text-yellow-500'}
          right={<Toggle enabled={settings.darkMode} onToggle={handleDarkMode} />}
        />

        <SettingRow
          label="Language"
          description="Select your preferred display language"
          icon={FiGlobe} iconBg="bg-green-50" iconColor="text-green-600"
          right={
            <select
              value={settings.language}
              onChange={handleLanguage}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="en">🇬🇧 English</option>
              <option value="hi">🇮🇳 Hindi</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="ja">🇯🇵 Japanese</option>
            </select>
          }
        />
      </div>

      {/* ── Security ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-0.5 flex items-center gap-2">
          <FiShield size={16} className="text-red-600" /> Security
        </h2>
        <p className="text-xs text-gray-500 mb-4">Manage your account security settings</p>

        <SettingRow
          label="Change Password"
          description={`Logged in as ${user?.email || 'you'}`}
          icon={FiLock} iconBg="bg-red-50" iconColor="text-red-600"
          right={
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Change
            </button>
          }
        />

        {/* Saved indicator */}
        <div className="mt-4 flex items-center gap-2 text-xs text-green-600">
          <FiCheck size={13} />
          <span>All settings are saved to your device automatically</span>
        </div>
      </div>

      {/* ── Change Password Modal ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

            {/* Modal Header */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <FiKey size={18} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                  <p className="text-xs text-gray-500">Verify your identity to proceed</p>
                </div>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mt-4 mb-2">
                {[
                  { label: 'Verify', step: 1 },
                  { label: 'New Password', step: 2 },
                  { label: 'Confirm', step: 3 },
                ].map(({ label, step }, i) => {
                  const filledSteps = currentPassword ? (newPassword.length >= 6 ? (confirmPassword ? 3 : 2) : 1) : 0;
                  const active = filledSteps >= step;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          verifyStep === 'verified' ? 'bg-green-500 text-white' :
                          active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {verifyStep === 'verified' ? <FiCheck size={10} /> : step}
                        </div>
                        <span className={`text-xs ${active ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{label}</span>
                      </div>
                      {i < 2 && <div className={`flex-1 h-px transition-colors ${active && filledSteps > step ? 'bg-blue-400' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Failed banner */}
            {verifyStep === 'failed' && (
              <div className="mx-8 mb-2 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <FiAlertCircle size={15} />
                <span>Verification failed — check your current password and try again.</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="px-8 pb-8 space-y-4">

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); if (verifyStep === 'failed') setVerifyStep('idle'); }}
                    placeholder="Enter your current password"
                    className={`w-full pr-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
                      verifyStep === 'failed' ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPasswords.current ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-2">
                <p className="text-xs text-gray-400 mb-3">Set your new password below</p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPasswords.new ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {newPassword && currentPassword && newPassword === currentPassword && (
                  <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                    <FiAlertCircle size={11} /> Must be different from your current password
                  </p>
                )}
                {newPassword && newPassword.length < 6 && (
                  <p className="text-xs text-gray-400 mt-1">{newPassword.length}/6 characters minimum</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className={`w-full pr-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-red-300 focus:ring-red-300'
                        : confirmPassword && newPassword === confirmPassword
                        ? 'border-green-400 focus:ring-green-300'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPasswords.confirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <FiAlertCircle size={11} /> Passwords do not match
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <FiCheck size={11} /> Passwords match — ready to save
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    passwordLoading ||
                    !currentPassword ||
                    newPassword.length < 6 ||
                    newPassword !== confirmPassword ||
                    newPassword === currentPassword
                  }
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {verifyStep === 'verifying' ? (
                    <><FiLoader size={14} className="animate-spin" /> Verifying...</>
                  ) : verifyStep === 'verified' ? (
                    <><FiCheck size={14} /> Done!</>
                  ) : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
