import React, { useState } from 'react';
import { FiTrash2, FiUserPlus, FiChevronDown, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import projectService from '../services/projectService';
import clsx from 'clsx';

/**
 * AddMemberModal Component
 * Modal dialog for adding new team members to a project
 */
export const AddMemberModal = ({ isOpen, onClose, projectId, onMemberAdded, currentMembers = [] }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'developer'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if already a member
    if (currentMembers.some(m => m.user?.email === formData.email)) {
      toast.error('This user is already a member of the project');
      return;
    }

    setLoading(true);

    try {
      const res = await projectService.addMember(projectId, {
        email: formData.email,
        role: formData.role
      });

      toast.success('Member added successfully');
      onMemberAdded(res.data.data);
      setFormData({ email: '', role: 'developer' });
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add member';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Team Member</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="team@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the email of the user you want to add
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="viewer">Viewer (read-only)</option>
              <option value="developer">Developer (create/edit)</option>
              <option value="admin">Admin (manage project)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Viewer: Read-only access | Developer: Create and edit tickets | Admin: Manage team & settings
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <FiUserPlus size={18} />
                  Add Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * TeamMemberList Component
 * Displays list of project members with actions
 */
const TeamMemberList = ({ members, projectOwnerId, onMemberRemoved, onRoleChanged, loading }) => {
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const handleRemoveMember = async (memberId, memberUserId) => {
    if (memberUserId === projectOwnerId) {
      toast.error('Cannot remove project owner');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this member?')) return;

    setUpdatingId(memberId);
    try {
      await projectService.removeMember(members[0]?.project_id || '', memberId);
      toast.success('Member removed successfully');
      onMemberRemoved(memberId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    setUpdatingId(memberId);
    try {
      const res = await projectService.updateMemberRole(members[0]?.project_id || '', memberId, newRole);
      toast.success('Role updated successfully');
      onRoleChanged(memberId, newRole);
      setExpandedMemberId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      developer: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800',
      member: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.member;
  };

  const isOwner = (userId) => userId === projectOwnerId;

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No team members yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {member.user?.first_name?.charAt(0)}
              {member.user?.last_name?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {member.user?.first_name} {member.user?.last_name}
                {isOwner(member.user_id) && (
                  <span className="ml-2 text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                    Owner
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">{member.user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                  getRoleColor(member.role || 'member'),
                  isOwner(member.user_id) ? 'cursor-default' : 'hover:opacity-80'
                )}
                disabled={isOwner(member.user_id) || updatingId === member.id}
              >
                {member.role?.charAt(0).toUpperCase() + (member.role?.slice(1) || 'Member').slice(1)}
                {!isOwner(member.user_id) && (
                  <FiChevronDown
                    size={16}
                    className={`transition-transform ${expandedMemberId === member.id ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {expandedMemberId === member.id && !isOwner(member.user_id) && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {['viewer', 'developer', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(member.id, role)}
                      className={clsx(
                        'w-full text-left px-4 py-2 text-sm font-medium transition-colors',
                        member.role === role
                          ? 'bg-blue-50 text-blue-700 border-b border-blue-100'
                          : 'hover:bg-gray-50'
                      )}
                      disabled={updatingId === member.id}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!isOwner(member.user_id) && (
              <button
                onClick={() => handleRemoveMember(member.id, member.user_id)}
                className="p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="Remove member"
                disabled={updatingId === member.id}
              >
                <FiTrash2 size={18} className="text-red-600" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * TeamMemberManager Component
 * Main component for managing project team members
 */
const TeamMemberManager = ({ projectId, projectOwnerId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  React.useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await projectService.getProjectMembers(projectId);
        setMembers(res.data.data || []);
      } catch (error) {
        toast.error('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchMembers();
    }
  }, [projectId]);

  const handleMemberAdded = (newMember) => {
    setMembers([...members, newMember]);
  };

  const handleMemberRemoved = (memberId) => {
    setMembers(members.filter((m) => m.id !== memberId));
  };

  const handleRoleChanged = (memberId, newRole) => {
    setMembers(
      members.map((m) =>
        m.id === memberId ? { ...m, role: newRole } : m
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage who has access to this project
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <FiUserPlus size={18} />
          Add Member
        </button>
      </div>

      {/* Members List */}
      <div className="card">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading team members...</p>
          </div>
        ) : (
          <TeamMemberList
            members={members}
            projectOwnerId={projectOwnerId}
            onMemberRemoved={handleMemberRemoved}
            onRoleChanged={handleRoleChanged}
            loading={loading}
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-xs font-semibold text-blue-600 uppercase">Total Members</p>
          <p className="text-2xl font-bold text-blue-900 mt-2">{members.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <p className="text-xs font-semibold text-green-600 uppercase">Developers</p>
          <p className="text-2xl font-bold text-green-900 mt-2">
            {members.filter((m) => m.role === 'developer').length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <p className="text-xs font-semibold text-purple-600 uppercase">Admins</p>
          <p className="text-2xl font-bold text-purple-900 mt-2">
            {members.filter((m) => m.role === 'admin' || m.user_id === projectOwnerId).length}
          </p>
        </div>
      </div>

      {/* Role Legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Role Permissions</h4>
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-medium text-purple-900">Owner</p>
            <p className="text-gray-600">Full control - create, edit, delete, manage team</p>
          </div>
          <div>
            <p className="font-medium text-blue-900">Admin</p>
            <p className="text-gray-600">Manage project - create, edit, delete tickets, manage team</p>
          </div>
          <div>
            <p className="font-medium text-green-900">Developer</p>
            <p className="text-gray-600">Create and edit tickets - view and modify assigned tickets</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Viewer</p>
            <p className="text-gray-600">Read-only access - view tickets and comments only</p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projectId={projectId}
        onMemberAdded={handleMemberAdded}
        currentMembers={members}
      />
    </div>
  );
};

export default TeamMemberManager;
