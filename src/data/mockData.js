// CURA Mock Data - Realistic emergency response scenarios
// Authors: Eijay Pepito, Jashmine Verdida

// Emergency Status Types
export const INCIDENT_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  DISPATCHED: 'dispatched',
  RESOLVED: 'resolved',
  CRITICAL: 'critical'
};

// Emergency Code Types
export const EMERGENCY_CODES = {
  CODE_1: 'code-1', // Low priority
  CODE_2: 'code-2', // Medium priority
  CODE_3: 'code-3', // High priority - lights and sirens
  CODE_RED: 'code-red', // Critical emergency
  CODE_BLUE: 'code-blue' // Medical emergency
};

// Agency Types
export const AGENCY_TYPES = {
  AMBULANCE: 'ambulance',
  FIRE: 'fire',
  DRRMO: 'drrmo',
  POLICE: 'police'
};

// Active Incident Queue - Realistic emergency scenarios
export const ACTIVE_INCIDENTS = [
  {
    id: 'INC-2026-001',
    title: 'Code 3 - Vehicular Trauma (NLP Triage Verified)',
    description: 'Multi-vehicle collision with entrapment, AI-verified voice distress pattern detected',
    location: 'IT Park Ave & Gov. Cuenco Ave Intersection, Lahug',
    coordinates: { lat: 10.3287, lng: 123.9078 },
    timestamp: '2026-03-22T09:15:00Z',
    status: INCIDENT_STATUS.ACTIVE,
    priority: EMERGENCY_CODES.CODE_3,
    assignedAgency: AGENCY_TYPES.AMBULANCE,
    assignedUnit: 'AMB-04',
    triageLevel: 'Red',
    aiVerified: true,
    edgeNodeData: {
      imageAnalysis: 'Vehicle deformation detected, airbag deployment confirmed',
      voiceAnalysis: 'High stress markers, medical terminology detected',
      confidence: 0.94
    },
    estimatedResponse: '8 minutes',
    requiredEquipment: ['Jaws of Life', 'Advanced Life Support', 'Trauma Kit']
  },
  {
    id: 'INC-2026-002',
    title: 'Structural Fire - Verifying Images',
    description: 'Reported building fire at commercial complex, Edge AI analyzing uploaded images',
    location: 'Ayala Center Cebu, Cardinal Rosales Ave',
    coordinates: { lat: 10.3156, lng: 123.8854 },
    timestamp: '2026-03-22T09:22:00Z',
    status: INCIDENT_STATUS.PENDING,
    priority: EMERGENCY_CODES.CODE_RED,
    assignedAgency: AGENCY_TYPES.FIRE,
    assignedUnit: 'FIRE-02, FIRE-07',
    triageLevel: 'Critical',
    aiVerified: true,
    edgeNodeData: {
      imageAnalysis: 'Smoke plume detected, flame signatures identified',
      structuralAnalysis: 'Multi-story commercial building',
      confidence: 0.87
    },
    estimatedResponse: '12 minutes',
    requiredEquipment: ['Ladder Truck', 'Pumper Engine', 'Breathing Apparatus']
  },
  {
    id: 'INC-2026-003',
    title: 'Ambulance Unit 04 Route Status',
    description: 'En route to previous incident, real-time GPS tracking and ETA updates',
    location: 'Osmena Blvd → IT Park (via fastest route)',
    coordinates: { lat: 10.3201, lng: 123.8954 },
    timestamp: '2026-03-22T09:18:00Z',
    status: INCIDENT_STATUS.DISPATCHED,
    priority: EMERGENCY_CODES.CODE_3,
    assignedAgency: AGENCY_TYPES.AMBULANCE,
    assignedUnit: 'AMB-04',
    triageLevel: 'Green',
    aiVerified: false,
    routeData: {
      currentLocation: 'Osmena Blvd, near Capitol Site',
      destination: 'IT Park Ave & Gov. Cuenco Ave',
      eta: '6 minutes',
      trafficCondition: 'Moderate',
      alternateRoutes: 2
    },
    estimatedResponse: '6 minutes',
    requiredEquipment: ['Basic Life Support', 'Stretcher', 'Oxygen']
  },
  {
    id: 'INC-2026-004',
    title: 'Flood Level Critical - Barangay Lahug',
    description: 'Edge node SMS: Water level exceeding safe thresholds, evacuation protocols initiated',
    location: 'Barangay Lahug, near Lahug River',
    coordinates: { lat: 10.3421, lng: 123.9156 },
    timestamp: '2026-03-22T08:45:00Z',
    status: INCIDENT_STATUS.ACTIVE,
    priority: EMERGENCY_CODES.CODE_2,
    assignedAgency: AGENCY_TYPES.DRRMO,
    assignedUnit: 'DRRMO-WEST-01',
    triageLevel: 'Yellow',
    aiVerified: true,
    edgeNodeData: {
      sensorData: 'Water level: 2.8m (Critical threshold: 2.5m)',
      weatherData: 'Heavy rainfall continuing, 45mm in last hour',
      confidence: 0.96
    },
    estimatedResponse: '15 minutes',
    requiredEquipment: ['Rescue Boat', 'Life Jackets', 'Emergency Supplies']
  },
  {
    id: 'INC-2026-005',
    title: 'Medical Emergency - Elderly Fall',
    description: 'Senior citizen fall with potential hip fracture, family member voice report processed',
    location: 'Villa Aurora Village, Kasambagan',
    coordinates: { lat: 10.3345, lng: 123.8876 },
    timestamp: '2026-03-22T09:10:00Z',
    status: INCIDENT_STATUS.PENDING,
    priority: EMERGENCY_CODES.CODE_BLUE,
    assignedAgency: AGENCY_TYPES.AMBULANCE,
    assignedUnit: 'AMB-08',
    triageLevel: 'Yellow',
    aiVerified: true,
    edgeNodeData: {
      voiceAnalysis: 'Calm reporter, medical history mentioned',
      locationVerification: 'GPS coordinates confirmed',
      confidence: 0.89
    },
    estimatedResponse: '10 minutes',
    requiredEquipment: ['Spinal Board', 'Pain Management', 'Diagnostic Tools']
  }
];

