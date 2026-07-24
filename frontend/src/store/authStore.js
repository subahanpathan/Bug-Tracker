import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/apiClient';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true, // Start with loading true to check auth status
      error: null,

      // Set token and update isAuthenticated flag
      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },

      // Fetch current user if token exists
      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ loading: false, isAuthenticated: false });
          return;
        }

        set({ loading: true });
        try {
          const res = await authAPI.getMe();
          set({ user: res.data.data, isAuthenticated: true, loading: false });
        } catch (error) {
          // Token is invalid or expired
          get().logout(); // Use get() to call another action
          set({ loading: false });
        }
      },

      // Login action
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await authAPI.login({ email, password });
          const { token, profile } = res.data.data;
          set({ user: profile, token, isAuthenticated: true, loading: false });
          return res;
        } catch (error) {
          set({ error, loading: false });
          throw error;
        }
      },

      // Logout action
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ token: state.token }), // Only persist the token
    }
  )
);

export default useAuthStore;
