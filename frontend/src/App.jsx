import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store';
import { Toaster } from 'react-hot-toast';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import ProjectSettingsPage from './pages/ProjectSettingsPage';
import TicketsPage from './pages/TicketsPage';
import KanbanPage from './pages/KanbanPage';
import NotificationCenterPage from './pages/NotificationCenterPage';
import BugDetailPage from './pages/BugDetailPage';
import BugCreatePage from './pages/BugCreatePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const token = useAuthStore((state) => state.token);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is still authenticated on app load
    const savedToken = localStorage.getItem('token');
    if (savedToken && !token) {
      useAuthStore.setState({ token: savedToken, isAuthenticated: true });
    }
  }, [token]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* App Routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-50 overflow-hidden">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block">
                  <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                  <div
                    className="lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}

                {/* Mobile Sidebar */}
                {sidebarOpen && (
                  <div className="lg:hidden fixed left-0 top-0 h-screen z-30 overflow-y-auto">
                    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                  </div>
                )}

                <div className="flex-1 flex flex-col w-full">
                  <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                  <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/projects/:projectId/settings" element={<ProjectSettingsPage />} />
                      <Route path="/tickets" element={<TicketsPage />} />
                      <Route path="/kanban" element={<KanbanPage />} />
                      <Route path="/notifications" element={<NotificationCenterPage />} />
                      <Route path="/create-ticket" element={<BugCreatePage />} />
                      <Route path="/ticket/:id" element={<BugDetailPage />} />
                      <Route path="/bugs/new" element={<BugCreatePage />} />
                      <Route path="/bugs/:id" element={<BugDetailPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
