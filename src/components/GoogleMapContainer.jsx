import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, OverlayView, Circle } from '@react-google-maps/api';
import IncidentDetailModal from './IncidentDetailModal';
import MarkerDetailModal from './MarkerDetailModal';
import {
  MapPinIcon,
  ClockIcon,
  ChevronUpIcon,
  FireIcon,
  HeartIcon,
  TruckIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  BeakerIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 10.3157, lng: 123.8854 }; // Cebu City

const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};


// Dummy citizen reporters — assigned to incidents
const DUMMY_REPORTERS = [
  { firstName: 'Eijay', middleName: 'P.', lastName: 'Pepito', phone: '09932662346', email: 'eijay.pepito8@gmail.com', address: 'Rajah Townhomes, Mandaue City', placeOfBirth: 'Cebu City', bloodType: 'A+', dateOfBirth: '2003-02-06', gender: 'Male', maritalStatus: 'Single', verificationStatus: 'pending' },
  { firstName: 'Maria', middleName: 'C.', lastName: 'Santos', phone: '09178234567', email: 'maria.santos@gmail.com', address: 'Lahug, Cebu City', placeOfBirth: 'Mandaue City', bloodType: 'O+', dateOfBirth: '1990-05-15', gender: 'Female', maritalStatus: 'Married', verificationStatus: 'verified' },
  { firstName: 'Jose', middleName: 'R.', lastName: 'Reyes', phone: '09562819340', email: 'jose.reyes@gmail.com', address: 'Colon St., Cebu City', placeOfBirth: 'Cebu City', bloodType: 'B+', dateOfBirth: '1985-11-22', gender: 'Male', maritalStatus: 'Married', verificationStatus: 'verified' },
  { firstName: 'Ana', middleName: 'L.', lastName: 'Buenaventura', phone: '09294012873', email: 'ana.b@gmail.com', address: 'Punta Princesa, Cebu City', placeOfBirth: 'Talisay City', bloodType: 'AB+', dateOfBirth: '1998-07-30', gender: 'Female', maritalStatus: 'Single', verificationStatus: 'pending' },
  { firstName: 'Carlo', middleName: 'M.', lastName: 'Mendez', phone: '09081726354', email: 'carlo.mendez@gmail.com', address: 'Busay Hills, Cebu City', placeOfBirth: 'Lapu-Lapu City', bloodType: 'O-', dateOfBirth: '1992-03-14', gender: 'Male', maritalStatus: 'Single', verificationStatus: 'verified' },
];

