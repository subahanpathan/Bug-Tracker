import React, { useState, useEffect } from 'react';
import {
  FiArrowUp,
  FiMessageSquare,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiCheck,
  FiLoader,
  FiCalendar,
} from 'react-icons/fi';
import axios from 'axios';

const ActivityFeed = ({ projectId, limit = 30 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchActivities();
    }
  }, [projectId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/activity`,
        {
          params: { limit, offset },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const newActivities = response.data.activities;
      if (offset === 0) {
        setActivities(newActivities);
      } else {
        setActivities((prev) => [...prev, ...newActivities]);
      }

      setHasMore(newActivities.length === limit);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchActivities();
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'created':
        return <FiArrowUp className="text-green-500" size={18} />;
      case 'updated':
        return <FiEdit2 className="text-blue-500" size={18} />;
      case 'deleted':
        return <FiTrash2 className="text-red-500" size={18} />;
      case 'commented':
        return <FiMessageSquare className="text-purple-500" size={18} />;
      case 'assigned':
        return <FiUser className="text-orange-500" size={18} />;
      default:
        return <FiCheck className="text-gray-500" size={18} />;
    }
  };

  const getActivityColor = (action) => {
    switch (action) {
      case 'created':
        return 'bg-green-50 border-l-green-500';
      case 'updated':
        return 'bg-blue-50 border-l-blue-500';
      case 'deleted':
        return 'bg-red-50 border-l-red-500';
      case 'commented':
        return 'bg-purple-50 border-l-purple-500';
      case 'assigned':
        return 'bg-orange-50 border-l-orange-500';
      default:
        return 'bg-gray-50 border-l-gray-500';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && offset === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <FiCalendar size={24} className="text-gray-600" />
        <h3 className="text-xl font-bold text-gray-900">Activity Feed</h3>
      </div>

      {activities.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600 font-medium">No activities yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Project activity will appear here
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`border-l-4 rounded-lg p-4 ${getActivityColor(
                  activity.action
                )}`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {activity.user?.first_name} {activity.user?.last_name}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {activity.details}
                        </p>

                        {/* Changes Details */}
                        {activity.changes && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900 font-medium">
                              View changes
                            </summary>
                            <div className="mt-2 text-xs text-gray-600 space-y-1 bg-white bg-opacity-50 p-2 rounded">
                              {typeof activity.changes === 'object' ? (
                                Object.entries(activity.changes).map(
                                  ([key, value]) => (
                                    <div key={key}>
                                      <strong>{key}:</strong> {String(value)}
                                    </div>
                                  )
                                )
                              ) : (
                                <p>{activity.changes}</p>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 min-h-[40px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FiLoader size={16} className="animate-spin" />
                  Loading...
                </span>
              ) : (
                'Load more activities'
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityFeed;
