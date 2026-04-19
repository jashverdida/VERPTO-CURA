import React, { useState } from 'react';
import { ACTIVE_INCIDENTS, EMERGENCY_UNITS } from '../constants/dummyData';
import IncidentCard from '../components/IncidentCard';
import {
  ExclamationTriangleIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const Incidents = () => {
  const [incidents] = useState(ACTIVE_INCIDENTS);
  const [units] = useState(EMERGENCY_UNITS);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIncidents = incidents.filter(incident => {
    const matchesFilter = filter === 'all' || incident.priority === filter || incident.status === filter;
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: incidents.length,
    critical: incidents.filter(i => i.priority === 'critical').length,
    high: incidents.filter(i => i.priority === 'high').length,
    active: incidents.filter(i => i.status === 'active').length,
    pending: incidents.filter(i => i.status === 'pending_verification').length,
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="glass-card p-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">Active Incidents</h1>
            </div>
            <p className="text-slate-600 font-medium">
              Emergency incident management and unit coordination
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12 w-64"
              />
            </div>

            <button className="btn-primary flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>New Incident</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6">
        {/* Filter Sidebar */}
        <div className="w-80 glass-card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FunnelIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold gradient-text text-lg">Filter Incidents</h3>
          </div>

          <div className="space-y-3">
            {[
              { key: 'all', label: 'All Incidents', count: statusCounts.all },
              { key: 'critical', label: 'Critical Priority', count: statusCounts.critical },
              { key: 'high', label: 'High Priority', count: statusCounts.high },
              { key: 'active', label: 'Active Status', count: statusCounts.active },
              { key: 'pending', label: 'Pending Verification', count: statusCounts.pending },
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                  filter === filterOption.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-700 hover:bg-white/50 hover:shadow-md'
                }`}
              >
                <span className="font-medium">{filterOption.label}</span>
                <span className={`text-sm px-3 py-1 rounded-full font-bold ${
                  filter === filterOption.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {filterOption.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <h4 className="text-lg font-bold text-slate-700 mb-4">Quick Stats</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-slate-100/50 to-slate-200/50 rounded-xl">
                <span className="text-slate-600 font-medium">Total Incidents</span>
                <span className="font-bold text-slate-800">{incidents.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100/50 to-green-200/50 rounded-xl">
                <span className="text-slate-600 font-medium">Available Units</span>
                <span className="font-bold text-green-600">{units.filter(u => u.status === 'available').length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-100/50 to-amber-200/50 rounded-xl">
                <span className="text-slate-600 font-medium">En Route</span>
                <span className="font-bold text-amber-600">{units.filter(u => u.status === 'en_route').length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100/50 to-blue-200/50 rounded-xl">
                <span className="text-slate-600 font-medium">Response Rate</span>
                <span className="font-bold text-blue-600">3.2 min avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="flex-1 min-w-0">
          {selectedIncident ? (
            /* Detailed incident view */
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Incident Details</h2>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="btn-secondary"
                >
                  Back to List
                </button>
              </div>
              <IncidentCard
                incident={selectedIncident}
                compact={false}
                onSelect={() => {}}
              />
            </div>
          ) : (
            /* Incidents list view */
            <div className="space-y-6">
              {filteredIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  compact={false}
                  onSelect={() => setSelectedIncident(incident)}
                />
              ))}

              {filteredIncidents.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <ExclamationTriangleIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No incidents found</h3>
                  <p className="text-slate-500">
                    {searchTerm ? 'Try adjusting your search terms or filters.' : 'No incidents match the current filter criteria.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Incidents;