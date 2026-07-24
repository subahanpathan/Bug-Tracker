import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

export const useBugStore = create((set) => ({
  bugs: [],
  selectedBug: null,
  filters: {
    projectId: null,
    status: null,
    priority: null,
  },

  setBugs: (bugs) => set({ bugs }),
  setSelectedBug: (bug) => set({ selectedBug: bug }),
  setFilters: (filters) => set({ filters }),
  
  addBug: (bug) => set((state) => ({ bugs: [bug, ...state.bugs] })),
  updateBug: (updatedBug) =>
    set((state) => ({
      bugs: state.bugs.map((b) => (b.id === updatedBug.id ? updatedBug : b)),
    })),
  removeBug: (id) =>
    set((state) => ({
      bugs: state.bugs.filter((b) => b.id !== id),
    })),
}));

export const useProjectStore = create((set) => ({
  projects: [],
  selectedProject: null,
  loading: false,

  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setLoading: (loading) => set({ loading }),
  
  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (updated) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
}));
