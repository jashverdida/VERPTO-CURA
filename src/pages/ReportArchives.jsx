import React, { useState, useMemo } from 'react';
import {
  DocumentMagnifyingGlassIcon,
  CalendarIcon,
  FireIcon,
  HeartIcon,
  TruckIcon,
  UserGroupIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const DUMMY_ARCHIVE_REPORTS = [
  {
    id: 'AR-2026-0847',
    title: 'Structure Fire - 5-Story Commercial',
    type: 'fire',
    location: '456 Elm Street, District 3',
    date: '2026-05-07',
    time: '14:32',
    duration: '1h 15m',
    status: 'Resolved',
    units: 6,
    personnel: 24,
    injuries: 0,
    description: 'Multi-story commercial building fire with partial roof collapse.',
    responders: ['FR-001', 'FR-002', 'FR-003', 'MED-005'],
  },
  {
    id: 'AR-2026-0846',
    title: 'Cardiac Arrest - Commercial Building',
    type: 'medical',
    location: 'Ortigas Center, Metro Manila',
    date: '2026-05-07',
    time: '14:28',
    duration: '32m',
    status: 'Resolved',
    units: 2,
    personnel: 4,
    injuries: 1,
    description: 'Heart attack victim revived using AED. Patient transported to nearby hospital.',
    responders: ['MED-005', 'MED-006'],
  },
  {
    id: 'AR-2026-0845',
    title: 'Multi-Vehicle Collision - EDSA',
    type: 'accident',
    location: 'EDSA, Quezon City',
    date: '2026-05-07',
    time: '14:15',
    duration: '58m',
    status: 'Resolved',
    units: 4,
    personnel: 8,
    injuries: 3,
    description: 'Five-car pileup on EDSA northbound. Traffic diverted. All victims transported.',
    responders: ['RES-004', 'MED-003', 'MED-002'],
  },
  {
    id: 'AR-2026-0844',
    title: 'Person Trapped in Elevator',
    type: 'rescue',
    location: 'BGC Tower 2, Fort Bonifacio',
    date: '2026-05-07',
    time: '14:10',
    duration: '22m',
    status: 'Resolved',
    units: 2,
    personnel: 6,
    injuries: 0,
    description: 'Individual safely rescued from elevator. No injuries reported.',
    responders: ['RES-001', 'RES-002'],
  },
  {
    id: 'AR-2026-0843',
    title: 'Electrical Fire - Residential Unit',
    type: 'fire',
    location: 'Quezon City North',
    date: '2026-05-06',
    time: '13:45',
    duration: '18m',
    status: 'Resolved',
    units: 1,
    personnel: 4,
    injuries: 0,
    description: 'Small electrical fire in residential unit. Contained and extinguished.',
    responders: ['FR-004'],
  },
  {
    id: 'AR-2026-0842',
    title: 'Diabetic Emergency Response',
    type: 'medical',
    location: 'Pasig City',
    date: '2026-05-06',
    time: '13:20',
    duration: '15m',
    status: 'Resolved',
    units: 1,
    personnel: 2,
    injuries: 0,
    description: 'Patient stabilized and transported to medical facility.',
    responders: ['MED-002'],
  },
];

const getTypeIcon = (type) => {
  switch (type) {
    case 'fire': return FireIcon;
    case 'medical': return HeartIcon;
    case 'accident': return TruckIcon;
    case 'rescue': return UserGroupIcon;
    default: return DocumentMagnifyingGlassIcon;
  }
};

const getTypeBadgeColor = (type) => {
  switch (type) {
    case 'fire': return 'bg-red-100 text-red-800';
    case 'medical': return 'bg-blue-100 text-blue-800';
    case 'accident': return 'bg-amber-100 text-amber-800';
    case 'rescue': return 'bg-purple-100 text-purple-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};

const getTypeLabel = (type) => {
  const labels = {
    fire: 'Fire',
    medical: 'Medical',
    accident: 'Accident',
    rescue: 'Rescue',
  };
  return labels[type] || 'Unknown';
};

export default function ReportArchives() {
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const filteredReports = useMemo(() => {
    let results = DUMMY_ARCHIVE_REPORTS;

    if (selectedType) {
      results = results.filter(r => r.type === selectedType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'date') {
      results = [...results].sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'title') {
      results = [...results].sort((a, b) => a.title.localeCompare(b.title));
    }

    return results;
  }, [selectedType, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <DocumentMagnifyingGlassIcon className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-slate-900">Report Archives</h1>
        </div>
        <p className="text-slate-600">Historical emergency incidents and resolved cases</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Search Bar */}
        <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, location, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedType === null
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Types
            </button>
            {['fire', 'medical', 'accident', 'rescue'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedType === type
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {getTypeLabel(type)}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <FunnelIcon className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-100 text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="date">Most Recent</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{filteredReports.length}</span> of{' '}
          <span className="font-semibold text-slate-900">{DUMMY_ARCHIVE_REPORTS.length}</span> reports
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map(report => {
          const TypeIcon = getTypeIcon(report.type);
          return (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4"
              style={{
                borderLeftColor: {
                  fire: '#dc2626',
                  medical: '#2563eb',
                  accident: '#f59e0b',
                  rescue: '#9333ea',
                }[report.type],
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getTypeBadgeColor(report.type)}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{report.title}</h3>
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${getTypeBadgeColor(report.type)} mt-1`}>
                      {getTypeLabel(report.type)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500">{report.id}</div>
                  <div className="text-sm font-semibold text-emerald-600">Resolved</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-4 h-4 flex-shrink-0">📍</div>
                  <span>{report.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarIcon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  <span>{report.date} at {report.time}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-4">{report.description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-50 p-2 rounded text-center">
                  <div className="text-lg font-bold text-slate-900">{report.units}</div>
                  <div className="text-xs text-slate-600">Units</div>
                </div>
                <div className="bg-slate-50 p-2 rounded text-center">
                  <div className="text-lg font-bold text-slate-900">{report.personnel}</div>
                  <div className="text-xs text-slate-600">Personnel</div>
                </div>
                <div className="bg-slate-50 p-2 rounded text-center">
                  <div className="text-lg font-bold text-slate-900">{report.injuries}</div>
                  <div className="text-xs text-slate-600">Injuries</div>
                </div>
                <div className="bg-slate-50 p-2 rounded text-center">
                  <div className="text-lg font-bold text-slate-900">{report.duration}</div>
                  <div className="text-xs text-slate-600">Duration</div>
                </div>
              </div>

              {/* Responders */}
              <div className="flex flex-wrap gap-2">
                {report.responders.map(responder => (
                  <span
                    key={responder}
                    className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200"
                  >
                    {responder}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <DocumentMagnifyingGlassIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600">No reports found</h3>
          <p className="text-slate-500">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
}