// Type-specific dummy incident data
const DUMMY_REPORTS = {
  fire: [
    {
      id: 1, type: 'fire', alarmLevel: 2, title: 'Structure Fire',
      location: 'Fuente Osmeña Circle, Cebu City', lat: 10.3107, lng: 123.8930,
      status: 'Under Control', time: 'December 11, 2025 9:14 pm', units: ['FR-001', 'FR-002'],
      structureType: 'Commercial Building – 3 Floors',
      reportedBy: 'Citizen Report + CURA AI Verification',
      aiConfidence: 87,
      aiNote: 'Thermal signature confirmed on 2nd floor. Lateral spread probability moderate. Fire is currently contained.',
      description: 'Smoke and flames observed from the upper floors of a commercial structure. BFP units arrived on scene and have contained the fire to the second floor.',
      reporter: DUMMY_REPORTERS[0],
    },
    {
      id: 2, type: 'fire', alarmLevel: 'general', title: 'Building Fire',
      location: 'Colon Street, Cebu City', lat: 10.2939, lng: 123.9001,
      status: 'On Going', time: 'December 11, 2025 9:02 pm', units: ['FR-003', 'FR-004', 'FR-005'],
      structureType: 'Heritage Commercial Building – 4 Floors',
      reportedBy: 'CURA Edge AI Camera Network',
      aiConfidence: 94,
      aiNote: 'Multi-floor thermal spread detected on floors 2–4. Structural integrity risk: 68%. Evacuation recommended for adjacent blocks.',
      description: 'Massive fire engulfing multiple floors of a heritage building in Colon Street. General alarm raised due to extent of blaze and proximity to densely populated area.',
      reporter: DUMMY_REPORTERS[1],
    },
    {
      id: 3, type: 'fire', alarmLevel: 1, title: 'Residential Fire',
      location: 'Lahug, Cebu City', lat: 10.3321, lng: 123.9011,
      status: 'Responding', time: 'December 11, 2025 8:45 pm', units: ['FR-006'],
      structureType: 'Single-Family Residence',
      reportedBy: 'Homeowner – Emergency Hotline',
      aiConfidence: 72,
      aiNote: 'Smoke detected from structure. Low spread probability. First alarm response sufficient at this stage.',
      description: 'Resident reported smoke from kitchen area. Single fire unit responding. Preliminary assessment indicates localized kitchen fire.',
      reporter: DUMMY_REPORTERS[2],
    },
    {
      id: 4, type: 'fire', alarmLevel: 3, title: 'Commercial Fire',
      location: 'A.S. Fortuna St, St. Martin Village', lat: 10.3200, lng: 123.9150,
      status: 'On Going', time: 'December 11, 2025 8:30 pm', units: ['FR-007', 'FR-008'],
      structureType: 'Multi-use Commercial Block',
      reportedBy: 'CURA AI + Barangay Tanod',
      aiConfidence: 81,
      aiNote: 'Fire spreading laterally. Third alarm warranted. Exposure risk to adjacent structure on east side.',
      description: 'Commercial establishment on fire with risk of spreading to adjacent properties. Third alarm declared. Exposure lines deployed.',
      reporter: DUMMY_REPORTERS[3],
    },
    {
      id: 5, type: 'fire', alarmLevel: 4, title: 'Warehouse Fire',
      location: 'South Road Properties, Cebu', lat: 10.2800, lng: 123.9100,
      status: 'Active', time: 'December 11, 2025 8:00 pm', units: ['FR-009', 'FR-010', 'FR-011'],
      structureType: 'Industrial Warehouse – High Hazard Contents',
      reportedBy: 'Security Guard – Emergency Hotline',
      aiConfidence: 91,
      aiNote: 'Hazardous material storage confirmed in warehouse. Explosion risk elevated. HAZMAT team standby recommended.',
      description: 'Large warehouse fire with suspected flammable material storage. Fourth alarm declared. Defensive operations initiated due to explosion risk.',
      reporter: DUMMY_REPORTERS[4],
    },
  ],
  medical: [
    {
      id: 1, type: 'medical', priority: 'critical', title: 'Cardiac Arrest',
      location: 'Cebu City Medical Center', lat: 10.3157, lng: 123.8854,
      status: 'Critical', time: 'December 11, 2025 9:20 pm', units: ['AMB-01', 'MEDIC-01'],
      reportedBy: 'Hospital Medical Staff',
      chiefComplaint: 'Sudden cardiac arrest – no pulse on arrival',
      triageData: [
        { q: 'Is the patient conscious?',    a: 'No — unresponsive, no reaction to stimuli' },
        { q: 'Is the patient breathing?',    a: 'Agonal breathing detected, CPR in progress' },
        { q: 'Age and sex?',                  a: 'Male, 58 years old' },
        { q: 'Known medical history?',        a: 'Hypertension, Type 2 Diabetes Mellitus' },
        { q: 'Time of onset?',                a: 'Approximately 9:18 PM — witnessed collapse' },
      ],
      vitals: { hr: '--', bp: '--', spo2: '72%', rr: '0' },
      reporter: DUMMY_REPORTERS[0],
    },
    {
      id: 2, type: 'medical', priority: 'high', title: 'Trauma – MVA',
      location: 'Osmeña Blvd, Cebu City', lat: 10.3058, lng: 123.8922,
      status: 'En Route', time: 'December 11, 2025 9:10 pm', units: ['AMB-02'],
      reportedBy: 'Traffic Enforcer – Radio Dispatch',
      chiefComplaint: 'Multiple trauma from motor vehicle accident',
      triageData: [
        { q: 'Is the patient conscious?',  a: 'Semi-conscious, responds to pain stimulus' },
        { q: 'Mechanism of injury?',        a: 'Motorcycle vs. vehicle — ejected from bike' },
        { q: 'Visible injuries?',           a: 'Head laceration, suspected leg fracture, road rash' },
        { q: 'Is the patient breathing?',  a: 'Yes — labored breathing, SpO₂ low' },
      ],
      vitals: { hr: '118', bp: '90/60', spo2: '89%', rr: '22' },
      reporter: DUMMY_REPORTERS[1],
    },
    {
      id: 3, type: 'medical', priority: 'medium', title: 'Diabetic Emergency',
      location: 'Capitol Site, Cebu City', lat: 10.3220, lng: 123.8975,
      status: 'Responding', time: 'December 11, 2025 8:55 pm', units: ['AMB-03'],
      reportedBy: 'Bystander – CURA Emergency App',
      chiefComplaint: 'Suspected hypoglycemic episode',
      triageData: [
        { q: 'Is the patient conscious?',  a: 'Conscious but confused and diaphoretic' },
        { q: 'Can the patient swallow?',   a: 'Yes — oral glucose administered by bystander' },
        { q: 'Known diabetic?',             a: 'Yes, Type 1 Diabetes — carries medical ID' },
        { q: 'Last meal?',                  a: 'Unknown — patient cannot recall' },
      ],
      vitals: { hr: '102', bp: '118/74', spo2: '97%', rr: '18' },
      reporter: DUMMY_REPORTERS[2],
    },
    {
      id: 4, type: 'medical', priority: 'critical', title: 'Stroke Response',
      location: 'Ayala Center Cebu, Cebu Business Park', lat: 10.3180, lng: 123.9050,
      status: 'Critical', time: 'December 11, 2025 8:40 pm', units: ['AMB-04', 'MEDIC-02'],
      reportedBy: 'Security Personnel – Emergency Hotline',
      chiefComplaint: 'Suspected ischemic stroke – facial droop and arm weakness',
      triageData: [
        { q: 'FAST — Face drooping?',      a: 'Yes — left-side facial droop confirmed' },
        { q: 'FAST — Arm weakness?',       a: 'Yes — left arm drift when raised' },
        { q: 'FAST — Speech difficulty?',  a: 'Slurred — difficult to understand' },
        { q: 'Time of symptom onset?',     a: 'Approximately 8:35 PM — within tPA window' },
        { q: 'Age and sex?',               a: 'Female, 67 years old' },
      ],
      vitals: { hr: '88', bp: '168/98', spo2: '94%', rr: '16' },
      reporter: DUMMY_REPORTERS[3],
    },
  ],
  accident: [
    {
      id: 1, type: 'accident', severity: 'critical', title: 'Multi-Vehicle Collision',
      location: 'Cebu-Cordova Link Expressway', lat: 10.2800, lng: 123.9300,
      status: 'Active', time: 'December 11, 2025 9:00 pm', units: ['TRAFFIC-01', 'AMB-04'],
      vehicleType: 'Bus, Sedan, Motorcycle (3 vehicles)',
      casualties: '4 injured, 1 critical — 0 fatalities reported',
      reportedBy: 'CCLEX Traffic Management + CURA AI CCTV',
      aiConfidence: 91,
      aiNote: 'Multiple vehicle debris across 2 lanes. Carriageway 40% blocked. Hazardous material spillage unconfirmed.',
      description: 'Major collision involving a bus, sedan, and motorcycle on the CCLEX. Rescue operations active. Expressway partially blocked.',
      reporter: DUMMY_REPORTERS[0],
    },
    {
      id: 2, type: 'accident', severity: 'high', title: 'Vehicle vs Pedestrian',
      location: 'N. Bacalso Ave, Cebu City', lat: 10.2980, lng: 123.8900,
      status: 'Responding', time: 'December 11, 2025 8:45 pm', units: ['TRAFFIC-02', 'AMB-05'],
      vehicleType: 'SUV vs Pedestrian',
      casualties: '1 pedestrian critical — driver uninjured',
      reportedBy: 'Witness – CURA Emergency App',
      aiConfidence: 78,
      aiNote: 'Single victim detected on roadway. Vehicle stationary. Scene appears stable. Manual assessment recommended.',
      description: 'SUV struck a pedestrian crossing N. Bacalso Ave. Victim is critical with suspected head trauma. Driver is cooperating with authorities.',
      reporter: DUMMY_REPORTERS[2],
    },
    {
      id: 3, type: 'accident', severity: 'medium', title: 'Single Vehicle Accident',
      location: 'Sergio Osmeña Blvd, Cebu City', lat: 10.3050, lng: 123.9050,
      status: 'Clearing', time: 'December 11, 2025 8:20 pm', units: ['TRAFFIC-03'],
      vehicleType: 'Motorcycle — Solo Rider',
      casualties: '1 rider with minor abrasions — no serious injury',
      reportedBy: 'CURA CCTV Network – Automatic Detection',
      aiConfidence: 65,
      aiNote: 'Single vehicle skid marks visible. Low-speed impact. No secondary hazard detected. Scene clearing.',
      description: 'Motorcycle lost control on a wet road surface. Rider sustained minor injuries. Scene being cleared by traffic enforcement.',
      reporter: DUMMY_REPORTERS[4],
    },
    {
      id: 4, type: 'accident', severity: 'high', title: 'Bus Overturned',
      location: 'South Expressway, Talisay City', lat: 10.2600, lng: 123.8750,
      status: 'Active', time: 'December 11, 2025 7:55 pm', units: ['TRAFFIC-04', 'AMB-06', 'RESCUE-01'],
      vehicleType: 'Provincial Bus — Overturned',
      casualties: '12 passengers injured, 2 critical — 0 fatalities',
      reportedBy: 'CURA AI Highway Camera + Passenger Call',
      aiConfidence: 88,
      aiNote: 'Large vehicle overturned blocking full southbound lane. Multiple victims visible. Entrapment possible. Heavy rescue required.',
      description: 'Provincial bus overturned on South Expressway. Passengers trapped inside. Heavy rescue team deployed. Southbound lane fully blocked.',
      reporter: DUMMY_REPORTERS[3],
    },
  ],
  rescue: [
    {
      id: 1, type: 'rescue', priority: 'critical', title: 'Water Rescue',
      location: 'Mactan Channel, Lapu-Lapu City', lat: 10.2900, lng: 123.9600,
      status: 'Active', time: 'December 11, 2025 9:15 pm', units: ['BOAT-01', 'SAR-01'],
      personsInvolved: '3 adults and 1 minor child',
      reportedBy: 'Coast Guard – Emergency Radio',
      description: 'Capsized fishing banca in Mactan Channel. Three adults and one child spotted clinging to the hull. Moderate current conditions.',
      reporter: DUMMY_REPORTERS[1],
      triageData: [
        { q: 'Number of persons in water?',  a: '3 adults and 1 minor — all accounted for' },
        { q: 'Water and weather conditions?', a: 'Moderate current, 1.2m waves, good visibility' },
        { q: 'Victim condition?',             a: 'Conscious but exhausted — clinging to capsized hull' },
        { q: 'Time in water?',               a: 'Approximately 25–30 minutes' },
        { q: 'Known injuries?',              a: 'No visible trauma — hypothermia risk rising' },
      ],
    },
    {
      id: 2, type: 'rescue', priority: 'high', title: 'Building Entrapment',
      location: 'Punta Princesa, Cebu City', lat: 10.2850, lng: 123.8950,
      status: 'On Scene', time: 'December 11, 2025 8:50 pm', units: ['SAR-02', 'SAR-03'],
      personsInvolved: '2 construction workers — both male adults',
      reportedBy: 'Construction Supervisor – Emergency Hotline',
      description: 'Two workers trapped under collapsed scaffolding. Structural stability being assessed. Slow extraction with shoring advised.',
      reporter: DUMMY_REPORTERS[4],
      triageData: [
        { q: 'Persons trapped?',        a: '2 workers confirmed — responsive via voice' },
        { q: 'Nature of entrapment?',   a: 'Collapsed scaffolding — concrete debris on lower extremities' },
        { q: 'Structural stability?',   a: 'Partial — shoring required before extraction' },
        { q: 'Victim vitals (verbal)?', a: 'Conscious, reporting leg pain and difficulty breathing' },
        { q: 'Time of incident?',       a: 'Approximately 8:40 PM' },
      ],
    },
    {
      id: 3, type: 'rescue', priority: 'medium', title: 'Lost Hiker',
      location: 'Busay Hills, Cebu City', lat: 10.3500, lng: 123.8800,
      status: 'Searching', time: 'December 11, 2025 7:30 pm', units: ['SAR-04'],
      personsInvolved: '1 male hiker, 24 years old',
      reportedBy: 'Hiking Companion – CURA Emergency App',
      description: 'Solo hiker separated from group in Busay Hills trail. Last seen at the summit viewpoint. Phone signal intermittent.',
      reporter: DUMMY_REPORTERS[0],
      triageData: [
        { q: 'Last known location?',    a: 'Summit viewpoint — GPS coordinates shared' },
        { q: 'Phone/comms status?',     a: 'Intermittent signal — responded once via SMS' },
        { q: 'Subject condition?',      a: 'Fatigued, mild dehydration — no injury reported' },
        { q: 'Duration missing?',       a: 'Approximately 2 hours' },
        { q: 'Weather at location?',    a: 'Foggy, temperature dropping — mild hypothermia risk' },
      ],
    },
    {
      id: 4, type: 'rescue', priority: 'critical', title: 'Flood Rescue',
      location: 'Pardo, Cebu City', lat: 10.2700, lng: 123.8850,
      status: 'Active', time: 'December 11, 2025 7:00 pm', units: ['BOAT-02', 'SAR-05', 'SAR-06'],
      personsInvolved: '8 civilians — 3 elderly, 2 children, 3 adults',
      reportedBy: 'Barangay Emergency Response Team',
      description: 'Flash flooding in low-lying Pardo area. Multiple families stranded on rooftops. Water level rising ~15cm per hour.',
      reporter: DUMMY_REPORTERS[2],
      triageData: [
        { q: 'Persons stranded?',        a: '8 confirmed — 3 elderly, 2 children, 3 adults' },
        { q: 'Current flood level?',     a: 'Approximately 1.8 meters at street level and rising' },
        { q: 'Building stability?',      a: 'Stable — residents safely on rooftops' },
        { q: 'Medical needs?',           a: 'One elderly with chest pains — priority extraction' },
        { q: 'Water current?',           a: 'Swift — debris in water, difficult boat navigation' },
      ],
    },
  ],
};

