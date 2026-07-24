import React from 'react';
import { FiAlertCircle, FiFeather, FiCheckSquare } from 'react-icons/fi';
import clsx from 'clsx';

/**
 * IssueTypeIcon Component
 * Displays icon and label for bug, feature, or task
 */
const IssueTypeIcon = ({ type = 'bug', size = 'md', showLabel = true, className = '' }) => {
  const issueTypeConfig = {
    bug: {
      icon: FiAlertCircle,
      label: 'Bug',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      badgeColor: 'bg-red-500 text-white',
    },
    feature: {
      icon: FiFeather,
      label: 'Feature',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      badgeColor: 'bg-green-500 text-white',
    },
    task: {
      icon: FiCheckSquare,
      label: 'Task',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      badgeColor: 'bg-blue-500 text-white',
    },
  };

  const config = issueTypeConfig[type] || issueTypeConfig.bug;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className={clsx(config.bgColor, sizeClasses[size], 'flex items-center justify-center rounded')}>
        <Icon className={clsx(config.textColor, sizeClasses[size])} />
      </div>
      {showLabel && (
        <span className={clsx('text-sm font-medium', config.textColor)}>
          {config.label}
        </span>
      )}
    </div>
  );
};

/**
 * IssueTypeBadge Component
 * Displays a small badge for inline display
 */
export const IssueTypeBadge = ({ type = 'bug', size = 'sm' }) => {
  const issueTypeConfig = {
    bug: {
      label: 'Bug',
      bgColor: 'bg-red-500 text-white',
      shortLabel: 'BUG',
    },
    feature: {
      label: 'Feature',
      bgColor: 'bg-green-500 text-white',
      shortLabel: 'FEA',
    },
    task: {
      label: 'Task',
      bgColor: 'bg-blue-500 text-white',
      shortLabel: 'TSK',
    },
  };

  const config = issueTypeConfig[type] || issueTypeConfig.bug;

  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
  };

  return (
    <span className={clsx('rounded-full font-semibold inline-block', config.bgColor, sizeClasses[size])}>
      {size === 'xs' ? config.shortLabel : config.label}
    </span>
  );
};

/**
 * IssueTypeSelector Component
 * Dropdown selector for choosing issue type
 */
export const IssueTypeSelector = ({ value = 'bug', onChange, disabled = false }) => {
  const options = [
    { value: 'bug', label: 'Bug 🐛', icon: FiAlertCircle },
    { value: 'feature', label: 'Feature ⭐', icon: FiFeather },
    { value: 'task', label: 'Task ✓', icon: FiCheckSquare },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default IssueTypeIcon;
