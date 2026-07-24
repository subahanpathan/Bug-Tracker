import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiChevronDown, FiTrash2, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import filterService from '../services/filterService';

const FilterBar = ({ projectId, currentFilters, onFilterChange }) => {
  const [savedFilters, setSavedFilters] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchSavedFilters();
    }
  }, [projectId]);

  const fetchSavedFilters = async () => {
    try {
      setLoading(true);
      const data = await filterService.getProjectFilters(projectId);
      setSavedFilters(data || []);
    } catch (error) {
      console.error('Failed to load filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      toast.error('Filter name required');
      return;
    }

    try {
      setIsSaving(true);
      const newFilter = await filterService.saveFilter(projectId, filterName, currentFilters);
      setSavedFilters((prev) => [...prev, newFilter]);
      setFilterName('');
      setShowSaveModal(false);
      toast.success('Filter saved successfully');
    } catch (error) {
      toast.error('Failed to save filter');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadFilter = async (filter) => {
    try {
      onFilterChange(filter.config);
      setIsOpen(false);
      // Mark as default if user wants (optional)
    } catch (error) {
      toast.error('Failed to load filter');
    }
  };

  const handleDeleteFilter = async (filterId) => {
    if (!window.confirm('Delete this filter?')) return;

    try {
      await filterService.deleteFilter(filterId);
      setSavedFilters((prev) => prev.filter((f) => f.id !== filterId));
      toast.success('Filter deleted');
    } catch (error) {
      toast.error('Failed to delete filter');
    }
  };

  const handleClearAllFilters = () => {
    if (!window.confirm('Clear all active filters?')) return;
    onFilterChange({});
    filterService.clearLocalFilter(projectId);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Clear Filters Button */}
      {Object.keys(currentFilters).length > 0 && (
        <button
          onClick={handleClearAllFilters}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm min-h-[36px]"
        >
          <FiX size={16} />
          Clear filters
        </button>
      )}

      {/* Save Current Filter */}
      <button
        onClick={() => setShowSaveModal(true)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm min-h-[36px]"
        title="Save current filters"
      >
        <FiSave size={16} />
        Save filters
      </button>

      {/* Load Saved Filters */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm min-h-[36px]"
        >
          <span>Saved filters</span>
          {loading ? (
            <FiLoader size={16} className="animate-spin" />
          ) : (
            <FiChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <FiLoader size={20} className="animate-spin mx-auto" />
              </div>
            ) : savedFilters.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <p>No saved filters</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between group cursor-pointer"
                  >
                    <button
                      onClick={() => handleLoadFilter(filter)}
                      className="flex-1 text-left text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {filter.name}
                    </button>
                    <button
                      onClick={() => handleDeleteFilter(filter.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all"
                    >
                      <FiTrash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Filter Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Save current filters</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="px-6 py-4">
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="e.g., High Priority Items"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleSaveFilter()}
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                disabled={isSaving || !filterName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 min-h-[40px] flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <FiLoader size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    Save Filter
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