// Legend configuration per type
const LEGEND_CONFIG = {
  fire: {
    title: 'Fire Alarm Levels',
    subtitle: 'Severity indicators',
    items: [
      { label: 'First Alarm',   color: '#FCD34D' },
      { label: 'Second Alarm',  color: '#FBBF24' },
      { label: 'Third Alarm',   color: '#F97316' },
      { label: 'Fourth Alarm',  color: '#EF4444' },
      { label: 'Fifth Alarm',   color: '#DC2626' },
      { label: 'General Alarm', color: '#1F2937' },
    ],
  },
  medical: {
    title: 'Medical Priority Levels',
    subtitle: 'Patient triage codes',
    items: [
      { label: 'Code Blue',    color: '#93C5FD' },
      { label: 'Priority 3',  color: '#60A5FA' },
      { label: 'Priority 2',  color: '#3B82F6' },
      { label: 'Priority 1',  color: '#EF4444' },
      { label: 'Code Red',    color: '#DC2626' },
      { label: 'Mass Casual.', color: '#7F1D1D' },
    ],
  },
  accident: {
    title: 'Accident Severity',
    subtitle: 'Impact classification',
    items: [
      { label: 'Minor',    color: '#FCD34D' },
      { label: 'Moderate', color: '#F59E0B' },
      { label: 'Serious',  color: '#F97316' },
      { label: 'High',     color: '#EF4444' },
      { label: 'Critical', color: '#DC2626' },
      { label: 'Fatality', color: '#1F2937' },
    ],
  },
  rescue: {
    title: 'Operation Levels',
    subtitle: 'Mission classification',
    items: [
      { label: 'Standby',      color: '#14B8A6' },
      { label: 'Active',       color: '#2DD4BF' },
      { label: 'High Risk',    color: '#F97316' },
      { label: 'Critical',     color: '#DC2626' },
      { label: 'Water Rescue', color: '#3B82F6' },
      { label: 'Mass Casualty',color: '#7F1D1D' },
    ],
  },
};

