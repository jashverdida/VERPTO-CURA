import React, { useState, useEffect } from 'react';
import MapContainer from '../components/MapContainer';
import {
  HeartIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const MedicalEmergencies = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [activeTab, setActiveTab] = useState('emergencies');

  // Mock medical emergency data
  const [medicalEmergencies] = useState([
    {
      id: 'MED-2026-001',
      location: 'Ayala Avenue, Makati City',
      type: 'Cardiac Emergency',
      priority: 'critical',
      status: 'active',
      reportedAt: new Date(Date.now() - 8 * 60 * 1000),
      description: 'Adult male, chest pain, difficulty breathing',
      patientInfo: { age: '45-50', gender: 'Male', consciousness: 'Alert' },
      vitals: { pulse: '110 bpm', bloodPressure: '180/95', spO2: '92%', temperature: '99.2°F' },
      unitsResponding: ['AMB-04', 'MEDIC-07'],
      eta: '2 minutes',
      pcr: 'PCR-2026-045'
    },
    {
      id: 'MED-2026-002',
      location: 'University of the Philippines, QC',
      type: 'Trauma - Fall',
      priority: 'high',
      status: 'en_route',
      reportedAt: new Date(Date.now() - 25 * 60 * 1000),
      description: 'Student fell from 2nd floor, suspected fractures',
      patientInfo: { age: '18-25', gender: 'Female', consciousness: 'Alert' },
      vitals: { pulse: '95 bpm', bloodPressure: '120/80', spO2: '98%', temperature: '98.6°F' },
      unitsResponding: ['AMB-02'],
      eta: 'On scene',
      pcr: 'PCR-2026-046'
    },
    {
      id: 'MED-2026-003',
      location: 'Rizal Park, Manila',
      type: 'Diabetic Emergency',
      priority: 'medium',
      status: 'completed',
      reportedAt: new Date(Date.now() - 65 * 60 * 1000),
      description: 'Elderly patient, altered mental status, low blood sugar',
      patientInfo: { age: '65-70', gender: 'Male', consciousness: 'Improved' },
      vitals: { pulse: '88 bpm', bloodPressure: '140/90', spO2: '96%', temperature: '98.1°F' },
      unitsResponding: ['AMB-09'],
      pcr: 'PCR-2026-044'
    }
  ]);

  const [medicalUnits] = useState([
    { id: 'AMB-02', status: 'on_scene', type: 'Ambulance' },
    { id: 'AMB-04', status: 'en_route', type: 'Ambulance' },
    { id: 'AMB-09', status: 'returning', type: 'Ambulance' },
    { id: 'MEDIC-07', status: 'en_route', type: 'Paramedic Unit' },
    { id: 'AMB-12', status: 'available', type: 'Ambulance' },
    { id: 'RESCUE-03', status: 'available', type: 'Rescue Unit' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeAgo = (date) => {
    const diffMins = Math.floor((new Date() - date) / 60000);
    return diffMins < 60 ? `${diffMins}min ago` : `${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-amber-600 bg-amber-50 border-amber-200',
      medium: 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[priority] || 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-red-600 bg-red-50 border-red-200',
      en_route: 'text-amber-600 bg-amber-50 border-amber-200',
      completed: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    };
    return colors[status] || 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const activeEmergencies = medicalEmergencies.filter(e => e.status === 'active').length;
  const unitsResponding = medicalUnits.filter(u => ['en_route', 'on_scene'].includes(u.status)).length;
  const criticalCases = medicalEmergencies.filter(e => e.priority === 'critical').length;

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden">

      {/* UNIFIED HEADER - Blue themed for Medical */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">

          {/* Left: Branding + Page Title */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
              <HeartIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-blue-200 text-sm font-medium tracking-wide">CURA Command Center</div>
              <h1 className="text-2xl font-bold text-white">Medical Emergency Overview</h1>
            </div>
          </div>

          {/* Right: Status + DateTime + Stats */}
          <div className="flex items-center space-x-4">

            {/* System Online */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">System Online</span>
              <span className="text-xs text-blue-200">99.9%</span>
            </div>

            {/* DateTime */}
            <div className="text-right bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="text-sm font-semibold text-white">{currentTime.toLocaleDateString()}</div>
              <div className="text-xs text-blue-200">{currentTime.toLocaleTimeString()}</div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="text-center border-r border-white/20 pr-3">
                <div className="text-xl font-bold text-white">{activeEmergencies}</div>
                <div className="text-xs text-blue-200">Active</div>
              </div>
              <div className="text-center border-r border-white/20 pr-3">
                <div className="text-xl font-bold text-red-300">{criticalCases}</div>
                <div className="text-xs text-blue-200">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{unitsResponding}</div>
                <div className="text-xs text-blue-200">Units</div>
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

        {/* Right Panel - Emergency List */}
        <div className="w-96 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">

          {/* Panel Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Active Medical Calls</h2>
                <p className="text-sm text-slate-500">Emergency responses</p>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-blue-700">{activeEmergencies} Active</span>
              </div>
            </div>
          </div>

          {/* Emergency List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {medicalEmergencies.map((emergency) => (
              <div
                key={emergency.id}
                onClick={() => setSelectedEmergency(emergency)}
                className={`border-l-4 border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                  emergency.priority === 'critical'
                    ? 'border-l-red-500 bg-red-50/50 border-red-200'
                    : emergency.priority === 'high'
                    ? 'border-l-amber-500 bg-amber-50/50 border-amber-200'
                    : 'border-l-blue-500 bg-blue-50/50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`text-sm font-bold ${
                    emergency.priority === 'critical' ? 'text-red-700' :
                    emergency.priority === 'high' ? 'text-amber-700' : 'text-blue-700'
                  }`}>
                    {emergency.type.toUpperCase()}
                  </h3>
                  <span className="text-xs text-slate-500">{formatTimeAgo(emergency.reportedAt)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{emergency.location}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-600">
                      {emergency.patientInfo.age} {emergency.patientInfo.gender}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{emergency.description}</p>

                  {emergency.vitals && (
                    <div className="bg-white rounded p-2 text-xs grid grid-cols-2 gap-1 border border-slate-200">
                      <span>HR: {emergency.vitals.pulse}</span>
                      <span>BP: {emergency.vitals.bloodPressure}</span>
                      <span>SpO₂: {emergency.vitals.spO2}</span>
                      <span>Temp: {emergency.vitals.temperature}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getPriorityColor(emergency.priority)}`}>
                      {emergency.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(emergency.status)}`}>
                      {emergency.status.replace('_', ' ')}
                    </span>
                  </div>

                  {emergency.unitsResponding && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {emergency.unitsResponding.map((unit, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
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
          <div className="p-3 border-t border-slate-200 bg-blue-50">
            <div className="flex items-center justify-between text-xs text-blue-700">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Medical Command Active</span>
              </div>
              <span className="font-semibold">{medicalUnits.filter(u => u.status === 'available').length} units available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom KPI Bar */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="grid grid-cols-4 gap-4">

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Critical Cases</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{criticalCases}</p>
                <p className="text-xs text-blue-500 mt-1">Immediate attention</p>
              </div>
              <div className="p-2 bg-blue-200 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Medical Units</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{unitsResponding}/{medicalUnits.length}</p>
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
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Response</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">6.8</p>
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
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active PCRs</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">2</p>
                <p className="text-xs text-slate-500 mt-1">In progress</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MedicalEmergencies;
