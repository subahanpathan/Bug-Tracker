import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) {
    return (
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link
          to="/"
          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
        >
          <FiHome size={16} />
          <span>Home</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
      >
        <FiHome size={16} />
        <span>Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <FiChevronRight size={16} className="text-gray-400" />
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
