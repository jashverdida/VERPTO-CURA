// CURA Dummy Data Constants
// Realistic emergency scenarios for first responders in Southeast Asia

import { format, subHours, subMinutes, subDays } from 'date-fns';

// Emergency incident types
export const INCIDENT_TYPES = {
  MEDICAL: 'medical',
  FIRE: 'fire',
  FLOOD: 'flood',
  TRAFFIC: 'traffic',
  STRUCTURAL: 'structural',
  RESCUE: 'rescue',
};

// Priority levels
export const PRIORITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Unit status
export const UNIT_STATUS = {
  AVAILABLE: 'available',
  EN_ROUTE: 'en_route',
  ON_SCENE: 'on_scene',
  RETURNING: 'returning',
  OUT_OF_SERVICE: 'out_of_service',
};

// Sample active incidents for triage queue
export const ACTIVE_INCIDENTS = [
  {
    id: 'INC-2026-001',
    type: INCIDENT_TYPES.MEDICAL,
    title: 'Code 3 - Vehicular Trauma (NLP Triage Verified)',
    description: 'Motor vehicle collision with entrapment at Commonwealth Ave x Katipunan',
    location: 'Commonwealth Ave x Katipunan Ave, Quezon City',
    coordinates: { lat: 14.6542, lng: 121.0700 },
    priority: PRIORITY_LEVELS.CRITICAL,
    status: 'active',
    reportedAt: subMinutes(new Date(), 12),
    estimatedSeverity: 'High - Multiple casualties suspected',
    assignedUnits: ['AMB-04', 'FIRE-12', 'RESCUE-07'],
    aiVerified: true,
    imageAnalysis: 'Confirmed: Vehicle damage, smoke visible',
    nlpTriage: 'Voice analysis indicates severe trauma, immediate response required'
  },
  {
    id: 'INC-2026-002',
    type: INCIDENT_TYPES.FIRE,
    title: 'Structural Fire - Verifying Images',
    description: 'Reported structure fire at residential compound',
    location: 'Barangay Lahug, Cebu City',
    coordinates: { lat: 10.3280, lng: 123.9066 },
    priority: PRIORITY_LEVELS.HIGH,
    status: 'pending_verification',
    reportedAt: subMinutes(new Date(), 8),
    estimatedSeverity: 'Moderate - Single structure affected',
    assignedUnits: ['FIRE-03'],
    aiVerified: false,
    imageAnalysis: 'Processing: Edge AI analyzing submitted photos',
    nlpTriage: 'Caller calm, no immediate life threat detected'
  },
  {
    id: 'INC-2026-003',
    type: INCIDENT_TYPES.MEDICAL,
    title: 'Ambulance Unit 04 Route Status',
    description: 'Medical emergency - cardiac event',
    location: 'Manila General Hospital, Ermita',
    coordinates: { lat: 14.5835, lng: 120.9808 },
    priority: PRIORITY_LEVELS.CRITICAL,
    status: 'en_route',
    reportedAt: subMinutes(new Date(), 25),
    estimatedSeverity: 'Critical - Cardiac arrest',
    assignedUnits: ['AMB-04'],
    aiVerified: true,
    imageAnalysis: 'N/A - Voice report only',
    nlpTriage: 'High stress indicators, CPR in progress'
  },
  {
    id: 'INC-2026-004',
    type: INCIDENT_TYPES.FLOOD,
    title: 'Flash Flood Warning - Pasig River',
    description: 'Rising water levels due to heavy rainfall',
    location: 'Marikina City riverside areas',
    coordinates: { lat: 14.6507, lng: 121.1029 },
    priority: PRIORITY_LEVELS.HIGH,
    status: 'monitoring',
    reportedAt: subMinutes(new Date(), 45),
    estimatedSeverity: 'High - Evacuation may be required',
    assignedUnits: ['RESCUE-02', 'RESCUE-05'],
    aiVerified: true,
    imageAnalysis: 'Confirmed: Water level at 16.5m (critical threshold)',
    nlpTriage: 'Multiple citizen reports, evacuation preparation initiated'
  },
  {
    id: 'INC-2026-005',
    type: INCIDENT_TYPES.RESCUE,
    title: 'Building Collapse - Search & Rescue',
    description: 'Partial building collapse at construction site',
    location: 'BGC, Taguig City',
    coordinates: { lat: 14.5515, lng: 121.0512 },
    priority: PRIORITY_LEVELS.CRITICAL,
    status: 'active',
    reportedAt: subHours(new Date(), 1),
    estimatedSeverity: 'Critical - Workers potentially trapped',
    assignedUnits: ['RESCUE-01', 'FIRE-08', 'AMB-02', 'AMB-07'],
    aiVerified: true,
    imageAnalysis: 'Confirmed: Structural damage, debris field visible',
    nlpTriage: 'Site foreman reported missing workers'
  }
];

