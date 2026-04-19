import React, { useState } from 'react';
import { NOTIFICATIONS, formatTimeAgo, getStatusColor } from '../constants/dummyData';
import {
  BellIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  SpeakerWaveIcon,
  ServerIcon,
  UserIcon,
  CloudIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const Notifications = () => {
  const [notifications] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'edge_ai':
        return <ServerIcon className="w-5 h-5" />;
      case 'pcr_sync':
        return <ClipboardDocumentListIcon className="w-5 h-5" />;
      case 'voice_transcript':
        return <SpeakerWaveIcon className="w-5 h-5" />;
      case 'system_alert':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'citizen_report':
        return <UserIcon className="w-5 h-5" />;
      case 'weather_alert':
        return <CloudIcon className="w-5 h-5" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 border-l-critical-red text-red-800';
      case 'high':
        return 'bg-yellow-50 border-l-warning-amber text-yellow-800';
      case 'medium':
        return 'bg-blue-50 border-l-clinical-blue text-blue-800';
      case 'low':
        return 'bg-gray-50 border-l-gray-300 text-gray-800';
      default:
        return 'bg-gray-50 border-l-gray-300 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return notification.priority === 'critical' || notification.priority === 'high';
    if (filter === 'ai') return notification.type === 'edge_ai' || notification.type === 'voice_transcript';
    if (filter === 'unread') return notification.actionRequired;
    return notification.type === filter;
  });

  const getTypeLabel = (type) => {
    switch (type) {
      case 'edge_ai':
        return 'Edge AI';
      case 'pcr_sync':
        return 'PCR Sync';
      case 'voice_transcript':
        return 'Voice Transcript';
      case 'system_alert':
        return 'System Alert';
      case 'citizen_report':
        return 'Citizen Report';
      case 'weather_alert':
        return 'Weather Alert';
      default:
        return 'Alert';
    }
  };

  const filterButtons = [
    { key: 'all', label: 'All Alerts', count: notifications.length },
    { key: 'urgent', label: 'Urgent', count: notifications.filter(n => n.priority === 'critical' || n.priority === 'high').length },
    { key: 'ai', label: 'AI Generated', count: notifications.filter(n => n.type === 'edge_ai' || n.type === 'voice_transcript').length },
    { key: 'unread', label: 'Action Required', count: notifications.filter(n => n.actionRequired).length },
  ];

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="glass-card p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BellIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">Notifications & Alerts</h1>
            </div>
            <p className="text-slate-600 font-medium">
              Real-time alerts from Edge AI nodes and emergency systems
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-700 font-semibold text-sm">
                {NOTIFICATIONS.filter(n => n.actionRequired).length} require action
              </span>
            </div>
            <button className="btn-primary">
              Mark All Read
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-slate-400" />
            <span className="text-slate-600 font-medium">Filter:</span>
            {['all', 'unread', 'critical', 'today'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 text-sm rounded-xl font-semibold transition-all duration-300 ${
                  filter === filterType
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>

          <div className="text-sm text-slate-500 font-medium">
            Showing {filteredNotifications.length} of {NOTIFICATIONS.length} notifications
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BellIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No notifications found</h3>
            <p className="text-slate-500">No notifications match the current filter criteria.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item glass-card p-6 cursor-pointer card-hover ${
                notification.priority === 'critical' ? 'pulse-critical border-red-200' : ''
              }`}
              onClick={() => {/* markAsRead(notification.id) */}}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${
                    notification.priority === 'critical' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                    notification.priority === 'high' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                    'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    {getNotificationIcon(notification.type)}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`status-badge ${
                        notification.priority === 'critical' ? 'status-critical' :
                        notification.priority === 'high' ? 'status-pending' :
                        'status-active'
                      }`}>
                        {getTypeLabel(notification.type)}
                      </span>

                      {notification.priority === 'critical' && (
                        <span className="status-badge status-critical animate-pulse">
                          CRITICAL
                        </span>
                      )}

                      {notification.aiConfidence && (
                        <span className="status-badge status-resolved">
                          AI: {Math.round(notification.aiConfidence * 100)}%
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-800 text-lg mb-2">{notification.title}</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-500 font-medium mb-2">
                    {formatTimeAgo(notification.timestamp)}
                  </div>
                  {notification.actionRequired && (
                    <button className="btn-primary px-4 py-2 text-sm">
                      Take Action
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-sm text-slate-500 space-x-4">
                  <span className="font-medium">Source:</span>
                  <span>{notification.source}</span>
                  {notification.relatedIncident && (
                    <>
                      <span className="font-medium ml-4">Related:</span>
                      <span>{notification.relatedIncident}</span>
                    </>
                  )}
                </div>

                {/* Additional metadata for specific types */}
                <div className="flex items-center space-x-4">
                  {notification.type === 'voice_transcript' && notification.languageDetected && (
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span className="font-medium">Language:</span>
                      <span>{notification.languageDetected}</span>
                    </div>
                  )}

                  {notification.imageVerified && (
                    <div className="flex items-center space-x-2 text-sm">
                      <EyeIcon className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 font-medium">Image Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;