// Notification/Alert Feed - Edge AI and citizen reports
export const NOTIFICATIONS = [
  {
    id: 'NOTIF-001',
    type: 'edge-ai',
    title: 'Edge Node SMS Received: Flood Level Critical at Main Ave',
    content: 'Automated sensor data indicates water level at 2.8m, exceeding safe threshold. 15 families evacuated from Ground Zero area.',
    timestamp: '2026-03-22T09:25:00Z',
    source: 'Edge Node LAHUG-001',
    priority: 'high',
    status: 'unread',
    metadata: {
      sensorId: 'FLOOD-SENS-LAH-001',
      dataType: 'water-level',
      confidence: 0.96,
      actionRequired: true
    }
  },
  {
    id: 'NOTIF-002',
    type: 'pcr-sync',
    title: 'New Digital PCR Synced from Medic Team Alpha',
    content: 'Patient Care Record uploaded: 24-year-old male, motorcycle accident victim, stable vitals, transported to VSMMC Emergency.',
    timestamp: '2026-03-22T09:20:00Z',
    source: 'Medic Team Alpha - AMB-04',
    priority: 'medium',
    status: 'unread',
    metadata: {
      patientId: 'PAT-2026-0322-001',
      medic: 'RN Maria Santos, EMT-P',
      hospital: 'Vicente Sotto Memorial Medical Center',
      condition: 'stable'
    }
  },
  {
    id: 'NOTIF-003',
    type: 'voice-transcription',
    title: 'Voice-to-Text Summary: Emergency Call Processed',
    content: '"Help, may naaksidente diri sa intersection, daghan mga tawo nga nasamad!" - Translated: "Help, there\'s an accident here at the intersection, many people are injured!" - Location: IT Park Ave, High stress markers detected.',
    timestamp: '2026-03-22T09:18:00Z',
    source: 'Citizen Report via Voice AI',
    priority: 'critical',
    status: 'read',
    metadata: {
      callerId: 'Anonymous',
      language: 'Cebuano/English',
      stressLevel: 'high',
      confidence: 0.92
    }
  },
  {
    id: 'NOTIF-004',
    type: 'system-alert',
    title: 'Edge Node Connectivity Restored',
    content: 'Edge AI Node CAPITOL-003 back online after 15-minute power interruption. All sensor networks functioning normally.',
    timestamp: '2026-03-22T09:12:00Z',
    source: 'System Monitoring',
    priority: 'low',
    status: 'read',
    metadata: {
      nodeId: 'CAPITOL-003',
      downtime: '15 minutes',
      systemStatus: 'operational',
      backupActivated: false
    }
  },
  {
    id: 'NOTIF-005',
    type: 'image-verification',
    title: 'Visual AI Confirmation: Structural Fire Validated',
    content: 'Uploaded citizen photo analyzed - Confirmed active fire at commercial building. Smoke plume height: ~50ft. Structural integrity assessment: Monitoring required.',
    timestamp: '2026-03-22T09:08:00Z',
    source: 'Visual AI Engine',
    priority: 'critical',
    status: 'read',
    metadata: {
      imageId: 'IMG-FIRE-002',
      analysisType: 'fire-detection',
      fireIntensity: 'moderate-high',
      confidence: 0.94
    }
  },
  {
    id: 'NOTIF-006',
    type: 'weather-alert',
    title: 'Meteorological Alert: Heavy Rainfall Warning',
    content: 'Philippine Atmospheric, Geophysical and Astronomical Services Administration (PAGASA): Thunderstorm approaching Metro Cebu. Expected rainfall: 50-80mm in next 2 hours.',
    timestamp: '2026-03-22T08:30:00Z',
    source: 'PAGASA Weather API',
    priority: 'medium',
    status: 'read',
    metadata: {
      weatherType: 'thunderstorm',
      duration: '2-3 hours',
      rainfallExpected: '50-80mm',
      windSpeed: '45-65 km/h'
    }
  }
];