// Emergency units
export const EMERGENCY_UNITS = [
  {
    id: 'AMB-04',
    type: 'ambulance',
    callSign: 'Ambulance 04',
    status: UNIT_STATUS.EN_ROUTE,
    location: 'Commonwealth Ave, moving towards Katipunan',
    estimatedArrival: format(new Date(Date.now() + 8 * 60000), 'HH:mm'),
    crew: ['Medic Santos', 'EMT Reyes'],
    equipment: ['AED', 'Oxygen', 'Trauma Kit', 'Spine Board'],
    currentIncident: 'INC-2026-001'
  },
  {
    id: 'FIRE-12',
    type: 'fire',
    callSign: 'Fire Truck 12',
    status: UNIT_STATUS.EN_ROUTE,
    location: 'Commonwealth Ave, responding to MVA',
    estimatedArrival: format(new Date(Date.now() + 10 * 60000), 'HH:mm'),
    crew: ['Capt. Cruz', 'FF Dela Cruz', 'FF Mendoza', 'FF Garcia'],
    equipment: ['Jaws of Life', 'Rescue Tools', 'Fire Suppression'],
    currentIncident: 'INC-2026-001'
  },
  {
    id: 'RESCUE-07',
    type: 'rescue',
    callSign: 'Rescue 07',
    status: UNIT_STATUS.AVAILABLE,
    location: 'Station 7 - Quezon City',
    estimatedArrival: null,
    crew: ['Rescue Leader Tan', 'Specialist Lim'],
    equipment: ['Heavy Rescue Tools', 'Rope Rescue', 'Extraction Equipment'],
    currentIncident: null
  }
];

// Notifications and alerts
export const NOTIFICATIONS = [
  {
    id: 'NOT-001',
    type: 'edge_ai',
    title: 'Edge Node SMS Received: Flood Level Critical at Main Ave',
    message: 'Automated sensor data indicates water level at 18.2m - above critical threshold. Citizen reports of road impassability confirmed via image analysis.',
    timestamp: subMinutes(new Date(), 5),
    priority: PRIORITY_LEVELS.CRITICAL,
    source: 'Edge Node MKN-12',
    actionRequired: true,
    relatedIncident: 'INC-2026-004',
    aiConfidence: 0.94
  },
  {
    id: 'NOT-002',
    type: 'pcr_sync',
    title: 'New Digital PCR Synced from Medic Team Alpha',
    message: 'Patient care record successfully uploaded: 45-year-old male, chest pain, vitals stable, transported to PGH. Full PCR available in system.',
    timestamp: subMinutes(new Date(), 18),
    priority: PRIORITY_LEVELS.MEDIUM,
    source: 'AMB-04 - Medic Santos',
    actionRequired: false,
    relatedIncident: 'INC-2026-003',
    aiConfidence: null
  },
  {
    id: 'NOT-003',
    type: 'voice_transcript',
    title: 'Voice-to-Text: Emergency Call Transcript',
    message: '"May sunog sa amin! Sa compound, maraming tao pa inside! Kailangan ng tulong agad!" - NLP Analysis: High stress, confirmed emergency, Cebuano/Tagalog mixed dialect detected.',
    timestamp: subMinutes(new Date(), 22),
    priority: PRIORITY_LEVELS.HIGH,
    source: 'Emergency Hotline +63917XXXXXXX',
    actionRequired: true,
    relatedIncident: 'INC-2026-002',
    aiConfidence: 0.87,
    languageDetected: 'Tagalog/Cebuano mixed'
  },
  {
    id: 'NOT-004',
    type: 'system_alert',
    title: 'SMS Gateway Failover Activated',
    message: 'Primary data connection lost in Visayas region. Edge AI nodes have switched to SMS-only mode. All incident reports being compressed and transmitted via SMS fallback.',
    timestamp: subMinutes(new Date(), 35),
    priority: PRIORITY_LEVELS.HIGH,
    source: 'CURA System Monitor',
    actionRequired: false,
    relatedIncident: null,
    aiConfidence: null
  },
  {
    id: 'NOT-005',
    type: 'citizen_report',
    title: 'Verified Citizen Report: Building Damage',
    message: 'Citizen-submitted photo verified by AI: Structural damage at BGC construction site. Classification: Partial collapse, debris field, potential casualties. Confidence: 92%',
    timestamp: subMinutes(new Date(), 65),
    priority: PRIORITY_LEVELS.CRITICAL,
    source: 'Citizen via CURA App',
    actionRequired: true,
    relatedIncident: 'INC-2026-005',
    aiConfidence: 0.92,
    imageVerified: true
  },
  {
    id: 'NOT-006',
    type: 'weather_alert',
    title: 'PAGASA Weather Alert: Heavy Rainfall Warning',
    message: 'Issued: Heavy rainfall expected in Metro Manila and surrounding areas for the next 3 hours. Flash flood risk elevated. All units advised to monitor water levels in low-lying areas.',
    timestamp: subMinutes(new Date(), 95),
    priority: PRIORITY_LEVELS.MEDIUM,
    source: 'PAGASA Weather Service',
    actionRequired: false,
    relatedIncident: null,
    aiConfidence: null
  }
];

