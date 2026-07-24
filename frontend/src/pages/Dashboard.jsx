import React, { useEffect, useState } from 'react';
import { FiPlus, FiFilter, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import bugService from '../services/bugService';
import projectService from '../services/projectService';
import { useBugStore, useProjectStore } from '../store';
import toast from 'react-hot-toast';
import Breadcrumbs from '../components/Breadcrumbs';
import ProjectSelector from '../components/ProjectSelector';

function Dashboard() {
  const navigate = useNavigate();
  const { bugs, setBugs } = useBugStore();
  const { selectedProject } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all' });
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
    critical: 0,
  });

  // Fetch bugs based on selected project
  useEffect(() => {
    const fetchBugs = async () => {
      try {
        setLoading(true);
        let response;

        if (selectedProject?.id) {
          response = await bugService.getAllBugs(selectedProject.id, filters);
        } else {
          response = await bugService.getAllBugs(null, filters);
        }

        const bugsData = response.data.data || [];
        setBugs(bugsData);

        // Calculate stats
        const statsData = {
          total: bugsData.length,
          open: bugsData.filter((b) => b.status === 'open').length,
          inProgress: bugsData.filter((b) => b.status === 'in-progress').length,
          closed: bugsData.filter((b) => b.status === 'closed' || b.status === 'resolved').length,
          critical: bugsData.filter((b) => b.priority === 'critical').length,
        };
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch bugs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBugs();
  }, [filters, selectedProject, setBugs]);

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border border-red-200',
      high: 'bg-orange-100 text-orange-800 border border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border border-blue-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'in-review': 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'closed':
      case 'resolved':
        return <FiCheckCircle size={16} />;
      case 'in-progress':
        return <FiClock size={16} />;
      case 'open':
        return <FiAlertCircle size={16} />;
      default:
        return null;
    }
  };

  const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };

    return (
      <div className={`${colorClasses[color]} border rounded-lg p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <Icon size={32} className="opacity-20" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Page Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 md:px-8 py-6">
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                {selectedProject
                  ? `Manage ${selectedProject.name} tickets and issues`
                  : 'Manage and track all your tickets and issues'}
              </p>
            </div>
            <button
              onClick={() => navigate('/create-ticket')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <FiPlus size={20} />
              <span>New Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-4 md:px-8 py-8">
        {/* Project Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Project</h2>
          <ProjectSelector />
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={FiTrendingUp}
              label="Total Tickets"
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={FiAlertCircle}
              label="Open"
              value={stats.open}
              color="red"
            />
            <StatCard
              icon={FiClock}
              label="In Progress"
              value={stats.inProgress}
              color="yellow"
            />
            <StatCard
              icon={FiCheckCircle}
              label="Closed"
              value={stats.closed}
              color="green"
            />
            <StatCard
              icon={FiAlertCircle}
              label="Critical"
              value={stats.critical}
              color="red"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FiFilter size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Filter:</span>
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="in-review">In Review</option>
              <option value="closed">Closed</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {(filters.status !== 'all' || filters.priority !== 'all') && (
              <button
                onClick={() => setFilters({ status: 'all', priority: 'all' })}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Tickets List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedProject ? `${selectedProject.name} Tickets` : 'All Tickets'}
          </h2>

          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tickets...</p>
            </div>
          ) : bugs.length === 0 ? (
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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Assignee</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bugs.map((bug) => (
                      <tr
                        key={bug.id}
                        onClick={() => navigate(`/ticket/${bug.id}`)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            {bug.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                            {getStatusIcon(bug.status)}
                            <span className="capitalize">{bug.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                            {bug.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {bug.assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                {bug.assignee.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm text-gray-900">{bug.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {new Date(bug.created_at).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-3">
                {bugs.map((bug) => (
                  <div
                    key={bug.id}
                    onClick={() => navigate(`/ticket/${bug.id}`)}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {bug.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                        {getStatusIcon(bug.status)}
                        <span className="capitalize">{bug.status}</span>
                      </span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                        {bug.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div>
                        {bug.assignee ? (
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                              {bug.assignee.name?.charAt(0).toUpperCase()}
                            </div>
                            <span>{bug.assignee.name}</span>
                          </div>
                        ) : (
                          <span>Unassigned</span>
                        )}
                      </div>
                      <span>{new Date(bug.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
