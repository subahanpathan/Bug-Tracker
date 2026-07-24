import React, { useState, useEffect } from 'react';
import { FiBell, FiMail, FiToggleRight, FiToggleLeft, FiSave, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmailPreferences = () => {
  const [preferences, setPreferences] = useState({
    ticket_created: true,
    ticket_assigned: true,
    ticket_updated: true,
    comment_added: true,
    team_updates: true,
    daily_digest: false,
    weekly_summary: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/email-preferences`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setPreferences(response.data);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error('Failed to load email preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/user/email-preferences`,
        preferences,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setHasChanges(false);
      toast.success('Email preferences saved');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save email preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleEnableAll = () => {
    setPreferences({
      ticket_created: true,
      ticket_assigned: true,
      ticket_updated: true,
      comment_added: true,
      team_updates: true,
      daily_digest: false,
      weekly_summary: false,
    });
    setHasChanges(true);
  };

  const handleDisableAll = () => {
    setPreferences({
      ticket_created: false,
      ticket_assigned: false,
      ticket_updated: false,
      comment_added: false,
      team_updates: false,
      daily_digest: false,
      weekly_summary: false,
    });
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const preferences_list = [
    {
      key: 'ticket_created',
      label: 'New Tickets',
      description: 'Receive email when a new ticket is created in your projects',
      icon: '🎫',
    },
    {
      key: 'ticket_assigned',
      label: 'Ticket Assignments',
      description: 'Get notified when a ticket is assigned to you',
      icon: '👤',
    },
    {
      key: 'ticket_updated',
      label: 'Ticket Updates',
      description: 'Receive updates when tickets you follow are modified',
      icon: '✏️',
    },
    {
      key: 'comment_added',
      label: 'New Comments',
      description: 'Get notified when someone comments on a ticket',
      icon: '💬',
    },
    {
      key: 'team_updates',
      label: 'Team Updates',
      description: 'Receive notifications about team member additions and changes',
      icon: '👥',
    },
    {
      key: 'daily_digest',
      label: 'Daily Digest',
      description: 'Receive a daily summary of all project activities',
      icon: '📅',
    },
    {
      key: 'weekly_summary',
      label: 'Weekly Summary',
      description: 'Get a comprehensive weekly report of project activities',
      icon: '📊',
    },
  ];

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FiMail size={24} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Email Preferences</h2>
        </div>
        <p className="text-gray-600">
          Control which notifications you receive via email
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleEnableAll}
          className="px-4 py-2 bg-green-50 text-green-700 border border-green-300 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
        >
          Enable All
        </button>
        <button
          onClick={handleDisableAll}
          className="px-4 py-2 bg-red-50 text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
        >
          Disable All
        </button>
      </div>

      {/* Preferences List */}
      <div className="space-y-3 mb-8">
        {preferences_list.map((pref) => (
          <div
            key={pref.key}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="text-2xl flex-shrink-0">{pref.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{pref.label}</h3>
                <p className="text-sm text-gray-600 mt-1">{pref.description}</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => handleToggle(pref.key)}
              className="ml-4 flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {preferences[pref.key] ? (
                <FiToggleRight size={28} className="text-green-600" />
              ) : (
                <FiToggleLeft size={28} className="text-gray-400" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-2">
        {hasChanges && (
          <p className="text-sm text-gray-600">
            You have unsaved changes
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="ml-auto flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 min-h-[40px]"
        >
          {saving ? (
            <>
              <FiLoader size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiSave size={18} />
              Save Preferences
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Even with email notifications disabled, you'll still receive
          in-app notifications and can view your notification center anytime.
        </p>
      </div>
    </div>
  );
};

export default EmailPreferences;
