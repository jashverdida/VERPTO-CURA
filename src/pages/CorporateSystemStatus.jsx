import React, { useState, useEffect } from 'react';
import {
  ServerIcon,
  WifiIcon,
  SignalIcon,
  BatteryIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  Battery0Icon,
  Battery25Icon,
  Battery50Icon,
  Battery75Icon,
  Battery100Icon,
} from '@heroicons/react/24/solid';

const CorporateSystemStatus = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedNode, setSelectedNode] = useState(null);

  // Mock edge node data
  const [edgeNodes] = useState([
    {
      id: 'NODE-001',
      name: 'Quezon City Central',
      location: 'Quezon Memorial Circle',
      coordinates: { lat: 14.6760, lng: 121.0437 },
      status: 'online',
      health: 95,
      battery: 87,
      networkMode: 'wifi',
      signalStrength: 4,
      lastSeen: new Date(Date.now() - 2 * 60 * 1000),
      uptime: '15d 4h 12m',
      temperature: '32°C',
      cpuUsage: 15,
      memoryUsage: 45,
      storageUsage: 23,
      aiProcessingActive: true,
      incidentsProcessed: 127,
      alertsGenerated: 8,
    },
    {
      id: 'NODE-002',
      name: 'Makati Business District',
      location: 'Ayala Triangle',
      coordinates: { lat: 14.5547, lng: 121.0244 },
      status: 'online',
      health: 92,
      battery: 76,
      networkMode: '4g',
      signalStrength: 3,
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      uptime: '12d 8h 45m',
      temperature: '34°C',
      cpuUsage: 28,
      memoryUsage: 62,
      storageUsage: 34,
      aiProcessingActive: true,
      incidentsProcessed: 89,
      alertsGenerated: 12,
    },
    {
      id: 'NODE-003',
      name: 'Manila Bay Port',
      location: 'Port Area, Manila',
      coordinates: { lat: 14.5833, lng: 120.9667 },
      status: 'degraded',
      health: 67,
      battery: 23,
      networkMode: 'sms',
      signalStrength: 2,
      lastSeen: new Date(Date.now() - 45 * 60 * 1000),
      uptime: '8d 2h 15m',
      temperature: '38°C',
      cpuUsage: 78,
      memoryUsage: 89,
      storageUsage: 67,
      aiProcessingActive: false,
      incidentsProcessed: 45,
      alertsGenerated: 15,
      issues: ['High temperature', 'Low battery', 'Network degraded']
    },
    {
      id: 'NODE-004',
      name: 'Pasig River Monitoring',
      location: 'Guadalupe Bridge',
      coordinates: { lat: 14.5653, lng: 121.0359 },
      status: 'online',
      health: 88,
      battery: 93,
      networkMode: 'wifi',
      signalStrength: 4,
      lastSeen: new Date(Date.now() - 1 * 60 * 1000),
      uptime: '22d 11h 33m',
      temperature: '30°C',
      cpuUsage: 22,
      memoryUsage: 38,
      storageUsage: 19,
      aiProcessingActive: true,
      incidentsProcessed: 156,
      alertsGenerated: 6,
    },
    {
      id: 'NODE-005',
      name: 'Taguig Emergency Hub',
      location: 'BGC Central Square',
      coordinates: { lat: 14.5507, lng: 121.0494 },
      status: 'offline',
      health: 0,
      battery: 0,
      networkMode: 'none',
      signalStrength: 0,
      lastSeen: new Date(Date.now() - 3 * 60 * 60 * 1000),
      uptime: 'OFFLINE',
      temperature: 'N/A',
      cpuUsage: 0,
      memoryUsage: 0,
      storageUsage: 0,
      aiProcessingActive: false,
      incidentsProcessed: 78,
      alertsGenerated: 3,
      issues: ['Power failure', 'Hardware malfunction']
    },
    {
      id: 'NODE-006',
      name: 'Ortigas Center',
      location: 'Emerald Avenue',
      coordinates: { lat: 14.5866, lng: 121.0581 },
      status: 'online',
      health: 96,
      battery: 91,
      networkMode: 'wifi',
      signalStrength: 4,
      lastSeen: new Date(Date.now() - 30 * 1000),
      uptime: '18d 22h 07m',
      temperature: '31°C',
      cpuUsage: 19,
      memoryUsage: 41,
      storageUsage: 28,
      aiProcessingActive: true,
      incidentsProcessed: 203,
      alertsGenerated: 9,
    },
  ]);

  // Update time every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const getBatteryIcon = (battery) => {
    if (battery >= 80) return Battery100Icon;
    if (battery >= 60) return Battery75Icon;
    if (battery >= 40) return Battery50Icon;
    if (battery >= 20) return Battery25Icon;
    return Battery0Icon;
  };

  const getStatusColor = (status, health = 100) => {
    switch (status) {
      case 'online':
        return health >= 90 ? 'emerald' : health >= 70 ? 'amber' : 'red';
      case 'degraded':
        return 'amber';
      case 'offline':
        return 'red';
      default:
        return 'slate';
    }
  };

  const getNetworkIcon = (mode) => {
    switch (mode) {
      case 'wifi':
        return WifiIcon;
      case '4g':
        return SignalIcon;
      case 'sms':
        return SignalIcon;
      default:
        return SignalIcon;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      return `${diffHours}h ago`;
    }
  };

  const onlineNodes = edgeNodes.filter(node => node.status === 'online').length;
  const degradedNodes = edgeNodes.filter(node => node.status === 'degraded').length;
  const offlineNodes = edgeNodes.filter(node => node.status === 'offline').length;
  const criticalNodes = edgeNodes.filter(node => node.battery < 25 || node.health < 70).length;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-slate-900">System Status</h1>
            <p className="text-body text-slate-600 mt-1">
              Edge AI infrastructure monitoring and diagnostics • {currentTime.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="btn-primary-corporate">
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh All
            </button>
            <button className="btn-secondary-corporate">
              <Cog6ToothIcon className="w-4 h-4 mr-2" />
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Network Overview KPIs */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div className="kpi-value text-emerald-600">{onlineNodes}</div>
            <div className="kpi-label">Online Nodes</div>
            <div className="kpi-change">of {edgeNodes.length} total</div>
          </div>

          <div className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              </div>
              {degradedNodes > 0 && (
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className={`kpi-value ${degradedNodes > 0 ? 'text-amber-600' : ''}`}>{degradedNodes}</div>
            <div className="kpi-label">Degraded</div>
            <div className="kpi-change">Performance issues</div>
          </div>

          <div className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-red-100">
                <ServerIcon className="w-5 h-5 text-red-600" />
              </div>
              {offlineNodes > 0 && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className={`kpi-value ${offlineNodes > 0 ? 'text-red-600' : ''}`}>{offlineNodes}</div>
            <div className="kpi-label">Offline</div>
            <div className="kpi-change">Require attention</div>
          </div>

          <div className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <BatteryIcon className="w-5 h-5 text-slate-600" />
              </div>
              {criticalNodes > 0 && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className={`kpi-value ${criticalNodes > 0 ? 'text-red-600' : ''}`}>{criticalNodes}</div>
            <div className="kpi-label">Critical Status</div>
            <div className="kpi-change">Low battery/health</div>
          </div>
        </div>
      </div>

      {/* Edge Nodes Grid */}
      <div className="flex-1 overflow-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {edgeNodes.map((node) => {
            const statusColor = getStatusColor(node.status, node.health);
            const BatteryComponent = getBatteryIcon(node.battery);
            const NetworkIcon = getNetworkIcon(node.networkMode);
            const isCritical = node.status === 'offline' || node.status === 'degraded' || node.battery < 25 || node.health < 70;

            return (
              <div
                key={node.id}
                className={`corporate-card-elevated cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isCritical ? 'ring-2 ring-red-200 bg-red-50' : ''
                } ${
                  selectedNode === node.id ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
              >
                {/* Node Header */}
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${{
                        emerald: 'bg-emerald-100',
                        amber: 'bg-amber-100',
                        red: 'bg-red-100',
                        slate: 'bg-slate-100'
                      }[statusColor]}`}>
                        <ServerIcon className={`w-5 h-5 text-${statusColor}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{node.name}</h3>
                        <p className="text-sm text-slate-600 font-mono">{node.id}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPinIcon className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{node.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Status Indicator */}
                      <div className={`status-indicator ${
                        node.status === 'online' ? 'status-success' :
                        node.status === 'degraded' ? 'status-warning' : 'status-critical'
                      }`}>
                        {node.status}
                      </div>

                      {isCritical && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Node Metrics */}
                <div className="p-6">
                  {/* Primary Metrics Row */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Health */}
                    <div className="text-center">
                      <div className={`text-xl font-bold ${
                        node.health >= 90 ? 'text-emerald-600' :
                        node.health >= 70 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {node.health}%
                      </div>
                      <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                        Health
                      </div>
                    </div>

                    {/* Battery */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <BatteryComponent className={`w-6 h-6 ${
                          node.battery >= 50 ? 'text-emerald-600' :
                          node.battery >= 25 ? 'text-amber-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className={`text-xl font-bold ${
                        node.battery >= 50 ? 'text-emerald-600' :
                        node.battery >= 25 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {node.battery}%
                      </div>
                      <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                        Battery
                      </div>
                    </div>

                    {/* Network */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <NetworkIcon className={`w-5 h-5 ${
                          node.networkMode === 'wifi' ? 'text-emerald-600' :
                          node.networkMode === '4g' ? 'text-blue-600' :
                          node.networkMode === 'sms' ? 'text-amber-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="text-sm font-semibold text-slate-900 capitalize">
                        {node.networkMode === 'none' ? 'Offline' : node.networkMode}
                      </div>
                      <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                        Network
                      </div>
                    </div>
                  </div>

                  {/* System Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">CPU Usage</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              node.cpuUsage >= 80 ? 'bg-red-500' :
                              node.cpuUsage >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(node.cpuUsage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-slate-900 w-8">{node.cpuUsage}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Memory</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              node.memoryUsage >= 80 ? 'bg-red-500' :
                              node.memoryUsage >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(node.memoryUsage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-slate-900 w-8">{node.memoryUsage}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Temperature</span>
                      <span className={`font-medium ${
                        node.temperature === 'N/A' ? 'text-slate-500' :
                        parseInt(node.temperature) >= 40 ? 'text-red-600' :
                        parseInt(node.temperature) >= 35 ? 'text-amber-600' : 'text-slate-900'
                      }`}>
                        {node.temperature}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Last Seen</span>
                      <span className="font-medium text-slate-900">
                        {node.status === 'offline' ? formatTimeAgo(node.lastSeen) : 'Now'}
                      </span>
                    </div>
                  </div>

                  {/* AI Processing Status */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          node.aiProcessingActive ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}></div>
                        <span className="text-slate-600">AI Processing</span>
                      </div>
                      <span className={`font-medium ${
                        node.aiProcessingActive ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {node.aiProcessingActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      Incidents: {node.incidentsProcessed} • Alerts: {node.alertsGenerated}
                    </div>
                  </div>

                  {/* Issues */}
                  {node.issues && node.issues.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                        Issues Detected
                      </h4>
                      <div className="space-y-1">
                        {node.issues.map((issue, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-red-700">
                            <ExclamationTriangleIcon className="w-3 h-3 flex-shrink-0" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {selectedNode === node.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Uptime:</span>
                          <span className="ml-2 font-medium text-slate-900">{node.uptime}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Storage:</span>
                          <span className="ml-2 font-medium text-slate-900">{node.storageUsage}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CorporateSystemStatus;