// Patient Care Records (PCR) logs
export const PCR_LOGS = [
  {
    id: 'PCR-2026-001',
    patientId: 'PAT-2026-045',
    incidentId: 'INC-2026-003',
    medic: 'Medic Santos',
    unit: 'AMB-04',
    chiefComplaint: 'Chest pain, difficulty breathing',
    vitals: {
      bloodPressure: '140/90',
      pulse: '110 BPM',
      respiration: '22',
      temperature: '36.8°C',
      oxygenSaturation: '94%'
    },
    treatment: 'Oxygen therapy, IV access established, cardiac monitoring',
    disposition: 'Transported to Philippine General Hospital',
    timestamp: subHours(new Date(), 2),
    status: 'completed',
    aiAssisted: true
  },
  {
    id: 'PCR-2026-002',
    patientId: 'PAT-2026-046',
    incidentId: 'INC-2026-001',
    medic: 'EMT Reyes',
    unit: 'AMB-04',
    chiefComplaint: 'Motor vehicle accident, suspected fractures',
    vitals: {
      bloodPressure: '120/80',
      pulse: '95 BPM',
      respiration: '18',
      temperature: '36.5°C',
      oxygenSaturation: '98%'
    },
    treatment: 'Spinal immobilization, pain management',
    disposition: 'En route to trauma center',
    timestamp: subMinutes(new Date(), 45),
    status: 'active',
    aiAssisted: true
  }
];

// System/Edge Node Status
export const EDGE_NODES = [
  {
    id: 'EDGE-MNL-01',
    name: 'Manila Central Hub',
    location: 'Manila City Hall',
    status: 'online',
    lastPing: subMinutes(new Date(), 2),
    connections: 847,
    processedToday: 1247,
    aiModelsLoaded: ['vision-classifier-v2', 'nlp-triage-v1', 'speech-to-text-ph'],
    batteryLevel: null,
    networkMode: '4G/WiFi'
  },
  {
    id: 'EDGE-CEB-01',
    name: 'Cebu Emergency Hub',
    location: 'Cebu City DRRMO',
    status: 'sms_only',
    lastPing: subMinutes(new Date(), 35),
    connections: 234,
    processedToday: 89,
    aiModelsLoaded: ['vision-classifier-v2', 'nlp-triage-v1'],
    batteryLevel: '67%',
    networkMode: 'SMS Fallback'
  },
  {
    id: 'EDGE-DVG-01',
    name: 'Davao Response Center',
    location: 'Davao City Fire Station',
    status: 'online',
    lastPing: subMinutes(new Date(), 1),
    connections: 445,
    processedToday: 678,
    aiModelsLoaded: ['vision-classifier-v2', 'nlp-triage-v1', 'speech-to-text-ph'],
    batteryLevel: null,
    networkMode: '5G/WiFi'
  },
  {
    id: 'EDGE-ILO-01',
    name: 'Iloilo Emergency Coordination',
    location: 'Iloilo Provincial Capitol',
    status: 'degraded',
    lastPing: subMinutes(new Date(), 18),
    connections: 156,
    processedToday: 234,
    aiModelsLoaded: ['vision-classifier-v2'],
    batteryLevel: '23%',
    networkMode: '3G Limited'
  }
];

// Navigation menu items
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'MapIcon',
    path: '/',
    description: 'Live region view and active incidents'
  },
  {
    id: 'incidents',
    name: 'Active Incidents',
    icon: 'ExclamationTriangleIcon',
    path: '/incidents',
    description: 'Emergency incident management'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: 'BellIcon',
    path: '/notifications',
    description: 'AI alerts and communications'
  },
  {
    id: 'pcr',
    name: 'PCR Log',
    icon: 'ClipboardDocumentListIcon',
    path: '/pcr',
    description: 'Patient care records'
  },
  {
    id: 'system',
    name: 'System Status',
    icon: 'ServerIcon',
    path: '/system',
    description: 'Edge node monitoring'
  }
];

// Helper functions for status colors and formatting
export const getStatusColor = (status) => {
  const colorMap = {
    critical: 'text-critical-red bg-red-50 border-red-200',
    high: 'text-warning-amber bg-yellow-50 border-yellow-200',
    medium: 'text-clinical-blue bg-blue-50 border-blue-200',
    low: 'text-text-medium bg-gray-50 border-gray-200',
    active: 'text-clinical-blue bg-blue-50 border-blue-200',
    pending: 'text-warning-amber bg-yellow-50 border-yellow-200',
    resolved: 'text-success-green bg-green-50 border-green-200',
    online: 'text-success-green',
    offline: 'text-critical-red',
    degraded: 'text-warning-amber',
    sms_only: 'text-warning-amber'
  };
  return colorMap[status] || 'text-text-medium bg-gray-50 border-gray-200';
};

export const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / 60000);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};