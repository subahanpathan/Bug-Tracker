import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiList, FiPlus, FiGrid, FiColumns, FiX } from 'react-icons/fi';

function Sidebar({ setSidebarOpen }) {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: FiHome },
    { label: 'Projects', path: '/projects', icon: FiGrid },
    { label: 'Tickets', path: '/tickets', icon: FiList },
    { label: 'Kanban', path: '/kanban', icon: FiColumns },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white h-full flex flex-col relative">
      {/* Close button for mobile */}
      <button
        onClick={() => setSidebarOpen && setSidebarOpen(false)}
        className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <FiX size={24} />
      </button>

      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold">Bug Tracker</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen && setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm md:text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Create Button */}
      <div className="px-4 py-4 border-t border-gray-800">
        <Link
          to="/create-ticket"
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors min-h-[44px]"
        >
          <FiPlus size={20} />
          <span className="text-sm md:text-base">New Ticket</span>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
