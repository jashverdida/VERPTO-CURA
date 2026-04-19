import React from 'react';
import { formatTimeAgo, getStatusColor } from '../constants/dummyData';
import {
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const IncidentCard = ({ incident, compact = false, onSelect, isSelected = false }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-4 h-4 text-critical-red" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-4 h-4 text-warning-amber" />;
      case 'medium':
        return <ClockIcon className="w-4 h-4 text-clinical-blue" />;
      case 'low':
        return <CheckCircleIcon className="w-4 h-4 text-success-green" />;
      default:
        return <ClockIcon className="w-4 h-4 text-text-medium" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/20 pulse-critical';
      case 'high':
        return 'border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-orange-600/10 border-amber-500/20';
      case 'medium':
        return 'border-l-blue-500 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border-blue-500/20';
      case 'low':
        return 'border-l-green-500 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border-green-500/20';
      default:
        return 'border-l-slate-300 bg-gradient-to-r from-slate-100/50 to-slate-200/50 border-slate-300/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'medical':
        return '🚑';
      case 'fire':
        return '🔥';
      case 'flood':
        return '🌊';
      case 'traffic':
        return '🚗';
      case 'structural':
        return '🏗️';
      case 'rescue':
        return '⛑️';
      default:
        return '⚠️';
    }
  };

  if (compact) {
    return (
      <div
        className={`border-l-4 p-4 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm border ${
          getPriorityColor(incident.priority)
        } ${isSelected ? 'ring-2 ring-blue-500/30 shadow-xl scale-[1.02]' : 'hover:shadow-lg hover:scale-[1.01]'} glass-card card-hover`}
        onClick={onSelect}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getTypeIcon(incident.type)}</span>
            {getPriorityIcon(incident.priority)}
            <h3 className="font-semibold text-sm text-text-dark line-clamp-1">{incident.title}</h3>
          </div>
          <span className="text-xs text-text-medium">{formatTimeAgo(incident.reportedAt)}</span>
        </div>

        <p className="text-xs text-text-medium mb-2 line-clamp-2">{incident.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-text-medium">
            <MapPinIcon className="w-3 h-3" />
            <span className="truncate">{incident.location.split(',')[0]}</span>
          </div>

          <div className="flex items-center space-x-3">
            {incident.aiVerified && (
              <div className="flex items-center space-x-1">
                <EyeIcon className="w-3 h-3 text-clinical-blue" />
                <span className="text-xs text-clinical-blue font-medium">AI</span>
              </div>
            )}

            {incident.assignedUnits?.length > 0 && (
              <div className="flex items-center space-x-1">
                <UsersIcon className="w-3 h-3 text-success-green" />
                <span className="text-xs text-text-medium">{incident.assignedUnits.length}</span>
              </div>
            )}

            <div className={`status-badge ${
              incident.status === 'critical' || incident.priority === 'critical' ? 'status-critical' :
              incident.status === 'active' || incident.status === 'en_route' ? 'status-active' :
              incident.status === 'pending' || incident.status === 'pending_verification' ? 'status-pending' :
              'status-resolved'
            }`}>
              {incident.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full card view
  return (
    <div
      className={`border-l-4 p-6 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm border ${
        getPriorityColor(incident.priority)
      } ${isSelected ? 'ring-2 ring-blue-500/30 shadow-xl scale-[1.02]' : 'hover:shadow-lg hover:scale-[1.01]'} glass-card card-hover`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon(incident.type)}</span>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              {getPriorityIcon(incident.priority)}
              <h3 className="font-semibold text-lg text-text-dark">{incident.title}</h3>
            </div>
            <p className="text-sm text-text-medium">ID: {incident.id}</p>
          </div>
        </div>

        <div className="text-right">
          <div className={`status-badge ${
            incident.status === 'critical' || incident.priority === 'critical' ? 'status-critical' :
            incident.status === 'active' || incident.status === 'en_route' ? 'status-active' :
            incident.status === 'pending' || incident.status === 'pending_verification' ? 'status-pending' :
            'status-resolved'
          }`}>
            {incident.status.replace('_', ' ').toUpperCase()}
          </div>
          <p className="text-xs text-text-medium mt-1">{formatTimeAgo(incident.reportedAt)}</p>
        </div>
      </div>

      <p className="text-text-medium mb-4">{incident.description}</p>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <MapPinIcon className="w-4 h-4 text-text-medium" />
          <span className="text-sm">{incident.location}</span>
        </div>

        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-text-medium" />
          <span className="text-sm">{incident.estimatedSeverity}</span>
        </div>

        {incident.assignedUnits?.length > 0 && (
          <div className="flex items-center space-x-2">
            <UsersIcon className="w-4 h-4 text-text-medium" />
            <span className="text-sm">Units: {incident.assignedUnits.join(', ')}</span>
          </div>
        )}
      </div>

      {/* AI Analysis Section */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {incident.aiVerified && (
            <div className="flex items-start space-x-2">
              <EyeIcon className="w-4 h-4 text-clinical-blue mt-0.5" />
              <div>
                <p className="text-xs font-medium text-clinical-blue">Image Analysis</p>
                <p className="text-xs text-text-medium">{incident.imageAnalysis}</p>
              </div>
            </div>
          )}

          {incident.nlpTriage && (
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-clinical-blue mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              </svg>
              <div>
                <p className="text-xs font-medium text-clinical-blue">NLP Triage</p>
                <p className="text-xs text-text-medium">{incident.nlpTriage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;