// Patient Care Records Log
export const PCR_LOG = [
  {
    id: 'PCR-2026-001',
    patientId: 'PAT-001',
    incidentId: 'INC-2026-001',
    timestamp: '2026-03-22T09:15:00Z',
    medic: 'RN Maria Santos, EMT-P',
    unit: 'AMB-04',
    chiefComplaint: 'Motor vehicle collision with chest pain',
    vitals: {
      bp: '120/80',
      pulse: '88',
      respiration: '16',
      temperature: '98.6°F',
      oxygenSat: '98%'
    },
    treatment: 'Spinal immobilization, oxygen therapy, IV access established',
    disposition: 'Transported to VSMMC Emergency Department',
    status: 'completed'
  },
  {
    id: 'PCR-2026-002',
    patientId: 'PAT-002',
    incidentId: 'INC-2026-005',
    timestamp: '2026-03-22T09:30:00Z',
    medic: 'EMT John Dela Cruz',
    unit: 'AMB-08',
    chiefComplaint: 'Elderly fall, suspected hip fracture',
    vitals: {
      bp: '140/90',
      pulse: '76',
      respiration: '18',
      temperature: '97.8°F',
      oxygenSat: '95%'
    },
    treatment: 'Pain management, spinal board immobilization',
    disposition: 'En route to Chong Hua Hospital',
    status: 'in-progress'
  }
];

// System/Edge Node Status
export const EDGE_NODES = [
  {
    id: 'LAHUG-001',
    name: 'Lahug Flood Monitoring Station',
    location: 'Barangay Lahug, near Lahug River',
    coordinates: { lat: 10.3421, lng: 123.9156 },
    status: 'online',
    lastUpdate: '2026-03-22T09:25:00Z',
    sensorTypes: ['flood-level', 'weather', 'camera'],
    batteryLevel: 85,
    connectivity: 'strong',
    alerts: 1
  },
  {
    id: 'CAPITOL-003',
    name: 'Capitol Site Traffic Monitor',
    location: 'Capitol Site, Osmena Blvd',
    coordinates: { lat: 10.3201, lng: 123.8954 },
    status: 'online',
    lastUpdate: '2026-03-22T09:23:00Z',
    sensorTypes: ['traffic-camera', 'accident-detection', 'audio'],
    batteryLevel: 92,
    connectivity: 'strong',
    alerts: 0
  },
  {
    id: 'ITPARK-005',
    name: 'IT Park Emergency Hub',
    location: 'IT Park Ave, Lahug',
    coordinates: { lat: 10.3287, lng: 123.9078 },
    status: 'maintenance',
    lastUpdate: '2026-03-22T08:45:00Z',
    sensorTypes: ['multi-camera', 'audio', 'emergency-button'],
    batteryLevel: 15,
    connectivity: 'weak',
    alerts: 2
  },
  {
    id: 'AYALA-002',
    name: 'Ayala Center Security Integration',
    location: 'Ayala Center Cebu',
    coordinates: { lat: 10.3156, lng: 123.8854 },
    status: 'online',
    lastUpdate: '2026-03-22T09:24:00Z',
    sensorTypes: ['fire-detection', 'smoke-alarm', 'emergency-exit'],
    batteryLevel: 78,
    connectivity: 'strong',
    alerts: 1
  }
];

// Real-time statistics for dashboard
export const DASHBOARD_STATS = {
  activeIncidents: ACTIVE_INCIDENTS.filter(incident => incident.status === INCIDENT_STATUS.ACTIVE).length,
  pendingDispatches: ACTIVE_INCIDENTS.filter(incident => incident.status === INCIDENT_STATUS.PENDING).length,
  unreadNotifications: NOTIFICATIONS.filter(notification => notification.status === 'unread').length,
  onlineEdgeNodes: EDGE_NODES.filter(node => node.status === 'online').length,
  totalEdgeNodes: EDGE_NODES.length,
  averageResponseTime: '9.2 minutes',
  systemStatus: 'operational'
};

// Navigation menu items
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'Map',
    path: '/',
    description: 'Live Region View & Command Center'
  },
  {
    id: 'incidents',
    label: 'Active Incidents',
    icon: 'AlertTriangle',
    path: '/incidents',
    description: 'Emergency Response Queue',
    badge: DASHBOARD_STATS.activeIncidents
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: 'Bell',
    path: '/notifications',
    description: 'AI Alerts & Communications',
    badge: DASHBOARD_STATS.unreadNotifications
  },
  {
    id: 'pcr',
    label: 'PCR Log',
    icon: 'FileText',
    path: '/pcr',
    description: 'Patient Care Records'
  },
  {
    id: 'system',
    label: 'Edge Node Status',
    icon: 'Server',
    path: '/system',
    description: 'System & Network Health'
  }
];