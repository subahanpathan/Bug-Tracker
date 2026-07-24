import React, { useState } from 'react';
import { FiUser, FiMail, FiShield, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuthStore } from '../store/index.js';
import toast from 'react-hot-toast';
import api from '../services/api';

function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
  });

  const getInitials = () => {
    if (form.firstName && form.lastName)
      return `${form.firstName[0]}${form.lastName[0]}`.toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return 'U';
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put(`/users/${user.id}`, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: user.role
      });
      
      setUser(res.data.data);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      {/* Avatar & Name Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {getInitials()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {form.firstName || form.lastName
                ? `${form.firstName} ${form.lastName}`.trim()
                : user?.email}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
              <FiShield size={11} /> Admin
            </span>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FiEdit2 size={15} /> Edit
            </button>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              {editing ? (
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-800">{form.firstName || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              {editing ? (
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-800">{form.lastName || '—'}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><FiMail size={13} /> Email Address</span>
            </label>
            <p className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-500">{user?.email} <span className="text-xs text-gray-400">(cannot be changed)</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><FiUser size={13} /> Role</span>
            </label>
            <p className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-500">Administrator</p>
          </div>

          {editing && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={15} /> Save Changes
                  </>
                )}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <FiX size={15} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
