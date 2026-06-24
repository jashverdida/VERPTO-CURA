import React, { useState, useEffect } from 'react';
import MapContainer from '../components/MapContainer';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const RescueOperations = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const [rescueOperations] = useState([
    { id: 'RES-2026-001', status: 'active',    priority: 'critical', missingPersons: 3, resources: { personnel: 25 } },
    { id: 'RES-2026-002', status: 'active',    priority: 'critical', missingPersons: 4, resources: { personnel: 18 } },
    { id: 'RES-2026-003', status: 'ongoing',   priority: 'high',     missingPersons: 8, resources: { personnel: 35 } },
    { id: 'RES-2026-004', status: 'completed', priority: 'medium',   missingPersons: 1, resources: { personnel: 12 } },
  ]);

  const [rescueUnits] = useState([
    { id: 'SAR-01',   status: 'on_scene' },
    { id: 'SAR-03',   status: 'on_scene' },
    { id: 'SAR-05',   status: 'returning' },
    { id: 'HELI-02',  status: 'en_route' },
    { id: 'BOAT-04',  status: 'on_scene' },
    { id: 'BOAT-07',  status: 'on_scene' },
    { id: 'COAST-01', status: 'en_route' },
    { id: 'USAR-01',  status: 'on_scene' },
    { id: 'USAR-03',  status: 'on_scene' },
    { id: 'K9-01',    status: 'available' },
    { id: 'K9-02',    status: 'on_scene' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const activeOperations = rescueOperations.filter(op => ['active', 'ongoing'].includes(op.status)).length;
  const unitsDeployed    = rescueUnits.filter(u => ['en_route', 'on_scene'].includes(u.status)).length;
  const totalMissing     = rescueOperations
    .filter(op => op.status !== 'completed')
    .reduce((s, op) => s + op.missingPersons, 0);

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden">

      {/* Header — Purple themed */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
              <MagnifyingGlassIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-purple-200 text-sm font-medium tracking-wide">CURA Command Center</div>
              <h1 className="text-2xl font-bold text-white">Rescue Operations Overview</h1>
            </div>
          </div>

        </div>
      </div>

      {/* Map — takes all remaining space */}
      <div className="flex-1 min-h-0 p-4">
        <MapContainer
          incidentType="rescue"
          title="Rescue Operations"
          accentColor="#7C3AED"
          headerLabel="Command Center"
          stationLocation={{ lat: 10.3260, lng: 123.9090 }}
          jurisdictionRadius={3000}
          stationName="Station 4 — Mabolo"
        />
      </div>
    </div>
  );
};

export default RescueOperations;