const FIRE_ALARM_COLORS = {
  1: '#FCD34D',
  2: '#FBBF24',
  3: '#F97316',
  4: '#EF4444',
  5: '#DC2626',
  general: '#1F2937',
};

function getMarkerColor(report) {
  if (report.type === 'fire') return FIRE_ALARM_COLORS[report.alarmLevel] ?? '#EF4444';
  if (report.type === 'medical') {
    if (report.priority === 'critical') return '#DC2626';
    if (report.priority === 'high')     return '#EF4444';
    return '#3B82F6';
  }
  if (report.type === 'accident') {
    if (report.severity === 'critical') return '#DC2626';
    if (report.severity === 'high')     return '#EF4444';
    return '#F97316';
  }
  if (report.type === 'rescue') {
    if (report.priority === 'critical') return '#DC2626';
    if (report.priority === 'high')     return '#F97316';
    return '#14B8A6';
  }
  if (report.type === 'hazmat') {
    if (report.priority === 'critical') return '#DC2626';
    if (report.priority === 'high')     return '#EF4444';
    return '#8B5CF6';
  }
  return '#6B7280';
}

// Icon paths (24x24 viewBox) matching Ionicons: flame / medkit / car / flask / search
const MARKER_ICON_PATHS = {
  // Ionicons `flame` — teardrop outer flame + inner ember
  fire: `<path d="M12 2c-2.5 3.5-6.5 8.5-6.5 13a6.5 6.5 0 0013 0c0-4.5-4-9-6.5-13z"/><path d="M12 19a3 3 0 01-3-3c0-2 3-4.5 3-4.5s3 2.5 3 4.5a3 3 0 01-3 3z"/>`,
  // Ionicons `medkit` — briefcase body + handle + cross
  medical: `<path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7"/><path d="M4 7h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"/><path d="M12 11v4M10 13h4"/>`,
  // Ionicons `car` — side-profile cabin + body + wheels
  accident: `<path d="M5 14l2.5-5h9l2.5 5"/><path d="M2 14h20v3H2z"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/>`,
  // Ionicons `search` — magnifying glass (confirmed correct)
  rescue: `<path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>`,
  // Ionicons `flask` — Erlenmeyer / conical flask + liquid line
  hazmat: `<path d="M9 3h6M10 3v6.5L4 19a1 1 0 00.9 1.5h14.2A1 1 0 0020 19l-6-10.5V3"/><path d="M7.5 16h9"/>`,
};

