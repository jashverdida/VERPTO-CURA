import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  DocumentMagnifyingGlassIcon,
  CalendarIcon,
  FireIcon,
  HeartIcon,
  TruckIcon,
  UserGroupIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
  AdjustmentsHorizontalIcon,
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
    durationMinutes: 75,
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
    durationMinutes: 32,
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
    durationMinutes: 58,
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
    durationMinutes: 22,
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
    durationMinutes: 18,
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
    durationMinutes: 15,
    status: 'Resolved',
    units: 1,
    personnel: 2,
    injuries: 0,
    description: 'Patient stabilized and transported to medical facility.',
    responders: ['MED-002'],
  },
];

const SORT_OPTIONS = [
  { value: 'date', label: 'Most Recent' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'duration', label: 'Longest Duration' },
  { value: 'personnel', label: 'Most Personnel' },
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
  const labels = { fire: 'Fire', medical: 'Medical', accident: 'Accident', rescue: 'Rescue' };
  return labels[type] || 'Unknown';
};

function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-emerald-400 hover:text-emerald-700 shadow-sm transition-all duration-200 min-w-[160px] justify-between"
      >
        <span>{current?.label}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort by</p>
          </div>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                value === opt.value
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <CheckIcon className="w-4 h-4 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPanel({ filters, onChange, onClear, activeCount }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium shadow-sm transition-all duration-200 ${
          activeCount > 0
            ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
            : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700'
        }`}
      >
        <AdjustmentsHorizontalIcon className="w-4 h-4" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-emerald-700 text-xs font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-semibold text-slate-800">Advanced Filters</p>
            </div>
            {activeCount > 0 && (
              <button onClick={onClear} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                Clear all
              </button>
            )}
          </div>

          <div className="p-4 space-y-5">
            {/* Injuries Filter */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Casualties / Injuries</p>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'none', label: 'No Injuries' },
                  { value: 'with', label: 'With Injuries' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onChange({ ...filters, injuries: opt.value })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      filters.injuries === opt.value
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date Range</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500 w-8">From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-700"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500 w-8">To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Min Personnel */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Min. Personnel</p>
                <span className="text-xs font-bold text-emerald-600">{filters.minPersonnel > 0 ? `≥ ${filters.minPersonnel}` : 'Any'}</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={2}
                value={filters.minPersonnel}
                onChange={(e) => onChange({ ...filters, minPersonnel: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0</span>
                <span>15</span>
                <span>30+</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_FILTERS = { injuries: 'all', dateFrom: '', dateTo: '', minPersonnel: 0 };

export default function ReportArchives() {
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [advFilters, setAdvFilters] = useState(DEFAULT_FILTERS);

  const activeFilterCount = [
    advFilters.injuries !== 'all',
    advFilters.dateFrom !== '',
    advFilters.dateTo !== '',
    advFilters.minPersonnel > 0,
  ].filter(Boolean).length;

  const filteredReports = useMemo(() => {
    let results = DUMMY_ARCHIVE_REPORTS;

    if (selectedType) results = results.filter(r => r.type === selectedType);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }

    if (advFilters.injuries === 'none') results = results.filter(r => r.injuries === 0);
    if (advFilters.injuries === 'with') results = results.filter(r => r.injuries > 0);
    if (advFilters.dateFrom) results = results.filter(r => r.date >= advFilters.dateFrom);
    if (advFilters.dateTo) results = results.filter(r => r.date <= advFilters.dateTo);
    if (advFilters.minPersonnel > 0) results = results.filter(r => r.personnel >= advFilters.minPersonnel);

    if (sortBy === 'date') results = [...results].sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortBy === 'title') results = [...results].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'duration') results = [...results].sort((a, b) => b.durationMinutes - a.durationMinutes);
    else if (sortBy === 'personnel') results = [...results].sort((a, b) => b.personnel - a.personnel);

    return results;
  }, [selectedType, searchQuery, sortBy, advFilters]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Fixed Header + Filters */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <DocumentMagnifyingGlassIcon className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-900">Report Archives</h1>
          </div>
          <p className="text-slate-600">Historical emergency incidents and resolved cases</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-md p-5">
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by title, location, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Pills + Sort + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedType === null
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Types
              </button>
              {['fire', 'medical', 'accident', 'rescue'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedType === type
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getTypeLabel(type)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <FilterPanel
                filters={advFilters}
                onChange={setAdvFilters}
                onClear={() => setAdvFilters(DEFAULT_FILTERS)}
                activeCount={activeFilterCount}
              />
              <CustomSelect value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <span>Showing</span>
            <span className="font-semibold text-slate-800">{filteredReports.length}</span>
            <span>of</span>
            <span className="font-semibold text-slate-800">{DUMMY_ARCHIVE_REPORTS.length}</span>
            <span>reports</span>
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                <FunnelIcon className="w-3 h-3" />
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Reports Area */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map(report => {
            const TypeIcon = getTypeIcon(report.type);
            return (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4"
                style={{
                  borderLeftColor: {
                    fire: '#dc2626',
                    medical: '#2563eb',
                    accident: '#f59e0b',
                    rescue: '#9333ea',
                  }[report.type],
                }}
              >
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

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-4 h-4 flex-shrink-0">📍</span>
                    <span>{report.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarIcon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span>{report.date} at {report.time}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4">{report.description}</p>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-slate-900">{report.units}</div>
                    <div className="text-xs text-slate-600">Units</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-slate-900">{report.personnel}</div>
                    <div className="text-xs text-slate-600">Personnel</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-slate-900">{report.injuries}</div>
                    <div className="text-xs text-slate-600">Injuries</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-slate-900">{report.duration}</div>
                    <div className="text-xs text-slate-600">Duration</div>
                  </div>
                </div>

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

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <DocumentMagnifyingGlassIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">No reports found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
