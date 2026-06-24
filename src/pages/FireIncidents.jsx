import React, { useState, useEffect } from 'react';
import MapContainer from '../components/MapContainer';
import { supabase } from '../lib/supabase';
import { FireIcon } from '@heroicons/react/24/outline';

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

  const activeIncidents = fireIncidents.filter(i => i.status === 'active').length;
  const criticalFires = fireIncidents.filter(i => i.severity === 'critical').length;
  const unitsResponding = fireUnits.filter(u => ['en_route', 'on_scene'].includes(u.status)).length;

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
        </div>
      </div>

      {/* Map — takes all remaining space */}
      <div className="flex-1 min-h-0 p-4">
        <MapContainer
          incidentType="fire"
          title="Fire Emergency"
          accentColor="#B91C1C"
          headerLabel="Command Center"
          stationLocation={{ lat: 10.3260, lng: 123.9090 }}
          jurisdictionRadius={3000}
          stationName="Station 4 — Mabolo"
        />
      </div>
    </div>
  );
};

export default FireIncidents;
