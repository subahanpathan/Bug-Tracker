// Frontend filter preferences service
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class FilterService {
  // Save filter preference for a project
  async saveFilter(projectId, filterName, filterConfig) {
    const response = await axios.post(
      `${API_URL}/filters`,
      {
        project_id: projectId,
        name: filterName,
        config: filterConfig, // { status, priority, assignee, type }
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    return response.data;
  }

  // Get all saved filters for a project
  async getProjectFilters(projectId) {
    const response = await axios.get(`${API_URL}/projects/${projectId}/filters`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  }

  // Get a specific filter
  async getFilter(filterId) {
    const response = await axios.get(`${API_URL}/filters/${filterId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  }

  // Update filter
  async updateFilter(filterId, filterConfig) {
    const response = await axios.put(
      `${API_URL}/filters/${filterId}`,
      { config: filterConfig },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    return response.data;
  }

  // Delete filter
  async deleteFilter(filterId) {
    await axios.delete(`${API_URL}/filters/${filterId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  }

  // Set default filter for project
  async setDefaultFilter(projectId, filterId) {
    const response = await axios.put(
      `${API_URL}/projects/${projectId}/default-filter`,
      { filter_id: filterId },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    return response.data;
  }

  // Get user's default filter for project
  async getDefaultFilter(projectId) {
    try {
      const response = await axios.get(
        `${API_URL}/projects/${projectId}/default-filter`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No default filter set
      }
      throw error;
    }
  }

  // Local storage utilities for quick filter state (before saving)
  saveLocalFilter(projectId, filterState) {
    localStorage.setItem(
      `filter_${projectId}`,
      JSON.stringify({
        timestamp: Date.now(),
        filters: filterState,
      })
    );
  }

  getLocalFilter(projectId) {
    const stored = localStorage.getItem(`filter_${projectId}`);
    if (!stored) return null;
    try {
      return JSON.parse(stored).filters;
    } catch {
      return null;
    }
  }

  clearLocalFilter(projectId) {
    localStorage.removeItem(`filter_${projectId}`);
  }
}

export default new FilterService();
