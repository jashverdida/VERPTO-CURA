import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  CalendarDaysIcon,
  SparklesIcon,
  CheckCircleIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const IncidentArchive = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('all'); // all, 7d, 30d, 90d, custom
  const [hazardTypeFilter, setHazardTypeFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Available hazard types from data
  const [hazardTypes, setHazardTypes] = useState([]);

  // Fetch resolved/closed incidents from Supabase
  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .in('status', ['resolved', 'closed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching incidents:', error);
        return;
      }

      if (data) {
        setIncidents(data);
        // Extract unique hazard types for filter dropdown
        const types = [...new Set(data.map(i => i.ai_hazard_type).filter(Boolean))];
        setHazardTypes(types);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();

    // Real-time subscription
    const channel = supabase
      .channel('archive-incidents')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'incidents', filter: 'status=in.(resolved,closed)' },
        () => fetchIncidents()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchIncidents]);

  // Update current time every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Apply filters
  const getFilteredIncidents = () => {
    let filtered = [...incidents];

    // Search filter (by ID or address)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        i.id.toLowerCase().includes(searchLower) ||
        (i.address && i.address.toLowerCase().includes(searchLower))
      );
    }

    // Hazard type filter
    if (hazardTypeFilter !== 'all') {
      filtered = filtered.filter(i => i.ai_hazard_type === hazardTypeFilter);
    }

    // Date range filter
    const now = new Date();
    if (dateRangeFilter !== 'all') {
      const cutoffDate = new Date();
      switch (dateRangeFilter) {
        case '7d':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        default:
          break;
      }
      filtered = filtered.filter(i => new Date(i.created_at) >= cutoffDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      if (sortColumn === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortColumn === 'ai_confidence') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredIncidents = getFilteredIncidents();

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getHazardTypeColor = (hazardType) => {
    const colors = {
      'FIRE': 'bg-red-100 text-red-800 border-red-300',
      'MEDICAL': 'bg-blue-100 text-blue-800 border-blue-300',
      'VEHICLE': 'bg-amber-100 text-amber-800 border-amber-300',
      'SEARCH_RESCUE': 'bg-purple-100 text-purple-800 border-purple-300',
      'HAZMAT': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'STRUCTURAL': 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[hazardType] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-amber-100 text-amber-800 border-amber-300',
      low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
    return colors[severity?.toLowerCase()] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const SortableHeader = ({ column, label }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center space-x-1 hover:text-emerald-600 transition-colors"
    >
      <span>{label}</span>
      <ArrowsUpDownIcon className={`w-4 h-4 ${sortColumn === column ? 'text-emerald-600' : 'text-slate-400'}`} />
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden">

      {/* ====================== UNIFIED HEADER - Emerald themed for Archive ====================== */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">

          {/* Left: Branding + Page Title */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-emerald-200 text-sm font-medium tracking-wide">CURA Command Center</div>
              <h1 className="text-2xl font-bold text-white">Incident Archive & History</h1>
            </div>
          </div>

          {/* Right: Status + DateTime + Stats */}
          <div className="flex items-center space-x-4">

            {/* System Online */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">Archive Active</span>
              <span className="text-xs text-emerald-200">{filteredIncidents.length} records</span>
            </div>

            {/* DateTime */}
            <div className="text-right bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="text-sm font-semibold text-white">{currentTime.toLocaleDateString()}</div>
              <div className="text-xs text-emerald-200">{currentTime.toLocaleTimeString()}</div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
              <div className="text-center border-r border-white/20 pr-3">
                <div className="text-xl font-bold text-white">{incidents.length}</div>
                <div className="text-xs text-emerald-200">Total Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-300">{filteredIncidents.length}</div>
                <div className="text-xs text-emerald-200">Filtered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================== CONTENT SECTION ====================== */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* FILTER BAR */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-end gap-4 flex-wrap">

            {/* Search Input */}
            <div className="flex-1 min-w-xs">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by incident ID or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Date Range
              </label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            {/* Hazard Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Hazard Type
              </label>
              <select
                value={hazardTypeFilter}
                onChange={(e) => setHazardTypeFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
              >
                <option value="all">All Types</option>
                {hazardTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchIncidents()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-emerald-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Decrypting secure archive logs...
              </h3>
              <p className="text-sm text-slate-500">
                Loading resolved incident records
              </p>
            </div>
          </div>
        )}

        {/* TABLE SECTION */}
        {!loading && (
          <div className="flex-1 overflow-auto">
            {filteredIncidents.length === 0 ? (
              <div className="flex items-center justify-center h-full bg-slate-50">
                <div className="text-center">
                  <CheckCircleIcon className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    No incidents found
                  </h3>
                  <p className="text-sm text-slate-500">
                    Try adjusting your search filters
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-6 py-4 space-y-2">
                {/* TABLE HEADER */}
                <div className="bg-white rounded-t-lg border border-slate-200 px-6 py-3 flex items-center sticky top-0 z-10 shadow-sm">
                  <div className="flex-1 min-w-0 flex items-center space-x-12">
                    <div className="w-32">
                      <SortableHeader column="id" label="Incident ID" />
                    </div>
                    <div className="w-40">
                      <SortableHeader column="created_at" label="Date & Time" />
                    </div>
                    <div className="w-32">
                      <SortableHeader column="ai_hazard_type" label="Hazard Type" />
                    </div>
                    <div className="w-24">
                      <SortableHeader column="severity" label="Severity" />
                    </div>
                    <div className="flex-1 min-w-64">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Location
                      </span>
                    </div>
                    <div className="w-28">
                      <SortableHeader column="ai_confidence" label="AI Confidence" />
                    </div>
                    <div className="w-32 text-center">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Action
                      </span>
                    </div>
                  </div>
                </div>

                {/* TABLE ROWS */}
                <div className="space-y-2">
                  {filteredIncidents.map((incident, idx) => (
                    <div
                      key={incident.id}
                      className="bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-emerald-300 transition-all duration-200 px-6 py-4"
                    >
                      <div className="flex items-center space-x-12">
                        
                        {/* Incident ID (first 8 chars) */}
                        <div className="w-32">
                          <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded border border-slate-300 text-slate-700">
                            {incident.id.substring(0, 8)}
                          </code>
                        </div>

                        {/* Date & Time */}
                        <div className="w-40 text-sm text-slate-700 flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span>{formatDate(incident.created_at)}</span>
                        </div>

                        {/* Hazard Type */}
                        <div className="w-32">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getHazardTypeColor(incident.ai_hazard_type)}`}>
                            {incident.ai_hazard_type || '—'}
                          </span>
                        </div>

                        {/* Severity */}
                        <div className="w-24">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(incident.severity)}`}>
                            {incident.severity ? incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1) : '—'}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex-1 min-w-64 text-sm text-slate-600 flex items-center space-x-2 truncate">
                          <MapPinIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate" title={incident.address || 'Unknown'}>
                            {incident.address || 'Unknown location'}
                          </span>
                        </div>

                        {/* AI Confidence */}
                        <div className="w-28">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all"
                                style={{ width: `${incident.ai_confidence || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                              {incident.ai_confidence || 0}%
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="w-32 flex justify-center">
                          <button
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                            onClick={() => {
                              // Navigate to incident detail page or open modal
                              console.log('View full report for:', incident.id);
                            }}
                          >
                            View Report
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentArchive;
