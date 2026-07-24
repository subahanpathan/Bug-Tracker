import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useProjectStore } from '../store';
import bugService from '../services/bugService';
import projectService from '../services/projectService';
import IssueTypeIcon, { IssueTypeSelector } from '../components/IssueTypeIcon';
import toast from 'react-hot-toast';

function BugCreatePage() {
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    issueType: 'bug',
    assigneeId: '',
  });

  // Fetch project members when project is selected
  useEffect(() => {
    if (!formData.projectId) {
      setProjectMembers([]);
      return;
    }

    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const res = await projectService.getProjectMembers(formData.projectId);
        setProjectMembers(res.data.data || []);
      } catch (error) {
        toast.error('Failed to load project members');
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [formData.projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.projectId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await bugService.createBug({
        title: formData.title,
        description: formData.description,
        projectId: formData.projectId,
        priority: formData.priority,
        issueType: formData.issueType,
        assigneeId: formData.assigneeId || undefined,
      });
      toast.success('Ticket created successfully');
      navigate('/tickets');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-blue-600 bg-blue-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <FiArrowLeft size={20} />
        <span>Back to Tickets</span>
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Ticket</h1>
      <p className="text-gray-600 mb-8">Report and track a new issue or bug</p>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input"
            placeholder="Brief description of the issue"
            required
            maxLength={255}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.title.length}/255</p>
        </div>

        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project <span className="text-red-500">*</span>
          </label>
          <select
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.key})
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            placeholder="Detailed description of the issue..."
            rows="6"
          />
        </div>

        {/* Issue Type & Priority & Assignee */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
            <IssueTypeSelector
              value={formData.issueType}
              onChange={(value) => setFormData({ ...formData, issueType: value })}
            />
            {formData.issueType && (
              <div className="mt-2">
                <IssueTypeIcon type={formData.issueType} size="md" showLabel={true} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            {formData.priority && (
              <div className={`mt-2 px-2 py-1 rounded text-xs font-medium inline-block ${getPriorityColor(formData.priority)}`}>
                {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To {loadingMembers && <span className="text-xs text-gray-500">(loading...)</span>}
            </label>
            <select
              name="assigneeId"
              value={formData.assigneeId}
              onChange={handleChange}
              className="input"
              disabled={!formData.projectId || loadingMembers}
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.user.first_name} {member.user.last_name}
                </option>
              ))}
            </select>
            {!formData.projectId && (
              <p className="text-xs text-gray-500 mt-1">Select a project first</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title || !formData.projectId}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BugCreatePage;
