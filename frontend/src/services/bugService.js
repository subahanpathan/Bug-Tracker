import api from './api';

export const bugService = {
  // Ticket/Bug CRUD
  getAllBugs: (projectId, filters = {}) => {
    // Handle the special "unassigned" filter
    const params = { projectId, ...filters };
    if (filters.assigneeId === 'unassigned') {
      delete params.assigneeId;
      params.isUnassigned = true;
    }
    return api.get('/bugs', { params });
  },

  getBugById: (id) => {
    return api.get(`/bugs/${id}`);
  },

  createBug: (bugData) => {
    return api.post('/bugs', bugData);
  },

  updateBug: (id, bugData) => {
    return api.put(`/bugs/${id}`, bugData);
  },

  updateTicket: (id, ticketData) => {
    return api.put(`/bugs/${id}`, ticketData);
  },

  deleteBug: (id) => {
    return api.delete(`/bugs/${id}`);
  },

  // Ticket Assignment
  assignTicket: (ticketId, assigneeId) => {
    return api.post(`/bugs/${ticketId}/assign`, { assigneeId });
  },

  unassignTicket: (ticketId) => {
    return api.post(`/bugs/${ticketId}/unassign`);
  },

  // Comments
  getComments: (bugId) => {
    return api.get(`/comments/bug/${bugId}`);
  },

  addComment: (bugId, content) => {
    return api.post('/comments', { bugId, content });
  },

  updateComment: (id, content) => {
    return api.put(`/comments/${id}`, { content });
  },

  deleteComment: (id) => {
    return api.delete(`/comments/${id}`);
  },

  // Attachments
  uploadAttachment: (bugId, file) => {
    const formData = new FormData();
    formData.append('bugId', bugId);
    formData.append('file', file);
    return api.post('/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getAttachments: (bugId) => {
    return api.get(`/attachments/bug/${bugId}`);
  },

  deleteAttachment: (id) => {
    return api.delete(`/attachments/${id}`);
  },

  // Helper to get secured stream URL for an attachment
  getAttachmentStreamUrl: (fileName) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${baseURL}/attachments/stream/${fileName}`;
  },
};

export default bugService;
