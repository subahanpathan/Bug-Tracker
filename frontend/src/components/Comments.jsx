import React, { useState } from 'react';
import { FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import commentService from '../services/commentService';

function Comments({ comments, onCommentDeleted, onCommentUpdated, currentUserId }) {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditStart = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleEditSave = async (commentId) => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await commentService.updateComment(commentId, editContent);
      onCommentUpdated(response.data.data);
      setEditingCommentId(null);
      setEditContent('');
      toast.success('Comment updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update comment');
      console.error('Error updating comment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      onCommentDeleted(commentId);
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || 'U'}${lastName?.[0] || 'S'}`.toUpperCase();
  };

  if (comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {getInitials(
                  comment.author?.first_name || 'Unknown',
                  comment.author?.last_name || 'User'
                )}
              </div>

              {/* Author Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">
                    {comment.author 
                      ? `${comment.author.first_name} ${comment.author.last_name}`
                      : 'Unknown User'
                    }
                  </p>
                  {comment.created_at !== comment.updated_at && (
                    <span className="text-xs text-gray-500 italic">(edited)</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(comment.created_at)}
                </p>
              </div>
            </div>

            {/* Actions */}
            {currentUserId === comment.author_id && (
              <div className="flex gap-1 ml-2">
                {editingCommentId !== comment.id && (
                  <>
                    <button
                      onClick={() => handleEditStart(comment)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit comment"
                      disabled={isUpdating}
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete comment"
                      disabled={isUpdating}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Comment Content */}
          {editingCommentId === comment.id ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
                disabled={isUpdating}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleEditCancel}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                  disabled={isUpdating}
                  title="Cancel"
                >
                  <FiX size={16} />
                </button>
                <button
                  onClick={() => handleEditSave(comment.id)}
                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                  disabled={isUpdating}
                  title="Save"
                >
                  <FiCheck size={16} />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default Comments;
