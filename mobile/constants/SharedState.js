const _defaultReports = [
  {
    id: 'fire_seed_1',
    lat: 14.6035,
    lng: 120.9885,
    address: '321 Burgos St, Barangay 123',
    description: 'Residential building fire, 2nd floor fully engulfed',
    aiAnalysis: 'Structural fire detected. Active flames on 2nd floor with high spread probability. Recommend immediate response — 2 firetrucks + paramedic standby.',
    reportedAt: '3 min ago',
    timestamp: Date.now() - 180000,
    status: 'ongoing',
  },
  {
    id: 'fire_seed_2',
    lat: 14.5975,
    lng: 120.9810,
    address: '88 Mabini Ave, Barangay 123',
    description: 'Electrical fire in ground floor commercial shop',
    aiAnalysis: 'Contained electrical fire, single-room spread. Low propagation risk to adjacent units. Situation stabilizing with active suppression efforts.',
    reportedAt: '18 min ago',
    timestamp: Date.now() - 1080000,
    status: 'under_control',
  },
  {
    id: 'fire_seed_3',
    lat: 14.5945,
    lng: 120.9945,
    address: '14 Rizal Blvd, Barangay 123',
    description: 'Abandoned vehicle fire near residential compound',
    aiAnalysis: 'Vehicle fire fully extinguished. Thermal signature dissipating. Minor structural damage to nearby perimeter fence. Scene is safe for inspection.',
    reportedAt: '42 min ago',
    timestamp: Date.now() - 2520000,
    status: 'fire_out',
  },
];

let _reports = [..._defaultReports];
let _listeners = [];

export function getFireReports() {
  return _reports;
}

export function addFireReport(report) {
  const newReport = {
    ...report,
    id: 'fire_' + Date.now(),
    status: 'ongoing',
    reportedAt: 'Just now',
    timestamp: Date.now(),
  };
  _reports = [newReport, ..._reports];
  _listeners.forEach(fn => fn(_reports));
}

export function subscribeFireReports(listener) {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter(l => l !== listener);
  };
}
