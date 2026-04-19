import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  PlusIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const StationManagement = () => {
  const [stations, setStations] = useState([
    {
      id: 1,
      name: 'Central Fire Station',
      type: 'Fire',
      location: '123 Main St, Metro Center',
      contact: '(555) 012-3456',
      admin: 'Chief John Doe',
      status: 'Active'
    },
    {
      id: 2,
      name: 'City General Hospital EMS',
      type: 'Medical',
      location: '456 Health Blvd, Westside',
      contact: '(555) 987-6543',
      admin: 'Dr. Jane Smith',
      status: 'Active'
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Fire',
    location: '',
    contact: '',
    admin: ''
  });

  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) return;

    const newStation = {
      id: stations.length + 1,
      ...formData,
      status: 'Active'
    };

    setStations([...stations, newStation]);
    setFormData({
      name: '',
      type: 'Fire',
      location: '',
      contact: '',
      admin: ''
    });
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'Fire': return 'bg-red-100 text-red-700';
      case 'Medical': return 'bg-blue-100 text-blue-700';
      case 'Police': return 'bg-indigo-100 text-indigo-700';
      case 'Rescue': return 'bg-purple-100 text-purple-700';
      default: return 'bg-emerald-100 text-emerald-700';
    }
  };

  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-slate-50 overflow-y-auto w-full p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BuildingOfficeIcon className="w-8 h-8 text-emerald-600" />
              Station Management
            </h1>
            <p className="text-slate-500 mt-1">Create and manage emergency response station accounts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create Station Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50">       
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <PlusIcon className="w-5 h-5 text-emerald-500" />
                  Register New Station
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Station Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. North District Firehouse"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-900 transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Station Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-900 transition-colors"
                    >
                      <option value="Fire">Fire & Rescue</option>
                      <option value="Medical">Medical / EMS</option>
                      <option value="Police">Police Department</option>
                      <option value="Rescue">Special Rescue</option>
                      <option value="General">Command / General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location / Address *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Full physical address"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-900 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder="e.g. (555) 123-4567"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-900 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Administrator / Head</label>
                    <input
                      type="text"
                      name="admin"
                      value={formData.admin}
                      onChange={handleChange}
                      placeholder="Name of the person in charge"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-900 transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 text-sm shadow-sm"
                    >
                      Create Station Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Station List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                  <BuildingOfficeIcon className="w-5 h-5 text-emerald-500" />
                  Active Stations Directory
                </h2>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm text-slate-900"
                      placeholder="Search Stations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="text-sm text-slate-500 font-medium whitespace-nowrap hidden lg:block">
                    {filteredStations.length} Total Registered
                  </div>
                </div>
              </div>
              
              <div className="p-0 overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-medium border-b border-slate-200 whitespace-nowrap">Station Info</th>
                      <th className="p-4 font-medium border-b border-slate-200 whitespace-nowrap">Contact / Admin</th>
                      <th className="p-4 font-medium border-b border-slate-200 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStations.map((station) => (
                      <tr key={station.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                        <td className="p-4">
                          <div className="font-semibold text-slate-800 text-sm mb-1">{station.name}</div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={"" + "text-xs px-2.5 py-0.5 rounded-full font-medium " + getTypeStyle(station.type)}>
                              {station.type}
                            </span>
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-1.5 group-hover:text-slate-700 transition-colors">
                            <MapPinIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            {station.location}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="text-sm text-slate-700 flex items-center gap-1.5 mb-1.5 font-medium">
                            <UserIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            {station.admin || 'Unassigned'}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-1.5 group-hover:text-slate-700 transition-colors">
                            <PhoneIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            {station.contact || 'No contact'}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {station.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredStations.length === 0 && (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-slate-500 text-sm">
                          No stations found. Create one using the form.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StationManagement;
