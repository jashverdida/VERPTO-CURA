import React, { useState, useEffect } from 'react';
import MapContainer from '../components/MapContainer';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MapPinIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

const RescueOperations = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOperation, setSelectedOperation] = useState(null);

  // Mock rescue operation data
  const [rescueOperations] = useState([
    {
      id: 'RES-2026-001',
      location: 'Mount Apo, Davao del Sur',
      coordinates: { lat: 7.0151, lng: 125.2734 },
      type: 'Mountain Search & Rescue',
      priority: 'critical',
      status: 'active',
      reportedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      description: 'Missing hikers, last contact 18 hours ago',
      missingPersons: 3,
      searchArea: '15 km²',
      terrain: 'Mountainous',
      weather: 'Clear, 18°C',
      lastKnownPosition: 'Trail marker 7',
      unitsDeployed: ['SAR-01', 'SAR-03', 'HELI-02'],
      resources: {
        personnel: 25,
        canineUnits: 2,
        aircraft: 1,
        groundVehicles: 4
      },
      searchPattern: 'Grid Search',
      estimatedCompletion: '6 hours'
    },
    {
      id: 'RES-2026-002',
      location: 'Manila Bay, near CCP Complex',
      coordinates: { lat: 14.5524, lng: 120.9758 },
      type: 'Water Rescue',
      priority: 'critical',
      status: 'active',
      reportedAt: new Date(Date.now() - 45 * 60 * 1000),
      description: 'Fishing boat capsized, 4 persons in water',
      missingPersons: 4,
      searchArea: '8 km²',
      terrain: 'Coastal Waters',
      weather: 'Partly Cloudy, 28°C',
      lastKnownPosition: '2km offshore CCP',
      unitsDeployed: ['BOAT-04', 'BOAT-07', 'COAST-01'],
      resources: {
        personnel: 18,
        watercraft: 3,
        divers: 6,
        aircraft: 0
      },
      searchPattern: 'Sector Search',
      estimatedCompletion: '3 hours'
    },
    {
      id: 'RES-2026-003',
      location: 'Building Collapse Site, Cebu City',
      coordinates: { lat: 10.3157, lng: 123.8854 },
      type: 'Urban Search & Rescue',
      priority: 'high',
      status: 'ongoing',
      reportedAt: new Date(Date.now() - 120 * 60 * 1000),
      description: 'Earthquake building collapse, survivors detected',
      missingPersons: 8,
      searchArea: '2,000 m²',
      terrain: 'Urban Debris',
      weather: 'Sunny, 32°C',
      lastKnownPosition: 'Building sections A & C',
      unitsDeployed: ['USAR-01', 'USAR-03', 'K9-02'],
      resources: {
        personnel: 35,
        canineUnits: 3,
        heavyEquipment: 2,
        medicalTeam: 1
      },
      searchPattern: 'Structural Assessment',
      estimatedCompletion: '12 hours'
    },
    {
      id: 'RES-2026-004',
      location: 'Subic Bay Forest, Zambales',
      coordinates: { lat: 14.8187, lng: 120.2734 },
      type: 'Wilderness Search',
      priority: 'medium',
      status: 'completed',
      reportedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      description: 'Lost child found safe, reunited with family',
      missingPersons: 1,
      searchArea: '5 km²',
      terrain: 'Forest/Dense Vegetation',
      weather: 'Clear, 26°C',
      lastKnownPosition: 'Camping area J',
      unitsDeployed: ['SAR-05', 'K9-01'],
      resources: {
        personnel: 12,
        canineUnits: 1
      },
      searchPattern: 'Line Search',
      completedAt: new Date(Date.now() - 30 * 60 * 1000),
      outcome: 'Found Safe'
    }
  ]);

  const [rescueUnits] = useState([
    { id: 'SAR-01', location: 'Mt. Apo Base', status: 'on_scene', type: 'Mountain Rescue' },
    { id: 'SAR-03', location: 'Mt. Apo Base', status: 'on_scene', type: 'Mountain Rescue' },
    { id: 'SAR-05', location: 'Subic Station', status: 'returning', type: 'Wilderness Rescue' },
    { id: 'HELI-02', location: 'Davao Airport', status: 'en_route', type: 'Air Support' },
    { id: 'BOAT-04', location: 'Manila Bay', status: 'on_scene', type: 'Water Rescue' },
    { id: 'BOAT-07', location: 'Manila Bay', status: 'on_scene', type: 'Water Rescue' },
    { id: 'COAST-01', location: 'CCP Pier', status: 'en_route', type: 'Coast Guard' },
    { id: 'USAR-01', location: 'Cebu City', status: 'on_scene', type: 'Urban Search' },
    { id: 'USAR-03', location: 'Cebu City', status: 'on_scene', type: 'Urban Search' },
    { id: 'K9-01', location: 'Central Station', status: 'available', type: 'Canine Unit' },
    { id: 'K9-02', location: 'Cebu Station', status: 'on_scene', type: 'Canine Unit' },
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
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins}min ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ${diffMins % 60}m ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ${diffHours % 24}h ago`;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'ongoing':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'completed':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const activeOperations = rescueOperations.filter(op => op.status === 'active' || op.status === 'ongoing').length;
  const unitsDeployed = rescueUnits.filter(unit => unit.status === 'en_route' || unit.status === 'on_scene').length;
  const totalMissing = rescueOperations
    .filter(op => op.status !== 'completed')
    .reduce((sum, op) => sum + op.missingPersons, 0);
  const totalPersonnel = rescueOperations
    .filter(op => op.status !== 'completed')
    .reduce((sum, op) => sum + (op.resources.personnel || 0), 0);

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden">

      {/* UNIFIED HEADER - Purple themed for Rescue */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">

          {/* Left: Branding + Page Title */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
              <MagnifyingGlassIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-purple-200 text-sm font-medium tracking-wide">CURA Command Center</div>
              <h1 className="text-2xl font-bold text-white">Rescue Operations Overview</h1>
            </div>
          </div>

          {/* Right: Status + DateTime + Stats */}
          <div className="flex items-center space-x-4">

            {/* System Online */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">System Online</span>
              <span className="text-xs text-purple-200">99.9%</span>
            </div>

            {/* DateTime */}
            <div className="text-right bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="text-sm font-semibold text-white">{currentTime.toLocaleDateString()}</div>
              <div className="text-xs text-purple-200">{currentTime.toLocaleTimeString()}</div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="text-center border-r border-white/20 pr-3">
                <div className="text-xl font-bold text-white">{activeOperations}</div>
                <div className="text-xs text-purple-200">Active</div>
              </div>
              <div className="text-center border-r border-white/20 pr-3">
                <div className="text-xl font-bold text-red-300">{totalMissing}</div>
                <div className="text-xs text-purple-200">Missing</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{unitsDeployed}</div>
                <div className="text-xs text-purple-200">Units</div>
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

        {/* Right Panel - Rescue Operations */}
        <div className="w-96 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">

          {/* Panel Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Active Rescue Operations</h2>
                <p className="text-sm text-slate-500">Search & rescue missions</p>
              </div>
              <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-purple-700">{activeOperations} Active</span>
              </div>
            </div>
          </div>

          {/* Operation List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {rescueOperations.map((operation) => (
              <div
                key={operation.id}
                className={`border-l-4 border border-slate-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                  operation.priority === 'critical'
                    ? 'border-l-red-600 bg-red-50'
                    : operation.priority === 'high'
                    ? 'border-l-orange-500 bg-orange-50'
                    : operation.status === 'completed'
                    ? 'border-l-emerald-500 bg-emerald-50'
                    : 'border-l-emerald-500 bg-emerald-50'
                }`}
                onClick={() => setSelectedOperation(operation)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`text-sm font-bold ${
                    operation.priority === 'critical'
                      ? 'text-red-700'
                      : operation.priority === 'high'
                      ? 'text-orange-700'
                      : operation.status === 'completed'
                      ? 'text-emerald-700'
                      : 'text-emerald-700'
                  }`}>
                    {operation.type.toUpperCase()}
                  </h3>
                  <span className="text-xs text-slate-500">{formatTimeAgo(operation.reportedAt)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-1">
                    <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{operation.location}</span>
                  </div>

                  <p className="text-xs text-slate-600">{operation.description}</p>

                  <div className="bg-slate-50 rounded p-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Missing Persons:</span>
                      <span className="font-medium text-red-700">{operation.missingPersons}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Search Area:</span>
                      <span className="font-medium">{operation.searchArea}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Terrain:</span>
                      <span className="font-medium">{operation.terrain}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Personnel:</span>
                      <span className="font-medium">{operation.resources.personnel || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className={`status-indicator ${getPriorityColor(operation.priority)}`}>
                      {operation.priority}
                    </div>
                    <div className={`status-indicator ${getStatusColor(operation.status)}`}>
                      {operation.status}
                    </div>
                  </div>

                  {operation.estimatedCompletion && operation.status !== 'completed' && (
                    <div className="text-xs text-slate-600">
                      <strong>ETC:</strong> {operation.estimatedCompletion}
                    </div>
                  )}

                  {operation.outcome && operation.status === 'completed' && (
                    <div className="text-xs text-emerald-600 font-medium">
                      <strong>Outcome:</strong> {operation.outcome}
                    </div>
                  )}

                  <div className="text-xs">
                    <div className="font-medium text-slate-700 mb-1">Resources Deployed:</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {operation.resources.personnel || 0} Personnel
                      </span>
                      {operation.resources.canineUnits && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          {operation.resources.canineUnits} K9
                        </span>
                      )}
                      {operation.resources.aircraft && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {operation.resources.aircraft} Aircraft
                        </span>
                      )}
                      {operation.resources.watercraft && (
                        <span className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded">
                          {operation.resources.watercraft} Boats
                        </span>
                      )}
                    </div>
                  </div>

                  {operation.unitsDeployed && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {operation.unitsDeployed.map((unit, idx) => (
                        <span key={idx} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
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
          <div className="p-3 border-t border-slate-200 bg-purple-50">
            <div className="flex items-center justify-between text-xs text-purple-700">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Rescue Command Active</span>
              </div>
              <span className="font-semibold">{rescueUnits.filter(u => u.status === 'available').length} teams available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom KPI Bar */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Critical Operations</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">
                  {rescueOperations.filter(op => op.priority === 'critical' && op.status !== 'completed').length}
                </p>
                <p className="text-xs text-purple-500 mt-1">Life threatening</p>
              </div>
              <div className="p-2 bg-purple-200 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-purple-700" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rescue Teams</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{unitsDeployed}/{rescueUnits.length}</p>
                <p className="text-xs text-slate-500 mt-1">Currently deployed</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Success Rate</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">94%</p>
                <p className="text-xs text-slate-500 mt-1">This month</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Response</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">18.5</p>
                <p className="text-xs text-slate-500 mt-1">minutes this week</p>
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

export default RescueOperations;