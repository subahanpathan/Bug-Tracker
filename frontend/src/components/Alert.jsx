import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';

export const Alert = ({ type = 'info', message, onClose }) => {
  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }[type];

  const icon = {
    success: <FiCheckCircle className="text-green-600" />,
    error: <FiAlertCircle className="text-red-600" />,
    warning: <FiAlertCircle className="text-yellow-600" />,
    info: <FiAlertCircle className="text-blue-600" />,
  }[type];

  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center justify-between p-4 rounded border ${bgColor}`}>
      <div className="flex items-center space-x-3">
        {icon}
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="text-xl">
        <FiX />
      </button>
    </div>
  );
};

export default Alert;
