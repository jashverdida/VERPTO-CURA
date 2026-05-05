import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapContainer from '../components/MapContainer';
import {
  FireIcon,
  HeartIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ServerIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);

  const emergencyData = {
    fire:      { active: 2, total: 5,  critical: 1, unitsDeployed: 8,  avgResponseTime: '4.2 min' },
    medical:   { active: 5, total: 12, critical: 2, unitsDeployed: 6,  avgResponseTime: '6.8 min' },
    accidents: { active: 3, total: 8,  critical: 1, unitsDeployed: 5,  avgResponseTime: '8.5 min' },
    rescue:    { active: 3, total: 6,  critical: 2, unitsDeployed: 11, avgResponseTime: '18.5 min' },
  };

  const systemStats = {
    totalIncidents:    Object.values(emergencyData).reduce((sum, c) => sum + c.active, 0),
    totalCritical:     Object.values(emergencyData).reduce((sum, c) => sum + c.critical, 0),
    totalUnitsDeployed: Object.values(emergencyData).reduce((sum, c) => sum + c.unitsDeployed, 0),
    systemUptime:      '99.9%',
    edgeNodesOnline:   4,
    totalEdgeNodes:    4,
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = (e) => setScrollPosition(e.target.scrollTop);
    const container = document.querySelector('.dashboard-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const emergencyCategories = [
    {
      id: 'fire',
      name: 'Fire Incidents',
      icon: FireIcon,
      path: '/fire',
      bgGradient: 'bg-gradient-to-br from-red-500 to-red-600',
      textColor: 'text-red-600',
      accentColor: '#EF4444',
      hoverBg: 'hover:bg-red-50/50',
      data: emergencyData.fire,
    },
    {
      id: 'medical',
      name: 'Medical Emergencies',
      icon: HeartIcon,
      path: '/medical',
      bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      accentColor: '#3B82F6',
      hoverBg: 'hover:bg-blue-50/50',
      data: emergencyData.medical,
    },
    {
      id: 'accidents',
      name: 'Road Accidents',
      icon: TruckIcon,
      path: '/accidents',
      bgGradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
      accentColor: '#F59E0B',
      hoverBg: 'hover:bg-amber-50/50',
      data: emergencyData.accidents,
    },
    {
      id: 'rescue',
      name: 'Rescue Operations',
      icon: MagnifyingGlassIcon,
      path: '/rescue',
      bgGradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      accentColor: '#A855F7',
      hoverBg: 'hover:bg-purple-50/50',
      data: emergencyData.rescue,
    },
  ];

  const kpiCards = [
    {
      label: 'Active Incidents',
      value: systemStats.totalIncidents,
      sub: 'Across all agencies',
      icon: ExclamationTriangleIcon,
      accentColor: '#EF4444',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      animDelay: '0.05s',
    },
    {
      label: 'Critical Cases',
      value: systemStats.totalCritical,
      sub: 'Immediate attention',
      icon: ExclamationTriangleIcon,
      accentColor: '#F97316',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      animDelay: '0.1s',
    },
    {
      label: 'Units Deployed',
      value: systemStats.totalUnitsDeployed,
      sub: 'Currently responding',
      icon: TruckIcon,
      accentColor: '#3B82F6',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      animDelay: '0.15s',
    },
    {
      label: 'System Uptime',
      value: systemStats.systemUptime,
      sub: 'All systems operational',
      icon: CheckCircleIcon,
      accentColor: '#10B981',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      animDelay: '0.2s',
    },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">

      {/* Hero — Shrinks with scroll */}
      <div
        className="relative bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 shadow-2xl flex-shrink-0 transition-all duration-100 border-b border-emerald-700/50 overflow-hidden"
        style={{
          padding: `${Math.max(12, 48 - scrollPosition * 0.2)}px ${Math.max(8, 32 - scrollPosition * 0.1)}px`,
          minHeight: `${Math.max(70, 200 - scrollPosition * 0.5)}px`,
        }}
      >
        {/* Animated background orbs */}
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[80px] animate-blob pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Left: branding */}
          <div className="flex-1 flex items-center gap-4" style={{ opacity: Math.max(0.7, 1 - scrollPosition * 0.01) }}>
            {scrollPosition > 50 && (
              <div className="w-1 h-12 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full transition-all duration-200" />
            )}
            <div className="flex items-center space-x-4">
              <div
                className="transition-all duration-100 flex-shrink-0"
                style={{
                  width: `${Math.max(32, 112 - scrollPosition * 0.35)}px`,
                  height: `${Math.max(32, 112 - scrollPosition * 0.35)}px`,
                }}
              >
                <img src="/cura-logo.png" alt="CURA Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1
                  className="font-black text-white hero-title tracking-tight transition-all duration-100 leading-tight"
                  style={{ fontSize: `${Math.max(24, 112 - scrollPosition * 0.35)}px` }}
                >
                  CURA
                </h1>
                <p
                  className="text-emerald-300 hero-subtitle font-light transition-all duration-100"
                  style={{
                    fontSize: `${Math.max(11, 36 - scrollPosition * 0.18)}px`,
                    marginTop: scrollPosition > 100 ? '2px' : '12px',
                    opacity: Math.max(0.4, 1 - scrollPosition * 0.01),
                    lineHeight: '1.1',
                  }}
                >
                  Emergency Command & Response Authority
                </p>
                <p
                  className="text-emerald-200 opacity-75 leading-relaxed transition-all duration-100"
                  style={{
                    fontSize: scrollPosition > 80 ? '0px' : '16px',
                    marginTop: scrollPosition > 80 ? '0' : '8px',
                    opacity: Math.max(0, 1 - scrollPosition * 0.008),
                    maxWidth: '512px',
                    display: scrollPosition > 80 ? 'none' : 'block',
                  }}
                >
                  Real-time multi-agency coordination platform with edge AI intelligence for rapid emergency response
                </p>
              </div>
            </div>
          </div>

          {/* Right: AI hexagon badge */}
          <div
            className="flex items-center justify-end pr-4 transition-all duration-100 flex-shrink-0"
            style={{ opacity: Math.max(0.3, 1 - scrollPosition * 0.008) }}
          >
            <div
              className="relative hexagon-hero glow-border"
              style={{
                width: `${Math.max(60, 256 - scrollPosition * 0.6)}px`,
                height: `${Math.max(60, 256 - scrollPosition * 0.6)}px`,
                transition: 'all 100ms linear',
              }}
            >
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-3xl blur-xl animate-pulse" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] rounded-3xl" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
              <div className="absolute inset-0 bg-emerald-400/20 rounded-3xl animate-pulse" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
              <div className="absolute -inset-1 rounded-3xl border border-emerald-300/30 animate-[spin_10s_linear_infinite]" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
              <div className="absolute -inset-2 rounded-3xl border-2 border-emerald-400/20 border-dashed animate-[spin_15s_linear_infinite_reverse]" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl z-10" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}>
                <div className="text-white text-center drop-shadow-md">
                  <div className="font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-emerald-100" style={{ fontSize: `${Math.max(12, 48 - scrollPosition * 0.2)}px`, lineHeight: '1' }}>AI</div>
                  <div className="font-semibold tracking-widest text-emerald-50" style={{ fontSize: `${Math.max(6, 14 - scrollPosition * 0.08)}px`, lineHeight: '1' }}>POWERED</div>
                  <div className="mt-1 opacity-90 text-emerald-200 uppercase tracking-widest font-bold" style={{ fontSize: `${Math.max(4, 10 - scrollPosition * 0.06)}px`, lineHeight: '1' }}>Edge AI</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-3xl pointer-events-none" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-8 dashboard-scroll-container">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6 mb-6">
          {kpiCards.map(({ label, value, sub, icon: Icon, accentColor, iconBg, iconColor, animDelay }) => (
            <div
              key={label}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm dashboard-slide-in hover:shadow-md transition-shadow duration-200"
              style={{ animationDelay: animDelay, borderLeftWidth: '4px', borderLeftColor: accentColor }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className="text-4xl font-black text-slate-800 mt-2 leading-none">{value}</p>
                  <p className="text-sm text-slate-400 mt-2">{sub}</p>
                </div>
                <div className={`p-2.5 ${iconBg} rounded-xl flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Response Centers */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm -mx-8 px-8 py-6 mb-6">
          <div className="mb-5 dashboard-slide-in" style={{ animationDelay: '0.25s' }}>
            <h2 className="text-xl font-bold text-slate-800">Response Centers</h2>
            <p className="text-sm text-slate-500 mt-0.5">Access specialized command centers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {emergencyCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={category.path}
                  className={`group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 card-scale-up ${category.hoverBg}`}
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  {/* Category accent bar */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: category.accentColor }} />

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2.5 ${category.bgGradient} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      {category.data.critical > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse" />
                          {category.data.critical} Critical
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mb-3">{category.name}</h3>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <div className={`text-2xl font-black ${category.textColor}`}>{category.data.active}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">Active</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <div className="text-2xl font-black text-slate-700">{category.data.unitsDeployed}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">Units</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                      <div className="flex items-center space-x-1 text-slate-500">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>Avg: {category.data.avgResponseTime}</span>
                      </div>
                      <span className={`font-semibold ${category.textColor} group-hover:translate-x-0.5 transition-transform duration-200`}>
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Map + System Status */}
        <div className="flex gap-4 min-h-0 overflow-hidden" style={{ height: '500px' }}>

          {/* Map */}
          <div className="flex-1 min-w-0 dashboard-slide-in" style={{ animationDelay: '0.45s' }}>
            <MapContainer />
          </div>

          {/* System Status Panel */}
          <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col dashboard-slide-in" style={{ animationDelay: '0.5s' }}>
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <ServerIcon className="w-5 h-5 text-slate-500" />
                <div>
                  <h2 className="text-base font-bold text-slate-800">System Status</h2>
                  <p className="text-xs text-slate-400">Infrastructure monitoring</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-5 space-y-4 overflow-y-auto">

              {/* Response Performance */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Response Performance</h3>
                <div className="space-y-2.5">
                  {emergencyCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: category.accentColor }} />
                        <span className="text-slate-600 text-xs">{category.name}</span>
                      </div>
                      <span className="font-semibold text-slate-800 text-xs tabular-nums">{category.data.avgResponseTime}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-sm font-semibold py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-200 text-left">
                    Emergency Broadcast
                  </button>
                  <button className="w-full text-sm font-medium py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors duration-200 text-left">
                    Generate Report
                  </button>
                  <Link
                    to="/system"
                    className="block w-full text-sm font-medium py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors duration-200"
                  >
                    System Diagnostics
                  </Link>
                </div>
              </div>

              {/* Network Health */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Network Health</h3>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700">Live</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-700">Edge Nodes</span>
                    <span className="font-bold text-emerald-800">{systemStats.edgeNodesOnline}/{systemStats.totalEdgeNodes} Online</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-700">Uptime</span>
                    <span className="font-bold text-emerald-800">{systemStats.systemUptime}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-700">Last Update</span>
                    <span className="font-bold text-emerald-800">{currentTime.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Command Center Online</span>
                </div>
                <span className="font-semibold text-slate-700">{systemStats.totalUnitsDeployed} units deployed</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
