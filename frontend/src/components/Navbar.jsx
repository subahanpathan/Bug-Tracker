import React, { useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useAuthStore } from '../store/index.js';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell.jsx';
import useSocket from '../hooks/useSocket.js';

export const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const dropdownRef = useRef(null);

  // Initialize Socket.io
  const socket = useSocket(user?.id);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    toast.success('Logged out successfully. See you soon!');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = () => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName) return `${user.firstName} ${user.lastName || ''}`.trim();
    return user?.email || 'User';
  };

  const navLinks = [
    { label: 'Dashboard', path: '/' },
    { label: 'Projects', path: '/projects' },
    { label: 'Tickets', path: '/tickets' },
    { label: 'Kanban', path: '/kanban' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm z-40">
      <div className="px-4 md:px-8">
        <div className="flex justify-between items-center h-16 min-h-[56px]">

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <FiMenu size={24} />
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 ml-auto">

            {/* Notification Bell */}
            <NotificationBell socket={socket} />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="profile-menu-button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] justify-center md:justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {getInitials()}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[140px] truncate">
                  {getDisplayName()}
                </span>
                <FiChevronDown
                  size={14}
                  className={`hidden md:block text-gray-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">

                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow">
                        {getInitials()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-900 truncate">{getDisplayName()}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      id="profile-link"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FiUser size={15} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">My Profile</p>
                        <p className="text-xs text-gray-400">View and edit your profile</p>
                      </div>
                    </Link>

                    <Link
                      to="/settings"
                      id="settings-link"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <FiSettings size={15} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Settings</p>
                        <p className="text-xs text-gray-400">Preferences & account settings</p>
                      </div>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      id="logout-button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors min-h-[44px]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <FiLogOut size={15} className="text-red-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Log out</p>
                        <p className="text-xs text-red-400">Sign out of your account</p>
                      </div>
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