// Inject pulse keyframe once
if (typeof document !== 'undefined' && !document.getElementById('cura-marker-pulse')) {
  const s = document.createElement('style');
  s.id = 'cura-marker-pulse';
  s.textContent = `
    @keyframes cura-pulse {
      0%   { transform: scale(1);   opacity: 0.55; }
      70%  { transform: scale(1.9); opacity: 0; }
      100% { transform: scale(1.9); opacity: 0; }
    }
    .cura-pulse-ring {
      position: absolute; inset: 0;
      border-radius: 50%;
      animation: cura-pulse 2s ease-out infinite;
    }
  `;
  document.head.appendChild(s);
}

function buildMarkerSvg(color, type) {
  const iconPath = MARKER_ICON_PATHS[type] ?? MARKER_ICON_PATHS.fire;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
    <circle cx="21" cy="21" r="18" fill="${color}" stroke="white" stroke-width="2.5"/>
    <g transform="translate(9,9)" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      ${iconPath}
    </g>
  </svg>`;
}

function PulsingMarker({ color, type, onClick }) {
  const dataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildMarkerSvg(color, type))}`;
  return (
    <div
      onClick={onClick}
      style={{ position: 'relative', width: 42, height: 42, cursor: 'pointer' }}
    >
      <div className="cura-pulse-ring" style={{ backgroundColor: color }} />
      <img src={dataUrl} width={42} height={42} draggable={false} style={{ position: 'relative', display: 'block' }} />
    </div>
  );
}


