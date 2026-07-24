import api from './api';

export const commentService = {
  // Get all comments for a bug
  getComments: (bugId) => {
    return api.get(`/comments/bug/${bugId}`);
  },

  // Add a new comment
  addComment: (bugId, content) => {
    return api.post('/comments', { bugId, content });
  },

  // Update a comment
  updateComment: (commentId, content) => {
    return api.put(`/comments/${commentId}`, { content });
  },

  // Delete a comment
  deleteComment: (commentId) => {
    return api.delete(`/comments/${commentId}`);
  },
};

export default commentService;
