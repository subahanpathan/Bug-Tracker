import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';
import { useProjectStore } from '../store';
import bugService from '../services/bugService';
import toast from 'react-hot-toast';
import Breadcrumbs from '../components/Breadcrumbs';
import KanbanBoard from '../components/KanbanBoard';

function KanbanPage() {
  const navigate = useNavigate();
  const { projects } = useProjectStore();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch tickets when project is selected
  useEffect(() => {
    if (!selectedProjectId) {
      setTickets([]);
      return;
    }

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await bugService.getAllBugs(selectedProjectId);
        setTickets(res.data.data || []);
      } catch (error) {
        console.error('Failed to load tickets:', error);
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [selectedProjectId]);

  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="flex-1 overflow-auto">
      {/* Page Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-4 md:px-8 py-6">
          <Breadcrumbs items={[{ label: 'Kanban Board' }]} />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Kanban Board</h1>
              <p className="text-gray-600 mt-2">Manage tickets with drag and drop</p>
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
        {/* Project Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={handleProjectChange}
              className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a project to view Kanban board...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.key})
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Project:</strong> {selectedProject.name}
              </p>
              {selectedProject.description && (
                <p className="text-sm text-blue-800 mt-1">{selectedProject.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Kanban Board */}
        <KanbanBoard projectId={selectedProjectId} tickets={tickets} setTickets={setTickets} loading={loading} />

        {/* Help Section */}
        {selectedProjectId && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiAlertCircle size={18} />
              How to Use the Kanban Board
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <strong>Drag Tickets:</strong> Click and drag any ticket card to move it between columns
              </li>
              <li>
                <strong>Update Status:</strong> When you move a ticket, its status is automatically saved to the database
              </li>
              <li>
                <strong>View Details:</strong> Click the "View" button or ticket title to see full details
              </li>
              <li>
                <strong>Delete Ticket:</strong> Click the "Delete" button to remove a ticket (requires confirmation)
              </li>
              <li>
                <strong>Columns:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• <strong>To Do</strong> - Open tickets waiting to be worked on</li>
                  <li>• <strong>In Progress</strong> - Tickets currently being worked on</li>
                  <li>• <strong>Done</strong> - Completed or resolved tickets</li>
                </ul>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default KanbanPage;