const STATION_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="54" viewBox="0 0 46 54">
  <path d="M23 2C12 2 3 11 3 22C3 36 23 52 23 52C23 52 43 36 43 22C43 11 34 2 23 2Z" fill="#1D4ED8" stroke="white" stroke-width="2.5"/>
  <g transform="translate(9,8)" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 18V9l12-7 12 7v9H2Z"/>
    <rect x="9.5" y="11" width="5" height="7" rx="0.5"/>
  </g>
</svg>`;

function StationMarker({ stationName }) {
  const dataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(STATION_SVG)}`;
  return (
    <div style={{ position: 'relative', cursor: 'default', userSelect: 'none' }}>
      {stationName && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 3,
          backgroundColor: '#1D4ED8',
          color: 'white',
          fontSize: 10,
          fontWeight: 700,
          padding: '2px 7px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
          letterSpacing: '0.02em',
        }}>
          {stationName}
        </div>
      )}
      <img src={dataUrl} width={46} height={54} draggable={false} style={{ display: 'block' }} />
    </div>
  );
}

const JURISDICTION_CIRCLE_OPTIONS = {
  strokeColor: '#1D4ED8',
  strokeOpacity: 0.5,
  strokeWeight: 2,
  fillColor: '#3B82F6',
  fillOpacity: 0.07,
};

const USER_ICON = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <circle cx="11" cy="11" r="10" fill="#4285F4" fill-opacity="0.18"/>
    <circle cx="11" cy="11" r="6"  fill="#4285F4" stroke="white" stroke-width="2"/>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 22, height: 22, equals: () => false },
    anchor: { x: 11, y: 11, equals: () => false },
  };
})();

function statusBadgeClass(status) {
  const s = (status ?? '').toLowerCase();
  if (s.includes('control') || s.includes('clear') || s.includes('complet')) return 'bg-amber-100 text-amber-800 border border-amber-300';
  if (s.includes('going') || s.includes('active') || s.includes('critical')) return 'bg-red-100 text-red-800 border border-red-300';
  return 'bg-slate-100 text-slate-700 border border-slate-300';
}

function alarmBadgeClass(report) {
  if (report.type === 'fire') {
    if (report.alarmLevel === 'general') return 'bg-gray-900 text-white';
    if (report.alarmLevel >= 4) return 'bg-red-700 text-white';
    if (report.alarmLevel === 3) return 'bg-orange-600 text-white';
    if (report.alarmLevel === 2) return 'bg-amber-500 text-white';
    return 'bg-yellow-400 text-gray-900';
  }
  if (report.type === 'medical') {
    if (report.priority === 'critical') return 'bg-red-700 text-white';
    if (report.priority === 'high')     return 'bg-red-500 text-white';
    return 'bg-blue-500 text-white';
  }
  if (report.type === 'accident') {
    if (report.severity === 'critical') return 'bg-red-700 text-white';
    if (report.severity === 'high')     return 'bg-amber-600 text-white';
    return 'bg-amber-400 text-gray-900';
  }
  if (report.type === 'rescue') {
    if (report.priority === 'critical') return 'bg-red-700 text-white';
    if (report.priority === 'high')     return 'bg-orange-600 text-white';
    return 'bg-purple-600 text-white';
  }
  return 'bg-slate-500 text-white';
}

function alarmBadgeLabel(report) {
  if (report.type === 'fire') {
    const lvl = report.alarmLevel;
    if (lvl === 'general') return 'GENERAL ALARM';
    const ord = ['', '1ST ALARM', '2ND ALARM', '3RD ALARM', '4TH ALARM', '5TH ALARM'];
    return ord[lvl] ?? `${lvl}TH ALARM`;
  }
  if (report.type === 'medical')  return (report.priority ?? 'priority').toUpperCase();
  if (report.type === 'accident') return (report.severity ?? 'severity').toUpperCase();
  if (report.type === 'rescue')   return (report.priority ?? 'priority').toUpperCase();
  return 'ALERT';
}

const TYPE_ICON = {
  fire:     FireIcon,
  medical:  HeartIcon,
  accident: TruckIcon,
  rescue:   MagnifyingGlassIcon,
  hazmat:   BeakerIcon,
};

