import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiMessageSquare, FiUser } from 'react-icons/fi';
import bugService from '../services/bugService';
import commentService from '../services/commentService';
import projectService from '../services/projectService';
import IssueTypeIcon, { IssueTypeSelector } from '../components/IssueTypeIcon';
import toast from 'react-hot-toast';
import CommentForm from '../components/CommentForm';
import Comments from '../components/Comments';
import { useAuthStore } from '../store';

function BugDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [projectMembers, setProjectMembers] = useState([]);
  const [assigningUser, setAssigningUser] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  useEffect(() => {
    const fetchBugDetails = async () => {
      try {
        const [bugRes, commentsRes] = await Promise.all([
          bugService.getBugById(id),
          commentService.getComments(id),
        ]);
        setBug(bugRes.data.data);
        setEditData(bugRes.data.data);
        setComments(commentsRes.data.data || []);

        // Fetch project members for assignment
        if (bugRes.data.data.project_id) {
          const membersRes = await projectService.getProjectMembers(bugRes.data.data.project_id);
          setProjectMembers(membersRes.data.data || []);
        }
      } catch (error) {
        toast.error('Failed to fetch ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchBugDetails();
  }, [id]);

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter((c) => c.id !== commentId));
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments(comments.map((c) => (c.id === updatedComment.id ? updatedComment : c)));
  };

  const handleUpdate = async () => {
    try {
      await bugService.updateBug(id, editData);
      setBug(editData);
      setEditMode(false);
      toast.success('Ticket updated successfully');
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  const handleAssignUser = async (userId) => {
    setAssigningUser(true);
    try {
      const res = await bugService.assignTicket(id, userId);
      setBug(res.data.data);
      setEditData(res.data.data);
      setShowAssigneeDropdown(false);
      toast.success('Ticket assigned successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setAssigningUser(false);
    }
  };

  const handleUnassign = async () => {
    setAssigningUser(true);
    try {
      const res = await bugService.unassignTicket(id);
      setBug(res.data.data);
      setEditData(res.data.data);
      setShowAssigneeDropdown(false);
      toast.success('Ticket unassigned');
    } catch (error) {
      toast.error('Failed to unassign ticket');
    } finally {
      setAssigningUser(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await bugService.deleteBug(id);
      toast.success('Ticket deleted successfully');
      navigate('/tickets');
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'in-review': 'bg-purple-100 text-purple-800',
      closed: 'bg-green-100 text-green-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return colors[status] || colors.open;
  };

  if (loading) {
    return <div className="p-8"><p className="text-gray-600">Loading...</p></div>;
  }

  if (!bug) {
    return <div className="p-8"><p className="text-gray-600">Ticket not found</p></div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <FiArrowLeft size={20} />
        <span>Back to Tickets</span>
      </button>

      {/* Ticket Details */}
      <div className="card mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {editMode ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="input text-2xl font-bold mb-4"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{bug.title}</h1>
            )}

            <div className="flex gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(bug.priority)}`}>
                {bug.priority.charAt(0).toUpperCase() + bug.priority.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bug.status)}`}>
                {bug.status.charAt(0).toUpperCase() + bug.status.slice(1).replace('-', ' ')}
              </span>
              <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                <IssueTypeIcon type={bug.issue_type || 'bug'} size="sm" showLabel={true} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="btn-primary btn-small"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="btn-secondary btn-small"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit ticket"
                >
                  <FiEdit2 size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete ticket"
                >
                  <FiTrash2 size={20} className="text-red-600" />
                </button>
              </>
            )}
          </div>
        </div>

        {editMode ? (
          <textarea
            value={editData.description || ''}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="input mb-4"
            rows="4"
          />
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap mb-6">
            {bug.description || 'No description provided'}
          </p>
        )}

        {/* Metadata Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Created */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Created</p>
              <p className="text-gray-900 font-medium mt-1">
                {new Date(bug.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(bug.created_at).toLocaleTimeString()}
              </p>
            </div>

            {/* Last Updated */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Updated</p>
              <p className="text-gray-900 font-medium mt-1">
                {new Date(bug.updated_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(bug.updated_at).toLocaleTimeString()}
              </p>
            </div>

            {/* Reporter */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Reporter</p>
              {bug.reporter ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {bug.reporter.first_name.charAt(0)}{bug.reporter.last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">
                      {bug.reporter.first_name} {bug.reporter.last_name}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Unknown</p>
              )}
            </div>

            {/* Assignee */}
            <div className="relative">
              <p className="text-xs font-semibold text-gray-500 uppercase">Assignee</p>
              <div className="mt-1">
                {bug.assignee ? (
                  <button
                    onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded transition-colors w-full"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                      {bug.assignee.first_name.charAt(0)}{bug.assignee.last_name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-gray-900 font-medium text-sm">
                        {bug.assignee.first_name}
                      </p>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded transition-colors w-full text-gray-500"
                  >
                    <FiUser size={16} />
                    <span className="text-sm">Assign to user</span>
                  </button>
                )}

                {/* Assignee Dropdown */}
                {showAssigneeDropdown && (
                  <div className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-64">
                    <div className="p-2 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 px-2 py-1">
                        Team Members
                      </p>
                    </div>
                    {projectMembers.length === 0 ? (
                      <p className="text-xs text-gray-500 p-3">No team members available</p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {projectMembers.map((member) => (
                          <button
                            key={member.user_id}
                            onClick={() => handleAssignUser(member.user_id)}
                            disabled={assigningUser}
                            className="w-full text-left flex items-center gap-2 p-3 hover:bg-blue-50 transition-colors disabled:opacity-50"
                          >
                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {member.user.first_name.charAt(0)}{member.user.last_name.charAt(0)}
                            </div>
                            <div className="text-sm">
                              <p className="text-gray-900 font-medium">
                                {member.user.first_name} {member.user.last_name}
                              </p>
                              <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {bug.assignee && (
                      <>
                        <div className="border-t border-gray-200"></div>
                        <button
                          onClick={handleUnassign}
                          disabled={assigningUser}
                          className="w-full text-left text-sm p-3 hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
                        >
                          Unassign
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Issue Type */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Issue Type</p>
              {editMode ? (
                <IssueTypeSelector
                  value={editData.issue_type || 'bug'}
                  onChange={(value) => setEditData({ ...editData, issue_type: value })}
                  disabled={false}
                />
              ) : (
                <div className="mt-2">
                  <IssueTypeIcon type={bug.issue_type || 'bug'} size="md" showLabel={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiMessageSquare size={24} />
          Comments ({comments.length})
        </h2>

        {/* Add Comment Form */}
        <CommentForm bugId={id} onCommentAdded={handleCommentAdded} />

        {/* Comments List */}
        <Comments 
          comments={comments} 
          onCommentDeleted={handleCommentDeleted}
          onCommentUpdated={handleCommentUpdated}
          currentUserId={userId}
        />
      </div>
    </div>
  );
}

export default BugDetailPage;
