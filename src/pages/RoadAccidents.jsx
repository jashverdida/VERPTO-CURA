import React, { useState, useEffect } from 'react';
import MapContainer from '../components/MapContainer';
import {
  TruckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MapPinIcon,
  UserGroupIcon,
  SignalIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const RoadAccidents = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedAccident, setSelectedAccident] = useState(null);

  // Mock road accident data
  const [roadAccidents] = useState([
    {
      id: 'ACC-2026-001',
      location: 'EDSA - Guadalupe Bridge, Makati',
      coordinates: { lat: 14.5653, lng: 121.0359 },
      type: 'Multi-Vehicle Collision',
      severity: 'critical',
      status: 'active',
      reportedAt: new Date(Date.now() - 12 * 60 * 1000),
      description: '3-vehicle collision with entrapment, blocking 2 lanes',
      vehiclesInvolved: [
        { type: 'Sedan', plate: 'ABC-123', occupants: 2, injuries: 'Minor' },
        { type: 'SUV', plate: 'DEF-456', occupants: 4, injuries: 'Serious' },
        { type: 'Motorcycle', plate: 'GHI-789', occupants: 1, injuries: 'Critical' }
      ],
      totalInjured: 2,
      totalCritical: 1,
      lanesAffected: 2,
      totalLanes: 4,
      trafficImpact: 'Severe',
      unitsResponding: ['TRAFFIC-04', 'AMB-06', 'RESCUE-02'],
      eta: '5 minutes',
      estimatedClearanceTime: '45 minutes',
      alternateRoutes: ['C5 Extension', 'Makati Avenue']
    },
    {
      id: 'ACC-2026-002',
      location: 'Commonwealth Avenue x Katipunan, QC',
      coordinates: { lat: 14.6542, lng: 121.0700 },
      type: 'Vehicle vs Pedestrian',
      severity: 'high',
      status: 'active',
      reportedAt: new Date(Date.now() - 28 * 60 * 1000),
      description: 'Pedestrian struck at intersection, conscious and breathing',
      vehiclesInvolved: [
        { type: 'Bus', plate: 'JKL-012', occupants: 25, injuries: 'None' }
      ],
      totalInjured: 1,
      totalCritical: 0,
      lanesAffected: 1,
      totalLanes: 6,
      trafficImpact: 'Moderate',
      unitsResponding: ['TRAFFIC-08', 'AMB-11'],
      eta: 'On scene',
      estimatedClearanceTime: '20 minutes',
      alternateRoutes: ['UP Diliman Road']
    },
    {
      id: 'ACC-2026-003',
      location: 'Roxas Boulevard, Manila',
      coordinates: { lat: 14.5932, lng: 120.9753 },
      type: 'Single Vehicle Accident',
      severity: 'medium',
      status: 'clearing',
      reportedAt: new Date(Date.now() - 52 * 60 * 1000),
      description: 'Vehicle collision with barrier, minor injuries',
      vehiclesInvolved: [
        { type: 'Sedan', plate: 'MNO-345', occupants: 2, injuries: 'Minor' }
      ],
      totalInjured: 1,
      totalCritical: 0,
      lanesAffected: 1,
      totalLanes: 4,
      trafficImpact: 'Light',
      unitsResponding: ['TRAFFIC-12'],
      eta: 'On scene',
      estimatedClearanceTime: '10 minutes',
      alternateRoutes: ['Taft Avenue']
    }
  ]);

  const [trafficUnits] = useState([
    { id: 'TRAFFIC-04', location: 'EDSA Guadalupe', status: 'en_route', type: 'Traffic Control' },
    { id: 'TRAFFIC-08', location: 'Commonwealth', status: 'on_scene', type: 'Traffic Control' },
    { id: 'TRAFFIC-12', location: 'Roxas Blvd', status: 'on_scene', type: 'Traffic Control' },
    { id: 'AMB-06', location: 'Makati Station', status: 'en_route', type: 'Ambulance' },
    { id: 'AMB-11', location: 'QC Station', status: 'on_scene', type: 'Ambulance' },
    { id: 'RESCUE-02', location: 'Central', status: 'en_route', type: 'Rescue Unit' },
    { id: 'TOW-01', location: 'South Station', status: 'available', type: 'Tow Truck' },
    { id: 'TOW-03', location: 'North Station', status: 'available', type: 'Tow Truck' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins}min ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ${diffMins % 60}m ago`;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'clearing':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cleared':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getTrafficImpactColor = (impact) => {
    switch (impact) {
      case 'Severe':
        return 'text-red-600 bg-red-100';
      case 'Moderate':
        return 'text-amber-600 bg-amber-100';
      case 'Light':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const activeAccidents = roadAccidents.filter(accident => accident.status === 'active').length;
  const unitsResponding = trafficUnits.filter(unit => unit.status === 'en_route' || unit.status === 'on_scene').length;
  const totalInjured = roadAccidents.reduce((sum, accident) => sum + accident.totalInjured, 0);
  const totalLanesBlocked = roadAccidents.reduce((sum, accident) => sum + accident.lanesAffected, 0);

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden">

      {/* UNIFIED HEADER - Amber themed for Traffic */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">

          {/* Left: Branding + Page Title */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
              <TruckIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-amber-200 text-sm font-medium tracking-wide">CURA Command Center</div>
              <h1 className="text-2xl font-bold text-white">Road Accident Overview</h1>
            </div>
          </div>

          {/* Right: Status + DateTime + Stats */}
          <div className="flex items-center space-x-4">

            {/* System Online */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">System Online</span>
              <span className="text-xs text-amber-200">99.9%</span>
            </div>

            {/* DateTime */}
            <div className="text-right bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="text-sm font-semibold text-white">{currentTime.toLocaleDateString()}</div>
              <div className="text-xs text-amber-200">{currentTime.toLocaleTimeString()}</div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="text-center border-r border-white/20 pr-3">
                <div className="text-xl font-bold text-white">{activeAccidents}</div>
                <div className="text-xs text-amber-200">Active</div>
              </div>
              <div className="text-center border-r border-white/20 pr-3">
                <div className="text-xl font-bold text-red-300">{totalInjured}</div>
                <div className="text-xs text-amber-200">Injured</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{unitsResponding}</div>
                <div className="text-xs text-amber-200">Units</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Map + Sidebar */}
      <div className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden">

        {/* Map Container */}
        <div className="flex-1 min-w-0">
          <MapContainer />
        </div>

        {/* Right Panel - Traffic Incidents */}
        <div className="w-96 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">

          {/* Panel Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Active Traffic Incidents</h2>
                <p className="text-sm text-slate-500">Road accident responses</p>
              </div>
              <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-amber-700">{activeAccidents} Active</span>
              </div>
            </div>
          </div>

          {/* Incident List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {roadAccidents.map((accident) => (
              <div
                key={accident.id}
                className={`border-l-4 border border-slate-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                  accident.severity === 'critical'
                    ? 'border-l-red-600 bg-red-50'
                    : accident.severity === 'high'
                    ? 'border-l-amber-500 bg-amber-50'
                    : 'border-l-orange-500 bg-orange-50'
                }`}
                onClick={() => setSelectedAccident(accident)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`text-sm font-bold ${
                    accident.severity === 'critical'
                      ? 'text-red-700'
                      : accident.severity === 'high'
                      ? 'text-amber-700'
                      : 'text-orange-700'
                  }`}>
                    {accident.type.toUpperCase()}
                  </h3>
                  <span className="text-xs text-slate-500">{formatTimeAgo(accident.reportedAt)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-1">
                    <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{accident.location}</span>
                  </div>

                  <p className="text-xs text-slate-600">{accident.description}</p>

                  <div className="bg-slate-50 rounded p-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Vehicles:</span>
                      <span className="font-medium">{accident.vehiclesInvolved.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Injured:</span>
                      <span className="font-medium text-amber-700">{accident.totalInjured}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Lanes Affected:</span>
                      <span className="font-medium">{accident.lanesAffected}/{accident.totalLanes}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Traffic Impact:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTrafficImpactColor(accident.trafficImpact)}`}>
                        {accident.trafficImpact}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className={`status-indicator ${getSeverityColor(accident.severity)}`}>
                      {accident.severity}
                    </div>
                    <div className={`status-indicator ${getStatusColor(accident.status)}`}>
                      {accident.status}
                    </div>
                  </div>

                  {accident.estimatedClearanceTime && (
                    <div className="text-xs text-slate-600">
                      <strong>ETC:</strong> {accident.estimatedClearanceTime}
                    </div>
                  )}

                  {accident.alternateRoutes && (
                    <div className="text-xs">
                      <strong className="text-slate-600">Alt Routes:</strong>
                      <div className="mt-1 space-y-1">
                        {accident.alternateRoutes.map((route, idx) => (
                          <span key={idx} className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-1 text-xs">
                            {route}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {accident.unitsResponding && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {accident.unitsResponding.map((unit, idx) => (
                        <span key={idx} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                          {unit}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Panel Footer */}
          <div className="p-3 border-t border-slate-200 bg-amber-50">
            <div className="flex items-center justify-between text-xs text-amber-700">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Traffic Command Active</span>
              </div>
              <span className="font-semibold">{trafficUnits.filter(u => u.status === 'available').length} units available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom KPI Bar */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Critical Accidents</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">
                  {roadAccidents.filter(a => a.severity === 'critical').length}
                </p>
                <p className="text-xs text-amber-500 mt-1">With entrapment</p>
              </div>
              <div className="p-2 bg-amber-200 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-700" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Response Units</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{unitsResponding}/{trafficUnits.length}</p>
                <p className="text-xs text-slate-500 mt-1">Currently deployed</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <TruckIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Traffic Flow</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">72%</p>
                <p className="text-xs text-slate-500 mt-1">Normal capacity</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Response</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">8.5</p>
                <p className="text-xs text-slate-500 mt-1">minutes today</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoadAccidents;