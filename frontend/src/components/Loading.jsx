import React from 'react';
import { FiLoader } from 'react-icons/fi';

export const Loading = ({ fullScreen = false }) => {
  const content = (
    <div className="flex items-center justify-center space-x-3">
      <FiLoader className="animate-spin text-primary" size={24} />
      <span className="text-gray-600">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
