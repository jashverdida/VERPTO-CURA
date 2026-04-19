import React from 'react';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  MapIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

const QuickStats = ({ incidents, units }) => {
  const critical = incidents.filter(i => i.priority === 'critical').length;
  const active = incidents.filter(i => i.status === 'active').length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;
  const availableUnits = units.filter(u => u.status === 'available').length;
  const enRouteUnits = units.filter(u => u.status === 'en_route').length;

  const stats = [
    {
      label: 'Critical Incidents',
      value: critical,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgGradient: 'bg-gradient-to-br from-red-500/10 to-red-600/10',
      borderColor: 'border-red-500/20',
      change: '+2 from yesterday',
      urgent: critical > 0,
      shadowColor: 'shadow-red-500/20'
    },
    {
      label: 'Active Incidents',
      value: active,
      icon: ClockIcon,
      color: 'text-amber-600',
      bgGradient: 'bg-gradient-to-br from-amber-500/10 to-amber-600/10',
      borderColor: 'border-amber-500/20',
      change: 'Monitoring 5 locations',
      shadowColor: 'shadow-amber-500/20'
    },
    {
      label: 'Resolved Today',
      value: resolved + 23, // Mock additional resolved incidents
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgGradient: 'bg-gradient-to-br from-green-500/10 to-green-600/10',
      borderColor: 'border-green-500/20',
      change: '+8 since midnight',
      shadowColor: 'shadow-green-500/20'
    },
    {
      label: 'Available Units',
      value: availableUnits,
      icon: TruckIcon,
      color: 'text-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/20',
      change: `${enRouteUnits} en route`,
      shadowColor: 'shadow-blue-500/20'
    },
    {
      label: 'Edge Nodes',
      value: '4/4',
      icon: SignalIcon,
      color: 'text-green-600',
      bgGradient: 'bg-gradient-to-br from-green-500/10 to-green-600/10',
      borderColor: 'border-green-500/20',
      change: 'All responding',
      shadowColor: 'shadow-green-500/20'
    },
    {
      label: 'Coverage Area',
      value: '98%',
      icon: MapIcon,
      color: 'text-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-500/20',
      change: 'Metro Manila',
      shadowColor: 'shadow-blue-500/20'
    }
  ];

  return (
    <div className="glass-card border-b border-white/20 px-6 py-6 m-6 mb-0">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className={`p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-xl card-hover
                ${stat.bgGradient} ${stat.borderColor} ${stat.shadowColor}
                ${stat.urgent ? 'pulse-critical ring-2 ring-red-500/30' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${stat.bgGradient} border ${stat.borderColor}`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.urgent && (
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                )}
              </div>

              <div className="space-y-2">
                <div className={`text-2xl font-bold ${stat.color} transition-transform duration-200 hover:scale-110`}>
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-700">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Bar */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="text-sm font-semibold text-green-600">System Status: Operational</span>
          </div>
          <div className="flex items-center space-x-3 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
            <span className="text-sm font-semibold text-blue-600">Last AI Update: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="btn-primary">
            Emergency Broadcast
          </button>
          <button className="btn-secondary">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;