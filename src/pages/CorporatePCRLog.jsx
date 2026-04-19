import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const CorporatePCRLog = () => {
  // Mock PCR data
  const [pcrRecords] = useState([
    {
      id: 'PCR-2026-001',
      incidentId: 'INC-2026-001',
      patientName: 'John Doe',
      age: 45,
      gender: 'Male',
      chiefComplaint: 'Chest pain, shortness of breath',
      vitals: {
        bp: '180/95',
        pulse: 110,
        resp: 24,
        temp: '98.6°F',
        spo2: '92%'
      },
      treatments: ['Oxygen therapy', 'IV access established', 'Cardiac monitoring'],
      medications: ['Aspirin 325mg', 'Nitroglycerin 0.4mg SL'],
      disposition: 'Transport to ED',
      hospital: 'Makati Medical Center',
      medic: 'EMT Rodriguez, A.',
      unit: 'AMB-04',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'completed',
      aiAssisted: true,
      severity: 'critical',
      transportTime: '12 minutes'
    },
    {
      id: 'PCR-2026-002',
      incidentId: 'INC-2026-005',
      patientName: 'Maria Santos',
      age: 32,
      gender: 'Female',
      chiefComplaint: 'Motorcycle accident, suspected fracture',
      vitals: {
        bp: '140/85',
        pulse: 95,
        resp: 18,
        temp: '98.2°F',
        spo2: '98%'
      },
      treatments: ['Spinal immobilization', 'Leg splint applied', 'Pain management'],
      medications: ['Morphine 5mg IV'],
      disposition: 'Transport to Trauma Center',
      hospital: 'Philippine General Hospital',
      medic: 'Paramedic Cruz, M.',
      unit: 'AMB-07',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: 'completed',
      aiAssisted: false,
      severity: 'high',
      transportTime: '18 minutes'
    },
    {
      id: 'PCR-2026-003',
      incidentId: 'INC-2026-007',
      patientName: 'Robert Lim',
      age: 67,
      gender: 'Male',
      chiefComplaint: 'Diabetic emergency, altered mental status',
      vitals: {
        bp: '120/70',
        pulse: 88,
        resp: 16,
        temp: '97.8°F',
        spo2: '96%'
      },
      treatments: ['Blood glucose check', 'Dextrose administration', 'Monitoring'],
      medications: ['D50W 25g IV'],
      disposition: 'Patient improved, transport to ED',
      hospital: 'St. Lukes Medical Center',
      medic: 'EMT Rivera, J.',
      unit: 'AMB-02',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      status: 'in_progress',
      aiAssisted: true,
      severity: 'medium',
      transportTime: 'In transit'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [aiFilter, setAiFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  const filterOptions = [
    { id: 'all', label: 'All Records', count: pcrRecords.length },
    { id: 'completed', label: 'Completed', count: pcrRecords.filter(r => r.status === 'completed').length },
    { id: 'in_progress', label: 'In Progress', count: pcrRecords.filter(r => r.status === 'in_progress').length },
    { id: 'ai_assisted', label: 'AI Assisted', count: pcrRecords.filter(r => r.aiAssisted).length },
  ];

  const severityOptions = [
    { id: 'all', label: 'All Severity' },
    { id: 'critical', label: 'Critical' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' },
  ];

  const filteredRecords = useMemo(() => {
    let filtered = pcrRecords.filter(record => {
      const searchMatch = searchTerm === '' ||
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.incidentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.medic.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'ai_assisted' ? record.aiAssisted : record.status === statusFilter);

      const severityMatch = severityFilter === 'all' || record.severity === severityFilter;

      return searchMatch && statusMatch && severityMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (sortConfig.key === 'timestamp') {
        const aTime = new Date(aVal).getTime();
        const bTime = new Date(bVal).getTime();
        return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return filtered;
  }, [pcrRecords, searchTerm, statusFilter, severityFilter, sortConfig]);

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

  const getSeverityBadge = (severity) => {
    switch (severity) {
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

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-slate-900">Patient Care Records</h1>
            <p className="text-body text-slate-600 mt-1">
              Digital patient care documentation and medical transport logs
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="btn-primary-corporate">
              New PCR
            </button>
            <button className="btn-secondary-corporate">
              Export Records
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
                placeholder="Search records, patients, medics..."
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

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="form-input-corporate text-xs pr-8"
            >
              {severityOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-3">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold">{filteredRecords.length}</span> of <span className="font-semibold">{pcrRecords.length}</span> patient care records
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
                    <span>PCR ID</span>
                    <ArrowsUpDownIcon className="w-3 h-3" />
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort('patientName')}
                    className="flex items-center space-x-1 hover:text-slate-900"
                  >
                    <span>Patient Info</span>
                    <ArrowsUpDownIcon className="w-3 h-3" />
                  </button>
                </th>
                <th>Chief Complaint</th>
                <th className="w-32">Vital Signs</th>
                <th>Treatment & Disposition</th>
                <th className="w-24">Severity</th>
                <th className="w-32">
                  <button
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center space-x-1 hover:text-slate-900"
                  >
                    <span>Timestamp</span>
                    <ArrowsUpDownIcon className="w-3 h-3" />
                  </button>
                </th>
                <th className="w-32">Medic & Unit</th>
                <th className="w-24">Status</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className={`${
                  record.severity === 'critical' ? 'bg-red-50' : ''
                }`}>
                  <td>
                    <div className="font-mono text-slate-900 font-medium">
                      {record.id}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {record.incidentId}
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-slate-900">
                          {record.patientName}
                        </div>
                        <div className="text-sm text-slate-600">
                          {record.age}y • {record.gender}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="text-sm text-slate-700">
                      {record.chiefComplaint}
                    </div>
                  </td>

                  <td>
                    <div className="text-xs space-y-1 font-mono">
                      <div>BP: {record.vitals.bp}</div>
                      <div>HR: {record.vitals.pulse}</div>
                      <div>SpO₂: {record.vitals.spo2}</div>
                    </div>
                  </td>

                  <td>
                    <div className="space-y-1.5">
                      <div className="text-xs text-slate-700">
                        <strong>Treatments:</strong>
                        <div className="mt-1 space-y-0.5">
                          {record.treatments.slice(0, 2).map((treatment, idx) => (
                            <div key={idx} className="text-xs">• {treatment}</div>
                          ))}
                          {record.treatments.length > 2 && (
                            <div className="text-xs text-slate-500">
                              +{record.treatments.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs">
                        <strong>Destination:</strong> {record.hospital}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className={`status-indicator ${getSeverityBadge(record.severity)}`}>
                      {record.severity}
                    </div>
                  </td>

                  <td>
                    <div className="text-sm text-slate-700">
                      {formatTimeAgo(record.timestamp)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Transport: {record.transportTime}
                    </div>
                  </td>

                  <td>
                    <div className="text-sm">
                      <div className="font-medium text-slate-900">{record.medic}</div>
                      <div className="text-xs text-slate-600">{record.unit}</div>
                    </div>
                  </td>

                  <td>
                    <div className="space-y-1">
                      <div className={`status-indicator ${
                        record.status === 'completed' ? 'status-success' : 'status-warning'
                      }`}>
                        {record.status.replace('_', ' ')}
                      </div>
                      {record.aiAssisted && (
                        <div className="flex items-center space-x-1">
                          <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs text-emerald-700">AI</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-slate-400 hover:text-slate-600"
                        title="View PCR"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-slate-400 hover:text-slate-600"
                        title="Edit PCR"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No records found</h3>
              <p className="text-sm text-slate-500">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer with summary stats */}
      <div className="bg-white border-t border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-slate-600">
            <span>Total PCRs: <span className="font-semibold">{filteredRecords.length}</span></span>
            <span>AI Assisted: <span className="font-semibold">{filteredRecords.filter(r => r.aiAssisted).length}</span></span>
            <span>Critical Cases: <span className="font-semibold text-red-600">{filteredRecords.filter(r => r.severity === 'critical').length}</span></span>
          </div>
          <div className="text-sm text-slate-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporatePCRLog;