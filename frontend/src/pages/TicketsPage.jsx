import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiChevronDown, FiTrash2, FiEdit2, FiUser, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { useProjectStore } from '../store';
import bugService from '../services/bugService';
import projectService from '../services/projectService';
import IssueTypeIcon, { IssueTypeBadge } from '../components/IssueTypeIcon';
import toast from 'react-hot-toast';
import Breadcrumbs from '../components/Breadcrumbs';

function TicketsPage() {
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigneeId: '',
    search: '',
  });

  // Fetch tickets when project is selected or filters change
  useEffect(() => {
    if (!selectedProjectId) {
      setTickets([]);
      return;
    }

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await bugService.getAllBugs(selectedProjectId, filters);
        setTickets(res.data.data || []);
      } catch (error) {
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [selectedProjectId, filters]);

  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
    setFilters({ status: '', priority: '', assigneeId: '', search: '' });
    
    // Fetch project members for assignee filter
    if (e.target.value) {
      const fetchMembers = async () => {
        try {
          const res = await projectService.getProjectMembers(e.target.value);
          setProjectMembers(res.data.data || []);
        } catch (error) {
          console.error('Failed to fetch project members:', error);
        }
      };
      fetchMembers();
    } else {
      setProjectMembers([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await bugService.deleteBug(ticketId);
      setTickets(tickets.filter((t) => t.id !== ticketId));
      toast.success('Ticket deleted successfully');
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200',
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="flex-1 overflow-auto">
      {/* Page Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 md:px-8 py-6">
          <Breadcrumbs items={[{ label: 'Tickets' }]} />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Project Tickets</h1>
              <p className="text-gray-600 mt-2">View and manage project issues</p>
            </div>
            <button
              onClick={() => navigate('/create-ticket')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <FiPlus size={20} />
              New Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-4 md:px-8 py-8">
        {/* Project Selection & Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          {/* Row 1: Project Selection & Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={handleProjectChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.key})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Tickets
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by title, description, or ID..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!selectedProjectId}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Status, Priority, Assignee, Clear Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={!selectedProjectId}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="closed">Closed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={!selectedProjectId}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <select
                name="assigneeId"
                value={filters.assigneeId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={!selectedProjectId}
              >
                <option value="">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {projectMembers.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.user.first_name} {member.user.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ status: '', priority: '', assigneeId: '', search: '' });
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
                disabled={!selectedProjectId}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {!selectedProjectId ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiAlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Select a project to view tickets</p>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiAlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">No tickets found</p>
            <button
              onClick={() => navigate('/create-ticket')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <FiPlus size={20} />
              Create First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Assignee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/ticket/${ticket.id}`)}
                          className="text-left hover:text-blue-600 transition-colors"
                        >
                          <p className="font-medium text-gray-900 hover:underline">
                            {ticket.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {ticket.id.slice(0, 8)}...
                          </p>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <IssueTypeIcon type={ticket.issue_type || 'bug'} size="md" showLabel={true} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {ticket.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                              {ticket.assignee.first_name.charAt(0)}{ticket.assignee.last_name.charAt(0)}
                            </div>
                            <span className="text-sm text-gray-700 truncate">
                              {ticket.assignee.first_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-500">{formatDate(ticket.created_at)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/ticket/${ticket.id}`)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="Edit ticket"
                          >
                            <FiEdit2 size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-2 hover:bg-red-50 rounded transition-colors"
                            title="Delete ticket"
                          >
                            <FiTrash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <button
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                      className="text-left flex-1"
                    >
                      <p className="font-medium text-gray-900 hover:text-blue-600">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {ticket.id.slice(0, 8)}...
                      </p>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <FiEdit2 size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <IssueTypeBadge type={ticket.issue_type || 'bug'} size="xs" />
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {ticket.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {ticket.assignee.first_name.charAt(0)}
                        </div>
                        <span className="text-gray-700">{ticket.assignee.first_name} {ticket.assignee.last_name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-2">
                        <FiUser size={14} />
                        Unassigned
                      </span>
                    )}
                    <p className="text-xs text-gray-500">Created: {formatDate(ticket.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedProjectId && tickets.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{tickets.length}</span> ticket{tickets.length !== 1 ? 's' : ''} in{' '}
              <span className="font-semibold">{selectedProject?.name}</span>
              {tickets.filter((t) => !t.assignee_id).length > 0 && (
                <span>
                  {' • '}
                  <span className="text-yellow-700">
                    {tickets.filter((t) => !t.assignee_id).length} unassigned
                  </span>
                </span>
              )}
              {tickets.filter((t) => t.priority === 'critical').length > 0 && (
                <span>
                  {' • '}
                  <span className="text-red-700">
                    {tickets.filter((t) => t.priority === 'critical').length} critical
                  </span>
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketsPage;
