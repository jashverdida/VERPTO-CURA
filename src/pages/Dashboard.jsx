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
  MapIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);

  // Mock aggregated data from all emergency types
  const emergencyData = {
    fire: {
      active: 2,
      total: 5,
      critical: 1,
      unitsDeployed: 8,
      avgResponseTime: '4.2 min'
    },
    medical: {
      active: 5,
      total: 12,
      critical: 2,
      unitsDeployed: 6,
      avgResponseTime: '6.8 min'
    },
    accidents: {
      active: 3,
      total: 8,
      critical: 1,
      unitsDeployed: 5,
      avgResponseTime: '8.5 min'
    },
    rescue: {
      active: 3,
      total: 6,
      critical: 2,
      unitsDeployed: 11,
      avgResponseTime: '18.5 min'
    }
  };

  const systemStats = {
    totalIncidents: Object.values(emergencyData).reduce((sum, cat) => sum + cat.active, 0),
    totalCritical: Object.values(emergencyData).reduce((sum, cat) => sum + cat.critical, 0),
    totalUnitsDeployed: Object.values(emergencyData).reduce((sum, cat) => sum + cat.unitsDeployed, 0),
    systemUptime: '99.9%',
    edgeNodesOnline: 4,
    totalEdgeNodes: 4
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Handle scrollable content scroll for hero transformation
  useEffect(() => {
    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop;
      setScrollPosition(scrollTop);
    };

    // Get the scrollable container
    const scrollContainer = document.querySelector('.dashboard-scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const emergencyCategories = [
    {
      id: 'fire',
      name: 'Fire Incidents',
      icon: FireIcon,
      path: '/fire',
      color: 'red',
      bgGradient: 'bg-gradient-to-br from-red-500 to-red-600',
      borderColor: 'border-red-200',
      textColor: 'text-red-600',
      data: emergencyData.fire
    },
    {
      id: 'medical',
      name: 'Medical Emergencies',
      icon: HeartIcon,
      path: '/medical',
      color: 'blue',
      bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      data: emergencyData.medical
    },
    {
      id: 'accidents',
      name: 'Road Accidents',
      icon: TruckIcon,
      path: '/accidents',
      color: 'amber',
      bgGradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-600',
      data: emergencyData.accidents
    },
    {
      id: 'rescue',
      name: 'Rescue Operations',
      icon: MagnifyingGlassIcon,
      path: '/rescue',
      color: 'purple',
      bgGradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      data: emergencyData.rescue
    }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">

      {/* Hero Section - Transforms with scroll */}
      <div
        className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 shadow-2xl flex-shrink-0 transition-all duration-100 border-b border-emerald-700/50"
        style={{
          padding: `${Math.max(12, 48 - scrollPosition * 0.2)}px ${Math.max(8, 32 - scrollPosition * 0.1)}px`,
          minHeight: `${Math.max(70, 200 - scrollPosition * 0.5)}px`
        }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Hero Branding */}
          <div className="flex-1 flex items-center gap-4" style={{opacity: Math.max(0.7, 1 - scrollPosition * 0.01)}}>
            {/* Accent accent line when compressed */}
            {scrollPosition > 50 && (
              <div className="w-1 h-12 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full transition-all duration-200"></div>
            )}

            <div className="flex items-center space-x-4">
              <div className="transition-all duration-100" style={{width: `${Math.max(32, 112 - scrollPosition * 0.35)}px`, height: `${Math.max(32, 112 - scrollPosition * 0.35)}px`}}>
                <img src="/cura-logo.png" alt="CURA Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1
                  className="font-black text-white hero-title tracking-tight transition-all duration-100 leading-tight"
                  style={{fontSize: `${Math.max(24, 112 - scrollPosition * 0.35)}px`}}
                >
                  CURA
                </h1>
                <p
                  className="text-emerald-300 hero-subtitle font-light transition-all duration-100"
                  style={{
                    fontSize: `${Math.max(11, 36 - scrollPosition * 0.18)}px`,
                  marginTop: scrollPosition > 100 ? '2px' : '12px',
                  opacity: Math.max(0.4, 1 - scrollPosition * 0.01),
                  lineHeight: '1.1'
                }}
              >
                Emergency Command & Response Authority
              </p>
              <p
                className="text-emerald-200 hero-subtitle opacity-75 leading-relaxed transition-all duration-100"
                style={{
                  fontSize: scrollPosition > 80 ? '0px' : '16px',
                  marginTop: scrollPosition > 80 ? '0' : '8px',
                  opacity: Math.max(0, 1 - scrollPosition * 0.008),
                  maxWidth: '512px',
                  display: scrollPosition > 80 ? 'none' : 'block'
                }}
              >
                Real-time multi-agency coordination platform with edge AI intelligence for rapid emergency response and optimization
              </p>
            </div>
            </div>
          </div>

          {/* Right: Hexagon Design - Always visible but scales */}
          <div
            className="flex items-center justify-end pr-4 transition-all duration-100 flex-shrink-0"
            style={{
              opacity: Math.max(0.3, 1 - scrollPosition * 0.008)
            }}
          >
            <div
              className="relative hexagon-hero glow-border"
              style={{
                width: `${Math.max(60, 256 - scrollPosition * 0.6)}px`,
                height: `${Math.max(60, 256 - scrollPosition * 0.6)}px`,
                transition: 'all 100ms linear'
              }}
            >
              {/* Hexagon background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl" style={{clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'}}></div>

              {/* Hexagon content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl" style={{clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'}}>
                <div className="text-white text-center">
                  <div className="font-black mb-1" style={{fontSize: `${Math.max(12, 48 - scrollPosition * 0.2)}px`, lineHeight: '1'}}
                  >AI</div>
                  <div className="font-semibold tracking-wider opacity-90" style={{fontSize: `${Math.max(6, 14 - scrollPosition * 0.08)}px`, lineHeight: '1'}}
                  >POWERED</div>
                  <div className="mt-1 opacity-75 px-2" style={{fontSize: `${Math.max(4, 12 - scrollPosition * 0.06)}px`, lineHeight: '1'}}
                  >Edge AI</div>
                </div>
              </div>

              {/* Animated border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-emerald-300 opacity-50" style={{clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-8 dashboard-scroll-container">

      {/* System Metrics KPIs */}
      <div className="bg-white border-b border-slate-200 -mx-8 px-8 py-6 shadow-sm mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Active */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 dashboard-slide-in" style={{animationDelay: '1.1s'}}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Active Incidents</p>
                <p className="text-4xl font-black text-red-600 mt-3">{systemStats.totalIncidents}</p>
                <p className="text-sm text-red-500 mt-2 font-medium">Across all agencies</p>
              </div>
              <div className="p-3 bg-red-200 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Critical Cases */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 dashboard-slide-in critical-glow" style={{animationDelay: '1.2s'}}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Critical Cases</p>
                <p className="text-4xl font-black text-orange-600 mt-3">{systemStats.totalCritical}</p>
                <p className="text-sm text-orange-500 mt-2 font-medium">Immediate attention</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Units Deployed */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 dashboard-slide-in" style={{animationDelay: '1.3s'}}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Units Deployed</p>
                <p className="text-4xl font-black text-blue-600 mt-3">{systemStats.totalUnitsDeployed}</p>
                <p className="text-sm text-blue-500 mt-2 font-medium">Currently responding</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <TruckIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* System Uptime */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 dashboard-slide-in glow-pulse" style={{animationDelay: '1.4s'}}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">System Uptime</p>
                <p className="text-4xl font-black text-emerald-600 mt-3">{systemStats.systemUptime}</p>
                <p className="text-sm text-emerald-500 mt-2 font-medium">All systems operational</p>
              </div>
              <div className="p-3 bg-emerald-200 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Category Cards */}
      <div className="bg-white border-b border-slate-200 -mx-8 px-8 py-6">
        <div className="mb-6 dashboard-slide-in" style={{animationDelay: '1.5s'}}>
          <h2 className="text-2xl font-bold text-slate-800">Response Centers</h2>
          <p className="text-slate-600 mt-1">Access specialized command centers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {emergencyCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.id}
                to={category.path}
                className="group bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 card-scale-up"
                style={{animationDelay: `${1.6 + (index * 0.1)}s`}}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${category.bgGradient} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  {category.data.critical > 0 && (
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                      {category.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className={`text-2xl font-bold ${category.textColor}`}>
                        {category.data.active}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">Active</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${category.data.critical > 0 ? 'text-red-600' : category.textColor}`}>
                        {category.data.critical}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide">Critical</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Units:</span>
                      <span className="font-medium">{category.data.unitsDeployed}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Avg Response:</span>
                      <span className="font-medium">{category.data.avgResponseTime}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">View Details</span>
                    <div className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Performance Overview */}
      <div className="flex gap-3 p-3 min-h-0 overflow-hidden animate-in -mx-8 px-8 mt-6" style={{height: '500px'}}>

        {/* Region Overview Map */}
        <div className="flex-1 min-w-0 dashboard-slide-in" style={{animationDelay: '2s'}}>
          <MapContainer />
        </div>

        {/* System Status Panel */}
        <div className="w-80 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col dashboard-slide-in" style={{animationDelay: '2.1s'}}>
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">System Status</h2>
            <p className="text-sm text-slate-500 mt-1">Infrastructure monitoring</p>
          </div>

          <div className="flex-1 p-6 space-y-4">

            {/* Response Performance */}
            <div className="bg-slate-50 rounded-lg p-4 dashboard-slide-in" style={{animationDelay: '2.2s'}}>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Response Performance</h3>
              <div className="space-y-3">
                {emergencyCategories.map((category, idx) => (
                  <div key={category.id} className="flex items-center justify-between text-sm dashboard-slide-in transition-all hover:translate-x-1" style={{animationDelay: `${2.3 + (idx * 0.05)}s`}}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        category.color === 'red' ? 'bg-red-500 animate-pulse' :
                        category.color === 'blue' ? 'bg-blue-500' :
                        category.color === 'amber' ? 'bg-amber-500 animate-pulse' :
                        category.color === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'
                      }`}></div>
                      <span className="text-slate-600">{category.name}:</span>
                    </div>
                    <span className="font-medium text-slate-800">{category.data.avgResponseTime}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 dashboard-slide-in" style={{animationDelay: '2.5s'}}>
              <h3 className="text-sm font-semibold text-slate-800">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <button className="btn-primary-corporate text-sm transition-all hover:scale-105 active:scale-95">
                  Emergency Broadcast
                </button>
                <button className="btn-secondary-corporate text-sm transition-all hover:scale-105 active:scale-95">
                  Generate Report
                </button>
                <Link
                  to="/system"
                  className="btn-secondary-corporate text-sm text-center transition-all hover:scale-105 active:scale-95"
                >
                  System Diagnostics
                </Link>
              </div>
            </div>

            {/* Network Status */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 glow-pulse">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-emerald-800">Network Health</h3>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-xs text-emerald-700 space-y-1">
                <div>Edge Nodes: {systemStats.edgeNodesOnline}/{systemStats.totalEdgeNodes} Online</div>
                <div>Uptime: {systemStats.systemUptime}</div>
                <div>Last Update: {currentTime.toLocaleTimeString()}</div>
              </div>
            </div>

          </div>

          {/* Command Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 dashboard-slide-in" style={{animationDelay: '2.6s'}}>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Command Center Online</span>
              <span className="font-medium">{systemStats.totalUnitsDeployed} units deployed</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;