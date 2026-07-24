import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSettings, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore, useProjectStore } from '../store';
import projectService from '../services/projectService';
import TeamMemberManager from '../components/TeamMemberManager';
import toast from 'react-hot-toast';
import Breadcrumbs from '../components/Breadcrumbs';

function ProjectSettingsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { projects } = useProjectStore();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    key: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await projectService.getProjectById(projectId);
        setProject(res.data.data);
        setFormData({
          name: res.data.data.name,
          description: res.data.data.description || '',
          key: res.data.data.key
        });
      } catch (error) {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProject = async () => {
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await projectService.updateProject(projectId, {
        name: formData.name,
        description: formData.description
      });
      setProject(res.data.data);
      setEditMode(false);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await projectService.deleteProject(projectId);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading project settings...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Project not found</p>
      </div>
    );
  }

  const isProjectOwner = project.owner_id === user?.id;

  return (
    <div className="flex-1 overflow-auto">
      {/* Page Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 md:px-8 py-6">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <FiArrowLeft size={20} />
            <span>Back to Projects</span>
          </button>

          <Breadcrumbs items={[
            { label: 'Projects', href: '/projects' },
            { label: project.name }
          ]} />

          <div className="flex items-center gap-3 mt-4">
            <FiSettings size={32} className="text-gray-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1">Project Key: <span className="font-mono font-semibold">{project.key}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-4 md:px-8 py-8 max-w-4xl">
        {!isProjectOwner && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
            <FiAlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-blue-900">You are not the project owner</p>
              <p className="text-sm text-blue-700 mt-1">
                You have limited access to project settings. Only the project owner can modify settings and manage team members.
              </p>
            </div>
          </div>
        )}

        {/* Project Details Section */}
        <div className="card mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Project Details</h2>
              <p className="text-sm text-gray-600 mt-1">Basic information about this project</p>
            </div>
            {isProjectOwner && (
              editMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProject}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving && <div className="animate-spin h-4 w-4 border-b-2 border-white"></div>}
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Edit Project
                </button>
              )
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isProjectOwner}
                />
              ) : (
                <p className="text-gray-900 py-2">{project.name}</p>
              )}
            </div>

            {/* Key (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Key (Auto-generated)
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-mono">
                {project.key}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Used to identify tickets (e.g., <span className="font-mono">{project.key}-001</span>)
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              {editMode ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isProjectOwner}
                  placeholder="Describe your project..."
                />
              ) : (
                <p className="text-gray-900 py-2 whitespace-pre-wrap">
                  {project.description || <span className="text-gray-400">No description</span>}
                </p>
              )}
            </div>

            {/* Created Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created
              </label>
              <p className="text-gray-900 py-2">
                {new Date(project.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        {isProjectOwner && (
          <div className="card mb-8">
            <TeamMemberManager 
              projectId={projectId}
              projectOwnerId={project.owner_id}
            />
          </div>
        )}

        {/* Danger Zone */}
        {isProjectOwner && (
          <div className="card bg-red-50 border-2 border-red-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                <p className="text-sm text-red-700 mt-1">
                  Irreversible and destructive actions
                </p>
              </div>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting && <div className="animate-spin h-4 w-4 border-b-2 border-white"></div>}
                <FiTrash2 size={18} />
                Delete Project
              </button>
            </div>
            <p className="text-sm text-red-700 mt-4">
              Deleting this project will permanently remove it and all associated tickets. This action cannot be undone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectSettingsPage;