export default function GoogleMapContainer({
  incidentType     = 'all',
  title            = 'Emergency Response',
  accentColor      = '#16a34a',
  headerLabel      = 'Command Center',
  stationLocation  = null,
  jurisdictionRadius = 3000,
  stationName      = '',
}) {
  const [authError, setAuthError] = useState(false);
  useEffect(() => {
    // Google Maps fires this when the key is invalid, not enabled, or restricted
    window.gm_authFailure = () => setAuthError(true);
    return () => { window.gm_authFailure = undefined; };
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: API_KEY ?? '' });
  const [detailReport, setDetailReport]       = useState(null);
  const [markerReport, setMarkerReport]       = useState(null);

  const mapCenter = stationLocation ?? DEFAULT_CENTER;
  const mapZoom   = stationLocation
    ? (jurisdictionRadius >= 5000 ? 12 : jurisdictionRadius >= 3000 ? 13 : 14)
    : 13;
  const [userLocation, setUserLocation]       = useState(null);
  const [legendOpen, setLegendOpen]           = useState(true);
  const [panelOpen, setPanelOpen]             = useState(true);
  const [isFullscreen, setIsFullscreen]       = useState(false);
  const [baseMap, setBaseMap]                 = useState('map');
  const [subOption, setSubOption]             = useState(false);
  const mapRef       = useRef(null);
  const containerRef = useRef(null);

  const reports = incidentType === 'all'
    ? Object.values(DUMMY_REPORTS).flat()
    : (DUMMY_REPORTS[incidentType] ?? []);

  const legend = LEGEND_CONFIG[incidentType] ?? null;
  const TypeIcon = TYPE_ICON[incidentType] ?? FireIcon;

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
      },
      () => {}
    );
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (baseMap === 'map') {
      mapRef.current.setMapTypeId(subOption ? 'terrain' : 'roadmap');
    } else {
      mapRef.current.setMapTypeId(subOption ? 'hybrid' : 'satellite');
    }
  }, [baseMap, subOption]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (!API_KEY) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 text-red-600 text-sm p-4 text-center rounded-xl">
        <div>
          <p className="font-semibold mb-1">⚠️ Google Maps API Key Missing</p>
          <p className="text-xs">Add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  if (loadError || authError) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 text-red-600 text-sm rounded-xl p-4 text-center">
        <div className="max-w-xs">
          <p className="font-semibold mb-2">Google Maps failed to authenticate</p>
          <p className="text-xs text-red-500 mb-3">
            Your API key <code className="font-mono bg-red-100 px-1 rounded">{API_KEY?.slice(0,12)}…</code> was rejected.
          </p>
          <ol className="text-xs text-left text-red-700 space-y-1 list-decimal list-inside">
            <li>Open <strong>Google Cloud Console → APIs &amp; Services → Enabled APIs</strong></li>
            <li>Enable <strong>Maps JavaScript API</strong></li>
            <li>Under <strong>Credentials</strong>, edit the key and ensure <code className="font-mono bg-red-100 px-1 rounded">http://localhost:5173/*</code> is an allowed referrer (or set to "Any website" for dev)</li>
            <li>Ensure <strong>billing</strong> is enabled on the project</li>
          </ol>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400 text-sm rounded-xl">
        Loading map…
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full relative overflow-hidden rounded-xl shadow-lg">
      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={mapZoom}
        options={MAP_OPTIONS}
        onLoad={map => { mapRef.current = map; }}
      >
        {userLocation && (
          <Marker position={userLocation} icon={USER_ICON} title="Your location" zIndex={9999} />
        )}

        {stationLocation && (
          <Circle
            center={stationLocation}
            radius={jurisdictionRadius}
            options={JURISDICTION_CIRCLE_OPTIONS}
          />
        )}

        {stationLocation && (
          <OverlayView
            position={stationLocation}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={() => ({ x: -23, y: -54 })}
          >
            <StationMarker stationName={stationName} />
          </OverlayView>
        )}

        {reports.map(report => (
          <OverlayView
            key={`${report.type}-${report.id}`}
            position={{ lat: report.lat, lng: report.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={() => ({ x: -21, y: -21 })}
          >
            <PulsingMarker
              color={getMarkerColor(report)}
              type={report.type}
              onClick={() => {
                mapRef.current?.panTo({ lat: report.lat, lng: report.lng });
                setMarkerReport(report);
              }}
            />
          </OverlayView>
        ))}

      </GoogleMap>

      {/* ── Bottom-Left Overlay: Active Incidents Panel ── */}
      <div
        className="absolute bottom-4 left-4 flex flex-col shadow-2xl rounded-xl overflow-hidden z-10"
        style={{ width: 256 }}
      >
        {/* Panel header — always visible, click to toggle */}
        <button
          className="flex items-center justify-between px-3 py-2.5 flex-shrink-0 w-full text-left"
          style={{ backgroundColor: accentColor }}
          onClick={() => setPanelOpen(p => !p)}
        >
          <div className="flex items-center gap-2">
            <TypeIcon className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">Active Incidents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded px-2 py-0.5 flex items-baseline gap-1">
              <span className="text-white font-black text-base leading-none">{reports.length}</span>
              <span className="text-white/70 text-xs">active</span>
            </div>
            <ChevronUpIcon
              className="w-4 h-4 text-white/80 transition-transform duration-300 ease-in-out"
              style={{ transform: panelOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
            />
          </div>
        </button>

        {/* Animated incident list */}
        <div
          style={{
            maxHeight: panelOpen ? '280px' : '0px',
            transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
          }}
        >
          <div className="overflow-y-auto bg-white" style={{ maxHeight: '280px' }}>
            {reports.map((report, idx) => (
              <div
                key={`${report.type}-${report.id}`}
                className={`px-3 py-2.5 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors ${idx < reports.length - 1 ? 'border-b border-slate-100' : ''}`}
                onClick={() => {
                  setDetailReport(report);
                  mapRef.current?.panTo({ lat: report.lat, lng: report.lng });
                }}
              >
                <div className="flex items-start gap-1.5 mb-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-slate-800 leading-tight">{report.location}</span>
                </div>
                <div className="flex items-center gap-1 ml-5 flex-wrap">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-sm ${statusBadgeClass(report.status)}`}>
                    {report.status}
                  </span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-sm ${alarmBadgeClass(report)}`}>
                    {alarmBadgeLabel(report)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 ml-5">
                  <ClockIcon className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{report.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Overlay: Legend / Dashboard Info Panel ── */}
      {legend && (
        <div
          className="absolute top-4 right-14 flex flex-col shadow-2xl rounded-xl overflow-hidden z-10"
          style={{ width: 256 }}
        >
          {/* Panel header — always visible, chevron toggles body */}
          <button
            className="flex items-center justify-between px-4 py-3 flex-shrink-0 w-full text-left"
            style={{ backgroundColor: accentColor }}
            onClick={() => setLegendOpen(p => !p)}
          >
            <div>
              <div className="text-white font-bold text-sm">{headerLabel}</div>
              <div className="text-white/70 text-xs">{title}</div>
            </div>
            <ChevronUpIcon
              className="w-4 h-4 text-white/80 transition-transform duration-300 ease-in-out ml-2 flex-shrink-0"
              style={{ transform: legendOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
            />
          </button>

          {/* Animated legend body */}
          <div
            style={{
              maxHeight: legendOpen ? '300px' : '0px',
              transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
            }}
          >
            <div className="bg-white px-4 py-4">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${accentColor}22` }}
                >
                  <TypeIcon className="w-4 h-4" style={{ color: accentColor }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">{legend.title}</div>
                  <div className="text-xs text-slate-500">{legend.subtitle}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {legend.items.map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-slate-600 leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Map Type Picker ── */}
      <div className="absolute top-2 left-2 z-10 flex flex-col overflow-hidden rounded-xl shadow-2xl border border-emerald-700/30"
        style={{ minWidth: 172, background: 'rgba(10,20,15,0.88)', backdropFilter: 'blur(10px)' }}
      >
        {/* Primary: Map | Satellite */}
        <div className="flex">
          {[
            { id: 'map',       label: 'Map' },
            { id: 'satellite', label: 'Satellite' },
          ].map((type, i) => {
            const active = baseMap === type.id;
            return (
              <button
                key={type.id}
                onClick={() => { setBaseMap(type.id); setSubOption(false); }}
                className={`flex-1 py-2.5 text-xs font-bold tracking-wide transition-all duration-250 ${
                  i > 0 ? 'border-l border-emerald-900/60' : ''
                } ${active ? 'text-white' : 'text-slate-400 hover:text-emerald-300'}`}
                style={active ? { background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)' } : {}}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Sub-option toggle */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-emerald-900/50">
          <span className="text-xs font-semibold text-slate-300 tracking-wide">
            {baseMap === 'map' ? 'Terrain' : 'Labels'}
          </span>
          <button
            onClick={() => setSubOption(p => !p)}
            className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-all duration-300 ${
              subOption
                ? 'shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : ''
            }`}
            style={subOption
              ? { background: 'linear-gradient(135deg, #059669, #34d399)' }
              : { background: '#1e3a2a' }
            }
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
              subOption ? 'left-[18px]' : 'left-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* ── Custom Fullscreen Button ── */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-2 right-2 z-10 bg-slate-900/90 backdrop-blur-sm hover:bg-slate-800/90 border border-slate-700/50 rounded-xl shadow-xl p-1.5 transition-colors"
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen
          ? <ArrowsPointingInIcon className="w-5 h-5 text-slate-300" />
          : <ArrowsPointingOutIcon className="w-5 h-5 text-slate-300" />
        }
      </button>

      {/* ── Marker click → Citizen + Incident modal ── */}
      {markerReport && (
        <MarkerDetailModal
          report={markerReport}
          onClose={() => setMarkerReport(null)}
        />
      )}

      {/* ── Mini panel click → Incident detail modal ── */}
      {detailReport && (
        <IncidentDetailModal
          report={detailReport}
          onClose={() => setDetailReport(null)}
        />
      )}
    </div>
  );
}
