import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSettings, FiTrash2, FiUsers, FiX, FiChevronDown } from 'react-icons/fi';
import projectService from '../services/projectService';
import { useProjectStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';

function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, setProjects, removeProject } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({ name: '', description: '', key: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');

  // Fetch all projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getAllProjects();
        setProjects(response.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [setProjects]);

  // Fetch project members when expanding project
  useEffect(() => {
    if (expandedProject) {
      fetchMembers(expandedProject);
    }
  }, [expandedProject]);

  const fetchMembers = async (projectId) => {
    setMemberLoading(true);
    try {
      const response = await projectService.getProjectMembers(projectId);
      setProjectMembers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setMemberLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await projectService.createProject(formData);
      setProjects([response.data.data, ...projects]);
      setFormData({ name: '', description: '', key: '' });
      setShowCreateModal(false);
      toast.success('Project created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure? This will delete all associated data.')) return;

    try {
      await projectService.deleteProject(id);
      removeProject(id);
      if (expandedProject === id) setExpandedProject(null);
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const response = await projectService.addMember(selectedProject, {
        email: memberEmail,
        role: memberRole
      });
      setProjectMembers([...projectMembers, response.data.data]);
      setMemberEmail('');
      setMemberRole('member');
      setShowMemberModal(false);
      toast.success('Member added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the project?')) return;

    try {
      await projectService.removeMember(selectedProject, memberId);
      setProjectMembers(projectMembers.filter(m => m.id !== memberId));
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      const response = await projectService.updateMemberRole(selectedProject, memberId, newRole);
      setProjectMembers(projectMembers.map(m => 
        m.id === memberId ? response.data.data : m
      ));
      toast.success('Member role updated');
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const getProjectOwner = (project) => {
    if (!project.owner) return 'Unknown';
    return `${project.owner.first_name} ${project.owner.last_name}`;
  };

  const getMemberCount = (project) => {
    return project.members?.length || 0;
  };

  const isProjectOwner = (project) => {
    return project.owner_id === user?.id;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage your projects and team members</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus size={20} />
          <span>New Project</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No projects yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="card">
              {/* Project Header */}
              <div className="flex justify-between items-start">
                <button
                  onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-3">
                    <FiChevronDown 
                      size={20} 
                      className={`transform transition ${expandedProject === project.id ? 'rotate-180' : ''}`}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {project.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </button>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedProject(project.id);
                      setShowMemberModal(true);
                    }}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Manage Members"
                  >
                    <FiUsers size={18} className="text-blue-600" />
                  </button>
                  {isProjectOwner(project) && (
                    <>
                      <button 
                        onClick={() => navigate(`/projects/${project.id}/settings`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Project Settings"
                      >
                        <FiSettings size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={18} className="text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Project Info Bar */}
              <div className="flex gap-6 mt-4 pt-4 border-t border-gray-200 text-sm">
                <div>
                  <span className="text-gray-600">Key:</span>
                  <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{project.key}</span>
                </div>
                <div>
                  <span className="text-gray-600">Owner:</span>
                  <span className="ml-2">{getProjectOwner(project)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Members:</span>
                  <span className="ml-2 font-semibold">{getMemberCount(project)}</span>
                </div>
              </div>

              {/* Expanded Members List */}
              {expandedProject === project.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUsers size={18} />
                    Team Members
                  </h4>

                  {memberLoading ? (
                    <p className="text-gray-600 text-sm">Loading members...</p>
                  ) : projectMembers.length === 0 ? (
                    <p className="text-gray-600 text-sm">No members yet</p>
                  ) : (
                    <div className="space-y-3">
                      {projectMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.user.first_name} {member.user.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{member.user.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {isProjectOwner(project) && member.user_id !== project.owner_id ? (
                              <>
                                <select
                                  value={member.role}
                                  onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                                  className="text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="member">Member</option>
                                  <option value="manager">Manager</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="p-1 hover:bg-red-100 rounded transition-colors"
                                >
                                  <FiX size={16} className="text-red-600" />
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="text-sm font-medium px-3 py-1 bg-gray-200 rounded">
                                  {member.role}
                                </span>
                                {member.user_id === project.owner_id && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Owner
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isProjectOwner(project) && (
                    <button
                      onClick={() => {
                        setSelectedProject(project.id);
                        setShowMemberModal(true);
                      }}
                      className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Member
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Mobile App"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Key *
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase().slice(0, 10) })}
                  className="input"
                  placeholder="e.g., PROJ"
                  maxLength="10"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier for the project</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="Describe your project..."
                  rows="3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '', key: '' });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add Team Member</h2>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="input"
                  placeholder="team@example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">User must have an account</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="input"
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMemberModal(false);
                    setMemberEmail('');
                    setMemberRole('member');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
