import React, { useState, useEffect } from 'react';
import MapContainer from '../components/MapContainer';
import { HeartIcon } from '@heroicons/react/24/outline';

const MedicalEmergencies = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

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
        </div>
      </div>

      {/* Map — takes all remaining space */}
      <div className="flex-1 min-h-0 p-4">
        <MapContainer
          incidentType="medical"
          title="Medical Emergency"
          accentColor="#1D4ED8"
          headerLabel="Command Center"
          stationLocation={{ lat: 10.3260, lng: 123.9090 }}
          jurisdictionRadius={3000}
          stationName="Station 4 — Mabolo"
        />
      </div>
    </div>
  );
};

export default MedicalEmergencies;
