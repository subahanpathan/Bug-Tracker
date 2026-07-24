import api from './api';

export const projectService = {
  // Project CRUD
  getAllProjects: () => {
    return api.get('/projects');
  },

  getProjectById: (id) => {
    return api.get(`/projects/${id}`);
  },

  createProject: (projectData) => {
    return api.post('/projects', projectData);
  },

  updateProject: (id, projectData) => {
    return api.put(`/projects/${id}`, projectData);
  },

  deleteProject: (id) => {
    return api.delete(`/projects/${id}`);
  },

  // Project Members
  getProjectMembers: (projectId) => {
    if (!projectId) {
      return Promise.resolve({ data: { status: 'success', data: [] } });
    }
    return api.get(`/projects/${projectId}/members`);
  },

  addMember: (projectId, memberData) => {
    return api.post(`/projects/${projectId}/members`, memberData);
  },

  removeMember: (projectId, memberId) => {
    return api.delete(`/projects/${projectId}/members/${memberId}`);
  },

  updateMemberRole: (projectId, memberId, role) => {
    return api.put(`/projects/${projectId}/members/${memberId}`, { role });
  },
};

export default projectService;
