import React, { useState, useMemo } from 'react';
import { ACTIVE_INCIDENTS } from '../constants/dummyData';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const CorporateIncidentLog = () => {
  const [incidents] = useState([
    ...ACTIVE_INCIDENTS,
    // Add some more mock incidents for demonstration
    {
      id: 'INC-2026-010',
      type: 'medical',
      title: 'Cardiac Emergency - Senior Citizen',
      description: 'CPR in progress at Ayala Mall',
      location: 'Ayala Center, Makati City',
      priority: 'high',
      status: 'resolved',
      reportedAt: new Date(Date.now() - 25 * 60 * 1000),
      aiVerified: false,
      assignedUnits: ['AMB-02'],
      resolvedAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: 'INC-2026-009',
      type: 'fire',
      title: 'Structure Fire - Commercial Building',
      description: 'Smoke reported from 3rd floor office',
      location: 'BGC Central Plaza',
      priority: 'high',
      status: 'active',
      reportedAt: new Date(Date.now() - 45 * 60 * 1000),
      aiVerified: true,
      assignedUnits: ['FIRE-05', 'RESCUE-02'],
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'reportedAt', direction: 'desc' });

  const filterOptions = [
    { id: 'all', label: 'All Status', count: incidents.length },
    { id: 'active', label: 'Active', count: incidents.filter(i => i.status === 'active').length },
    { id: 'resolved', label: 'Resolved', count: incidents.filter(i => i.status === 'resolved').length },
    { id: 'pending', label: 'Pending Verification', count: incidents.filter(i => !i.aiVerified && i.status === 'active').length },
  ];

  const priorityOptions = [
    { id: 'all', label: 'All Priorities' },
    { id: 'critical', label: 'Critical' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' },
  ];

  const verificationOptions = [
    { id: 'all', label: 'All' },
    { id: 'verified', label: 'AI Verified' },
    { id: 'pending', label: 'Pending' },
  ];

  // Filtered and sorted incidents
  const filteredIncidents = useMemo(() => {
    let filtered = incidents.filter(incident => {
      // Search filter
      const searchMatch = searchTerm === '' ||
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'pending' ? !incident.aiVerified && incident.status === 'active' : incident.status === statusFilter);

      // Priority filter
      const priorityMatch = priorityFilter === 'all' || incident.priority === priorityFilter;

      // Verification filter
      const verificationMatch = verificationFilter === 'all' ||
        (verificationFilter === 'verified' ? incident.aiVerified : !incident.aiVerified);

      return searchMatch && statusMatch && priorityMatch && verificationMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (sortConfig.key === 'reportedAt' || sortConfig.key === 'resolvedAt') {
        const aTime = new Date(aVal).getTime();
        const bTime = new Date(bVal).getTime();
        return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return filtered;
  }, [incidents, searchTerm, statusFilter, priorityFilter, verificationFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      return `${diffHours}h ${diffMins % 60}m ago`;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return 'status-critical';
      case 'high':
        return 'status-warning';
      case 'medium':
        return 'status-info';
      default:
        return 'status-neutral';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'status-warning';
      case 'resolved':
        return 'status-success';
      default:
        return 'status-neutral';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-slate-900">Incident Log</h1>
            <p className="text-body text-slate-600 mt-1">
              Emergency incident tracking and management system
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="btn-primary-corporate">
              New Incident
            </button>
            <button className="btn-secondary-corporate">
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between space-x-6">

          {/* Search */}
          <div className="flex items-center space-x-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input-corporate pl-10"
              />
            </div>
          </div>

          {/* Filter Tags */}
          <div className="flex items-center space-x-2">

            {/* Status Filter */}
            <div className="flex items-center space-x-1">
              {filterOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setStatusFilter(option.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                    statusFilter === option.id
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                  {option.count !== undefined && (
                    <span className="ml-1 font-bold">{option.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-slate-300"></div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="form-input-corporate text-xs pr-8"
            >
              {priorityOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>

            {/* Verification Filter */}
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="form-input-corporate text-xs pr-8"
            >
              {verificationOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-3">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold">{filteredIncidents.length}</span> of <span className="font-semibold">{incidents.length}</span> incidents
        </p>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="table-corporate">
            <thead className="sticky top-0">
              <tr>
                <th className="w-32">
                  <button
                    onClick={() => handleSort('id')}
                    className="flex items-center space-x-1 hover:text-slate-900"
                  >
                    <span>Incident ID</span>
                    <ArrowsUpDownIcon className="w-3 h-3" />
                  </button>
                </th>
                <th className="min-w-0">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center space-x-1 hover:text-slate-900"
                  >
                    <span>Title & Description</span>
                    <ArrowsUpDownIcon className="w-3 h-3" />
                  </button>
                </th>
                <th className="w-48">
                  <button
                    onClick={() => handleSort('location')}
                    className="flex items-center space-x-1 hover:text-slate-900"
                  >
                    <span>Location</span>
                    <ArrowsUpDownIcon className="w-3 h-3" />
                  </button>
                </th>
                <th className="w-24">Priority</th>
                <th className="w-24">Status</th>
                <th className="w-32">
                  <button
                    onClick={() => handleSort('reportedAt')}
                    className="flex items-center space-x-1 hover:text-slate-900"
                  >
                    <span>Reported</span>
                    <ArrowsUpDownIcon className="w-3 h-3" />
                  </button>
                </th>
                <th className="w-32">Verification</th>
                <th className="w-36">Assigned Units</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className={`${
                  incident.priority === 'critical' ? 'bg-red-50' : ''
                }`}>
                  <td>
                    <div className="font-mono text-slate-900 font-medium">
                      {incident.id}
                    </div>
                  </td>

                  <td>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">
                        {incident.title}
                      </div>
                      <div className="text-sm text-slate-600 truncate">
                        {incident.description}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="flex items-start space-x-1">
                      <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{incident.location}</span>
                    </div>
                  </td>

                  <td>
                    <div className={`status-indicator ${getPriorityBadge(incident.priority)}`}>
                      {incident.priority}
                    </div>
                  </td>

                  <td>
                    <div className={`status-indicator ${getStatusBadge(incident.status)}`}>
                      {incident.status}
                    </div>
                  </td>

                  <td>
                    <div className="text-sm text-slate-700">
                      {formatTimeAgo(incident.reportedAt)}
                    </div>
                  </td>

                  <td>
                    {incident.aiVerified ? (
                      <div className="flex items-center space-x-1">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-700">AI Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-700">Pending</span>
                      </div>
                    )}
                  </td>

                  <td>
                    <div className="space-y-1">
                      {incident.assignedUnits?.map((unit, index) => (
                        <div key={index} className="inline-block mr-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-slate-400 hover:text-slate-600"
                        title="View details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-slate-400 hover:text-slate-600"
                        title="Edit incident"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredIncidents.length === 0 && (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No incidents found</h3>
              <p className="text-sm text-slate-500">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer with pagination */}
      <div className="bg-white border-t border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Total incidents: <span className="font-semibold">{filteredIncidents.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Rows per page: 50</span>
            {/* Add pagination controls here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateIncidentLog;