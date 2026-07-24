import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiPlus } from 'react-icons/fi';
import { useProjectStore } from '../store';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import toast from 'react-hot-toast';

function ProjectSelector() {
  const navigate = useNavigate();
  const { projects, selectedProject, setProjects, setSelectedProject } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.getAllProjects();
        setProjects(response.data.data || []);
        
        // Set first project as selected if none selected
        if (!selectedProject && response.data.data && response.data.data.length > 0) {
          setSelectedProject(response.data.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projects.length === 0) {
      fetchProjects();
    }
  }, [projects.length, selectedProject, setProjects, setSelectedProject]);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors w-full sm:w-64"
      >
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900">
            {loading ? 'Loading...' : selectedProject?.name || 'Select Project'}
          </div>
          {selectedProject?.key && (
            <div className="text-xs text-gray-500">{selectedProject.key}</div>
          )}
        </div>
        <FiChevronDown
          size={18}
          className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-full sm:w-64">
          {projects.length > 0 ? (
            <>
              <div className="max-h-64 overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      selectedProject?.id === project.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-xs text-gray-500">{project.key}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/projects');
                }}
                className="w-full px-4 py-3 text-left text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium border-t border-gray-100"
              >
                <FiPlus size={18} />
                <span>New Project</span>
              </button>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-gray-600 text-sm mb-3">No projects found</p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/projects');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Create your first project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default ProjectSelector;
