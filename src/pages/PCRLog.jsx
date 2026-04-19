import React, { useState } from 'react';
import { PCR_LOGS, formatTimeAgo, getStatusColor } from '../constants/dummyData';
import {
  ClipboardDocumentListIcon,
  UserIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const PCRLog = () => {
  const [pcrLogs] = useState(PCR_LOGS);
  const [selectedPCR, setSelectedPCR] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = pcrLogs.filter(pcr =>
    pcr.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pcr.medic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pcr.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pcr.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const VitalsDisplay = ({ vitals }) => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="glass-card p-4 border border-blue-500/20">
        <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Blood Pressure</div>
        <div className="font-bold text-slate-800 text-lg">{vitals.bloodPressure}</div>
      </div>
      <div className="glass-card p-4 border border-red-500/20">
        <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Pulse</div>
        <div className="font-bold text-slate-800 text-lg">{vitals.pulse}</div>
      </div>
      <div className="glass-card p-4 border border-green-500/20">
        <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Respiration</div>
        <div className="font-bold text-slate-800 text-lg">{vitals.respiration}</div>
      </div>
      <div className="glass-card p-4 border border-amber-500/20">
        <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Temperature</div>
        <div className="font-bold text-slate-800 text-lg">{vitals.temperature}</div>
      </div>
      <div className="glass-card p-4 border border-purple-500/20">
        <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">O2 Saturation</div>
        <div className="font-bold text-slate-800 text-lg">{vitals.oxygenSaturation}</div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="glass-card p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">Patient Care Records (PCR)</h1>
            </div>
            <p className="text-slate-600 font-medium">
              Digital patient care records from field medics and AI-assisted care
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search PCRs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12 w-64"
              />
            </div>

            <button className="btn-primary">
              Export Records
            </button>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-blue-600">{pcrLogs.length + 45}</div>
            <div className="text-sm font-semibold text-slate-600">Total PCRs Today</div>
          </div>
          <div className="text-center p-5 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-green-600">{pcrLogs.filter(p => p.status === 'completed').length + 38}</div>
            <div className="text-sm font-semibold text-slate-600">Completed</div>
          </div>
          <div className="text-center p-5 bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-amber-600">{pcrLogs.filter(p => p.status === 'active').length}</div>
            <div className="text-sm font-semibold text-slate-600">Active</div>
          </div>
          <div className="text-center p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-purple-600">{pcrLogs.filter(p => p.aiAssisted).length + 28}</div>
            <div className="text-sm font-semibold text-slate-600">AI Assisted</div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {selectedPCR ? (
          /* Detailed PCR View */
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">Patient Care Record Details</h2>
              <button
                onClick={() => setSelectedPCR(null)}
                className="btn-secondary"
              >
                Back to List
              </button>
            </div>

            <div className="glass-card p-8 border border-white/20">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 border border-blue-500/20">
                  <h3 className="font-bold text-slate-700 mb-4">Patient Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold">ID: {selectedPCR.patientId}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="w-5 h-5 text-slate-500" />
                      <span className="text-slate-600">{formatTimeAgo(selectedPCR.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 border border-green-500/20">
                  <h3 className="font-bold text-slate-700 mb-4">Medical Team</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <TruckIcon className="w-5 h-5 text-green-500" />
                      <span className="font-semibold">{selectedPCR.unit}</span>
                    </div>
                    <div className="text-slate-600">
                      Lead: {selectedPCR.medic}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 border border-purple-500/20">
                  <h3 className="font-bold text-slate-700 mb-4">Status</h3>
                  <div className="space-y-3">
                    <div className={`status-badge ${
                      selectedPCR.status === 'completed' ? 'status-resolved' :
                      selectedPCR.status === 'active' ? 'status-active' : 'status-pending'
                    }`}>
                      {selectedPCR.status.toUpperCase()}
                    </div>
                    {selectedPCR.aiAssisted && (
                      <div className="flex items-center space-x-2 text-purple-600">
                        <HeartIcon className="w-5 h-5" />
                        <span className="font-semibold">AI Assisted</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="mb-8">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">Chief Complaint</h3>
                <div className="glass-card p-6 bg-gradient-to-r from-slate-50/50 to-slate-100/50 border border-slate-200/50">
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {selectedPCR.chiefComplaint}
                  </p>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="mb-8">
                <h3 className="font-bold text-slate-700 mb-6 text-lg">Vital Signs</h3>
                <VitalsDisplay vitals={selectedPCR.vitals} />
              </div>

              {/* Treatment */}
              <div className="mb-8">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">Treatment Provided</h3>
                <div className="glass-card p-6 bg-gradient-to-r from-blue-50/50 to-blue-100/50 border border-blue-200/50">
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {selectedPCR.treatment}
                  </p>
                </div>
              </div>

              {/* Disposition */}
              <div className="mb-8">
                <h3 className="font-bold text-slate-700 mb-4 text-lg">Patient Disposition</h3>
                <div className="glass-card p-6 bg-gradient-to-r from-green-50/50 to-green-100/50 border border-green-200/50">
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {selectedPCR.disposition}
                  </p>
                </div>
              </div>

              {/* Related Incident */}
              <div className="pt-6 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    Related Incident: {selectedPCR.incidentId}
                  </span>
                  <button className="btn-primary bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PCR List View */
          <div className="space-y-6">
            {filteredLogs.map((pcr) => (
              <div
                key={pcr.id}
                className="glass-card p-6 cursor-pointer hover:shadow-xl card-hover transition-all duration-300"
                onClick={() => setSelectedPCR(pcr)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Patient {pcr.patientId}</h3>
                      <p className="text-slate-600 font-medium">{pcr.chiefComplaint}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`status-badge ${
                      pcr.status === 'completed' ? 'status-resolved' :
                      pcr.status === 'active' ? 'status-active' : 'status-pending'
                    }`}>
                      {pcr.status.toUpperCase()}
                    </div>
                    <p className="text-sm text-slate-500 mt-2 font-medium">{formatTimeAgo(pcr.timestamp)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-r from-slate-100/50 to-slate-200/50 rounded-xl border border-slate-200/50">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Medic</div>
                    <div className="font-bold text-slate-700">{pcr.medic}</div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-100/50 to-blue-200/50 rounded-xl border border-blue-200/50">
                    <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Unit</div>
                    <div className="font-bold text-blue-700">{pcr.unit}</div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-red-100/50 to-red-200/50 rounded-xl border border-red-200/50">
                    <div className="text-xs text-red-600 font-semibold uppercase tracking-wider mb-1">Blood Pressure</div>
                    <div className="font-bold text-red-700">{pcr.vitals.bloodPressure}</div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-100/50 to-green-200/50 rounded-xl border border-green-200/50">
                    <div className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">Disposition</div>
                    <div className="font-bold text-green-700">
                      {pcr.disposition.split(' ').slice(0, 3).join(' ')}...
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div className="flex items-center space-x-6">
                    {pcr.aiAssisted && (
                      <div className="flex items-center space-x-2 text-purple-600">
                        <HeartIcon className="w-5 h-5" />
                        <span className="font-semibold">AI Assisted</span>
                      </div>
                    )}
                    <span className="text-slate-600 font-medium">
                      Incident: {pcr.incidentId}
                    </span>
                  </div>

                  <button className="btn-primary px-4 py-2 text-sm">
                    View Full Record →
                  </button>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="glass-card p-12 text-center">
                <ClipboardDocumentListIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No PCRs found</h3>
                <p className="text-slate-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No patient care records available.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PCRLog;