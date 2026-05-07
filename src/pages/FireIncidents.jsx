import React, { useState, useEffect } from 'react';
import MapContainer from '../components/MapContainer';
import { supabase } from '../lib/supabase';
import {
  FireIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

function rowToFireIncident(row) {
  return {
    id:                  row.id,
    location:            row.address ?? 'Unknown location',
    type:                'Fire Incident',
    severity:            row.severity ?? 'medium',
    status:              row.status ?? 'active',
    reportedAt:          new Date(row.created_at),
    description:         row.description ?? '',
    structureType:       '—',
    fireUnitsResponding: [],
    eta:                 '—',
  };
}

const FireIncidents = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [fireIncidents, setFireIncidents] = useState([]);

  useEffect(() => {
    supabase
      .from('incidents')
      .select('*')
      .eq('type', 'FIRE')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setFireIncidents(data.map(rowToFireIncident));
      });

    const channel = supabase
      .channel('fire-incidents-web')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'incidents', filter: 'type=eq.FIRE' },
        payload => setFireIncidents(prev => [rowToFireIncident(payload.new), ...prev]))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const [fireUnits] = useState([
    { id: 'FIRE-01', status: 'en_route', eta: '2 min' },
    { id: 'FIRE-03', status: 'en_route', eta: '5 min' },
    { id: 'FIRE-05', status: 'on_scene' },
    { id: 'FIRE-07', status: 'en_route', eta: '3 min' },
    { id: 'FIRE-09', status: 'on_scene' },
    { id: 'FIRE-11', status: 'on_scene' },
    { id: 'LADDER-02', status: 'en_route', eta: '8 min' },
    { id: 'RESCUE-04', status: 'available' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeAgo = (date) => {
    const diffMins = Math.floor((new Date() - date) / 60000);
    return diffMins < 60 ? `${diffMins}min ago` : `${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-amber-600 bg-amber-50 border-amber-200'
    };
    return colors[severity] || 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-red-600 bg-red-50 border-red-200',
      contained: 'text-amber-600 bg-amber-50 border-amber-200',
      extinguished: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    };
    return colors[status] || 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const activeIncidents = fireIncidents.filter(i => i.status === 'active').length;
  const unitsResponding = fireUnits.filter(u => ['en_route', 'on_scene'].includes(u.status)).length;
  const criticalFires = fireIncidents.filter(i => i.severity === 'critical').length;

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden">

      {/* UNIFIED HEADER - Red themed for Fire */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">

          {/* Left: Branding + Page Title */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
              <FireIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-red-200 text-sm font-medium tracking-wide">CURA Command Center</div>
              <h1 className="text-2xl font-bold text-white">Fire Incident Overview</h1>
            </div>
          </div>

          {/* Right: Status + DateTime + Stats */}
          <div className="flex items-center space-x-4">

            {/* System Online */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">System Online</span>
              <span className="text-xs text-red-200">99.9%</span>
            </div>

            {/* DateTime */}
            <div className="text-right bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="text-sm font-semibold text-white">{currentTime.toLocaleDateString()}</div>
              <div className="text-xs text-red-200">{currentTime.toLocaleTimeString()}</div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="text-center border-r border-white/20 pr-3">
                <div className="text-xl font-bold text-white">{activeIncidents}</div>
                <div className="text-xs text-red-200">Active</div>
              </div>
              <div className="text-center border-r border-white/20 pr-3">
                <div className="text-xl font-bold text-yellow-300">{criticalFires}</div>
                <div className="text-xs text-red-200">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{unitsResponding}</div>
                <div className="text-xs text-red-200">Units</div>
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

        {/* Right Panel - Fire Incidents */}
        <div className="w-96 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">

          {/* Panel Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Active Fire Incidents</h2>
                <p className="text-sm text-slate-500">Emergency responses</p>
              </div>
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-red-700">{activeIncidents} Active</span>
              </div>
            </div>
          </div>

          {/* Incident List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {fireIncidents.map((incident) => (
              <div
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
                className={`border-l-4 border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                  incident.severity === 'critical'
                    ? 'border-l-red-600 bg-red-50/50 border-red-200'
                    : incident.severity === 'high'
                    ? 'border-l-orange-500 bg-orange-50/50 border-orange-200'
                    : 'border-l-amber-500 bg-amber-50/50 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`text-sm font-bold ${
                    incident.severity === 'critical' ? 'text-red-700' :
                    incident.severity === 'high' ? 'text-orange-700' : 'text-amber-700'
                  }`}>
                    {incident.type.toUpperCase()}
                  </h3>
                  <span className="text-xs text-slate-500">{formatTimeAgo(incident.reportedAt)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{incident.location}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-600">{incident.structureType}</span>
                  </div>

                  <p className="text-xs text-slate-600">{incident.description}</p>

                  <div className="flex items-center justify-between pt-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>

                  {incident.fireUnitsResponding && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {incident.fireUnitsResponding.slice(0, 3).map((unit, idx) => (
                        <span key={idx} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                          {unit}
                        </span>
                      ))}
                      {incident.fireUnitsResponding.length > 3 && (
                        <span className="text-xs text-red-600 px-2 py-1">
                          +{incident.fireUnitsResponding.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Panel Footer */}
          <div className="p-3 border-t border-slate-200 bg-red-50">
            <div className="flex items-center justify-between text-xs text-red-700">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Fire Command Active</span>
              </div>
              <span className="font-semibold">{fireUnits.filter(u => u.status === 'available').length} units available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom KPI Bar */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">

          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Critical Fires</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{criticalFires}</p>
                <p className="text-xs text-red-500 mt-1">Immediate response</p>
              </div>
              <div className="p-2 bg-red-200 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-700" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fire Units</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{unitsResponding}/{fireUnits.length}</p>
                <p className="text-xs text-slate-500 mt-1">Currently responding</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <TruckIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Response</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">4.2</p>
                <p className="text-xs text-slate-500 mt-1">minutes today</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Weather</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">89°</p>
                <p className="text-xs text-slate-500 mt-1">SW winds 12 mph</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <BeakerIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FireIncidents;
