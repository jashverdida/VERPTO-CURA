import React, { useState, useEffect } from 'react';
import MapContainer from '../components/MapContainer';
import { TruckIcon } from '@heroicons/react/24/outline';

const RoadAccidents = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const [roadAccidents] = useState([
    { id: 'ACC-2026-001', status: 'active',   severity: 'critical', totalInjured: 2 },
    { id: 'ACC-2026-002', status: 'active',   severity: 'high',     totalInjured: 1 },
    { id: 'ACC-2026-003', status: 'clearing', severity: 'medium',   totalInjured: 1 },
  ]);

  const [trafficUnits] = useState([
    { id: 'TRAFFIC-04', status: 'en_route' },
    { id: 'TRAFFIC-08', status: 'on_scene' },
    { id: 'TRAFFIC-12', status: 'on_scene' },
    { id: 'AMB-06',     status: 'en_route' },
    { id: 'AMB-11',     status: 'on_scene' },
    { id: 'RESCUE-02',  status: 'en_route' },
    { id: 'TOW-01',     status: 'available' },
    { id: 'TOW-03',     status: 'available' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const activeAccidents  = roadAccidents.filter(a => a.status === 'active').length;
  const totalInjured     = roadAccidents.reduce((s, a) => s + a.totalInjured, 0);
  const unitsResponding  = trafficUnits.filter(u => ['en_route', 'on_scene'].includes(u.status)).length;

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden">

      {/* Header — Amber themed */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
              <TruckIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-amber-200 text-sm font-medium tracking-wide">CURA Command Center</div>
              <h1 className="text-2xl font-bold text-white">Road Accident Overview</h1>
            </div>
          </div>

        </div>
      </div>

      {/* Map — takes all remaining space */}
      <div className="flex-1 min-h-0 p-4">
        <MapContainer
          incidentType="accident"
          title="Road Accident"
          accentColor="#B45309"
          headerLabel="Command Center"
          stationLocation={{ lat: 10.3260, lng: 123.9090 }}
          jurisdictionRadius={3000}
          stationName="Station 4 — Mabolo"
        />
      </div>
    </div>
  );
};

export default RoadAccidents;
