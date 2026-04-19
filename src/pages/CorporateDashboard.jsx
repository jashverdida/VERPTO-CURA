import React, { useState, useEffect } from 'react';
import { ACTIVE_INCIDENTS, EMERGENCY_UNITS } from '../constants/dummyData';
import MapContainer from '../components/MapContainer';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TruckIcon,
  ServerIcon,
  MapIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const CorporateDashboard = () => {
  const [incidents] = useState(ACTIVE_INCIDENTS);
  const [units] = useState(EMERGENCY_UNITS);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Calculate KPIs
  const criticalCount = incidents.filter(i => i.priority === 'critical').length;
  const activeCount = incidents.filter(i => i.status === 'active').length;
  const resolvedToday = incidents.filter(i => i.status === 'resolved').length + 23; // Mock resolved
  const availableUnits = units.filter(u => u.status === 'available').length;
  const totalUnits = units.length;
  const systemUptime = '99.9%';
  const edgeNodesOnline = 4;
  const totalEdgeNodes = 4;

  // KPI Configuration
  const kpis = [
    {
      label: 'System Uptime',
      value: systemUptime,
      subtext: 'Last 30 days',
      icon: ServerIcon,
      trend: null,
      critical: false,
    },
    {
      label: 'Critical Incidents',
      value: criticalCount,
      subtext: 'Immediate response',
      icon: ExclamationTriangleIcon,
      trend: criticalCount > 0 ? 'up' : null,
      critical: criticalCount > 0,
    },
    {
      label: 'Active Units',
      value: `${availableUnits}/${totalUnits}`,
      subtext: 'Ready for dispatch',
      icon: TruckIcon,
      trend: null,
      critical: false,
    },
    {
      label: 'Resolved Today',
      value: resolvedToday,
      subtext: '+8 since midnight',
      icon: CheckCircleIcon,
      trend: 'up',
      critical: false,
    },
    {
      label: 'Edge Nodes',
      value: `${edgeNodesOnline}/${totalEdgeNodes}`,
      subtext: 'Network status',
      icon: ServerIcon,
      trend: null,
      critical: edgeNodesOnline !== totalEdgeNodes,
    },
    {
      label: 'Coverage',
      value: '98%',
      subtext: 'Metro Manila',
      icon: MapIcon,
      trend: null,
      critical: false,
    },
  ];

  const getIncidentPriorityClass = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-600 bg-red-50';
      case 'high':
        return 'border-l-amber-600 bg-amber-50';
      default:
        return 'border-l-blue-600 bg-blue-50';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      return `${diffHours}h ${diffMins % 60}m ago`;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">

      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-slate-900">Command Center</h1>
            <p className="text-body text-slate-600 mt-1">
              Multi-Agency Emergency Coordination • {currentTime.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">
                All Systems Operational
              </span>
            </div>

            <button className="btn-primary-corporate">
              Emergency Broadcast
            </button>
            <button className="btn-secondary-corporate">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {kpis.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <div key={index} className="kpi-card group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    kpi.critical ? 'bg-red-100' : 'bg-slate-100'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      kpi.critical ? 'text-red-600' : 'text-slate-600'
                    }`} />
                  </div>

                  {kpi.trend && (
                    <div className={`flex items-center ${
                      kpi.trend === 'up' ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {kpi.trend === 'up' ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                    </div>
                  )}

                  {kpi.critical && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className={`kpi-value ${kpi.critical ? 'text-red-600' : ''}`}>
                    {kpi.value}
                  </div>
                  <div className="kpi-label">
                    {kpi.label}
                  </div>
                  <div className="kpi-change">
                    {kpi.subtext}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content: 2-Column Layout */}
      <div className="flex-1 flex gap-6 p-8 min-h-0">

        {/* Left Column: Live Region Map */}
        <div className="flex-1 min-w-0">
          <div className="corporate-card-elevated h-full flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-h2">Live Region Map</h2>
                  <p className="text-caption text-slate-600 mt-1">
                    Real-time incident tracking and unit deployment
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Critical</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span>Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span>Units</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6">
              <MapContainer
                incidents={incidents}
                units={units}
                selectedIncident={selectedIncident}
                onIncidentSelect={setSelectedIncident}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Active Triage Feed */}
        <div className="w-96 flex flex-col min-w-0">

          {/* Critical Incidents */}
          {criticalCount > 0 && (
            <div className="corporate-card-elevated mb-6">
              <div className="p-4 bg-red-50 border-b border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-semibold text-red-900 uppercase tracking-wide">
                      Critical - Immediate Response
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-red-700">{criticalCount}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {incidents
                  .filter(incident => incident.priority === 'critical')
                  .map((incident) => (
                    <div
                      key={incident.id}
                      className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${getIncidentPriorityClass(incident.priority)} ${
                        selectedIncident?.id === incident.id ? 'ring-2 ring-red-500' : ''
                      }`}
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-semibold text-slate-900 line-clamp-2">
                          {incident.title}
                        </div>
                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap ml-2">
                          {formatTimeAgo(incident.reportedAt)}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mb-2">
                        📍 {incident.location}
                      </div>

                      {incident.aiVerified && (
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-emerald-700 font-medium">
                            AI Verified
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* All Active Incidents */}
          <div className="corporate-card-elevated flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                    Active Incidents
                  </h3>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {activeCount} monitored
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-3">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${getIncidentPriorityClass(incident.priority)} ${
                      selectedIncident?.id === incident.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-medium text-slate-900 line-clamp-1">
                        {incident.title}
                      </div>
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap ml-2">
                        {formatTimeAgo(incident.reportedAt)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mb-2">
                      📍 {incident.location}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className={`status-indicator ${
                        incident.priority === 'critical' ? 'status-critical' :
                        incident.priority === 'high' ? 'status-warning' : 'status-info'
                      }`}>
                        {incident.priority}
                      </div>

                      {incident.aiVerified && (
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-emerald-700 font-medium">
                            AI
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {incidents.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-600">No active incidents</p>
                    <p className="text-xs text-slate-500">All clear in the region</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Units Summary */}
          <div className="corporate-card-elevated mt-4">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TruckIcon className="w-5 h-5 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                    Active Units
                  </h3>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {availableUnits}/{totalUnits} available
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2 max-h-32 overflow-y-auto">
              {units
                .filter(unit => unit.status !== 'out_of_service')
                .map((unit) => (
                  <div key={unit.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        unit.status === 'available' ? 'bg-emerald-500' :
                        unit.status === 'en_route' ? 'bg-amber-500' :
                        unit.status === 'on_scene' ? 'bg-red-500' : 'bg-slate-400'
                      }`}></div>
                      <span className="text-sm font-medium text-slate-900">{unit.callSign}</span>
                    </div>

                    <div className={`status-indicator ${
                      unit.status === 'available' ? 'status-success' :
                      unit.status === 'en_route' ? 'status-warning' :
                      unit.status === 'on_scene' ? 'status-critical' : 'status-neutral'
                    }`}>
                      {unit.status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateDashboard;