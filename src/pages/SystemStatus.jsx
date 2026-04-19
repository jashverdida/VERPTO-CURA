import React, { useState } from 'react';
import { EDGE_NODES, formatTimeAgo, getStatusColor } from '../constants/dummyData';
import {
  ServerIcon,
  SignalIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CpuChipIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';

const SystemStatus = () => {
  const [edgeNodes] = useState(EDGE_NODES);
  const [selectedNode, setSelectedNode] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="w-5 h-5 text-success-green" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="w-5 h-5 text-warning-amber" />;
      case 'sms_only':
        return <ExclamationTriangleIcon className="w-5 h-5 text-warning-amber" />;
      case 'offline':
        return <XCircleIcon className="w-5 h-5 text-critical-red" />;
      default:
        return <ClockIcon className="w-5 h-5 text-text-medium" />;
    }
  };

  const getNodeStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'border-l-green-500 bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20';
      case 'degraded':
        return 'border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/20';
      case 'sms_only':
        return 'border-l-yellow-500 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/20';
      case 'offline':
        return 'border-l-red-500 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/20';
      default:
        return 'border-l-slate-300 bg-gradient-to-r from-slate-100/50 to-slate-200/50 border-slate-300/20';
    }
  };

  const getNetworkIcon = (networkMode) => {
    if (networkMode.includes('SMS')) {
      return <SignalIcon className="w-4 h-4" />;
    }
    return <WifiIcon className="w-4 h-4" />;
  };

  const systemOverallStatus = () => {
    const onlineNodes = edgeNodes.filter(node => node.status === 'online').length;
    const totalNodes = edgeNodes.length;
    const percentage = Math.round((onlineNodes / totalNodes) * 100);

    if (percentage >= 75) return { status: 'Operational', color: 'text-success-green' };
    if (percentage >= 50) return { status: 'Degraded', color: 'text-warning-amber' };
    return { status: 'Critical', color: 'text-critical-red' };
  };

  const overall = systemOverallStatus();

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="glass-card p-8 mb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ServerIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">System & Edge Node Status</h1>
            </div>
            <p className="text-slate-600 font-medium">
              Real-time monitoring of CURA edge AI nodes and system health
            </p>
          </div>

          <div className="flex items-center space-x-6">
            {/* Overall System Status */}
            <div className="text-center p-4 glass-card bg-gradient-to-br from-white/50 to-white/30 border border-white/20">
              <div className={`text-2xl font-bold ${overall.color.replace('text-', 'text-')}`}>
                {overall.status}
              </div>
              <div className="text-sm font-semibold text-slate-600">System Status</div>
            </div>

            <button className="btn-primary">
              System Report
            </button>
          </div>
        </div>

        {/* System Overview Stats */}
        <div className="grid grid-cols-5 gap-6">
          <div className="text-center p-5 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-green-600">
              {edgeNodes.filter(n => n.status === 'online').length}
            </div>
            <div className="text-sm font-semibold text-slate-600">Online Nodes</div>
          </div>
          <div className="text-center p-5 bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-amber-600">
              {edgeNodes.filter(n => n.status === 'degraded' || n.status === 'sms_only').length}
            </div>
            <div className="text-sm font-semibold text-slate-600">Degraded</div>
          </div>
          <div className="text-center p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-blue-600">
              {edgeNodes.reduce((sum, node) => sum + node.connections, 0)}
            </div>
            <div className="text-sm font-semibold text-slate-600">Active Connections</div>
          </div>
          <div className="text-center p-5 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-indigo-600">
              {edgeNodes.reduce((sum, node) => sum + node.processedToday, 0)}
            </div>
            <div className="text-sm font-semibold text-slate-600">Requests Today</div>
          </div>
          <div className="text-center p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-emerald-600">99.2%</div>
            <div className="text-sm font-semibold text-slate-600">Uptime</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6">
        {selectedNode ? (
          /* Detailed Node View */
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">
                Edge Node Details: {selectedNode.name}
              </h2>
              <button
                onClick={() => setSelectedNode(null)}
                className="btn-secondary"
              >
                Back to Overview
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Node Information */}
              <div className="glass-card p-6 border border-blue-500/20">
                <h3 className="font-bold text-slate-700 mb-6 flex items-center space-x-3 text-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <ServerIcon className="w-5 h-5 text-white" />
                  </div>
                  <span>Node Information</span>
                </h3>

                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-slate-100/50 to-slate-200/50 rounded-xl">
                    <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-2">Status</div>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(selectedNode.status)}
                      <span className="font-bold text-slate-800 capitalize">{selectedNode.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-100/50 to-green-200/50 rounded-xl">
                    <div className="text-sm text-green-600 font-semibold uppercase tracking-wider mb-2">Location</div>
                    <div className="font-bold text-green-700">{selectedNode.location}</div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-100/50 to-blue-200/50 rounded-xl">
                    <div className="text-sm text-blue-600 font-semibold uppercase tracking-wider mb-2">Last Ping</div>
                    <div className="font-bold text-blue-700">{formatTimeAgo(selectedNode.lastPing)}</div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-100/50 to-purple-200/50 rounded-xl">
                    <div className="text-sm text-purple-600 font-semibold uppercase tracking-wider mb-2">Network Mode</div>
                    <div className="flex items-center space-x-3">
                      {getNetworkIcon(selectedNode.networkMode)}
                      <span className="font-bold text-purple-700">{selectedNode.networkMode}</span>
                    </div>
                  </div>

                  {selectedNode.batteryLevel && (
                    <div className="p-4 bg-gradient-to-r from-amber-100/50 to-amber-200/50 rounded-xl">
                      <div className="text-sm text-amber-600 font-semibold uppercase tracking-wider mb-2">Battery Level</div>
                      <div className="flex items-center space-x-3">
                        <BoltIcon className="w-5 h-5 text-amber-600" />
                        <span className="font-bold text-amber-700">{selectedNode.batteryLevel}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="glass-card p-6 border border-green-500/20">
                <h3 className="font-bold text-slate-700 mb-6 flex items-center space-x-3 text-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <CpuChipIcon className="w-5 h-5 text-white" />
                  </div>
                  <span>Performance Metrics</span>
                </h3>

                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl">
                    <div className="text-sm text-blue-600 font-semibold uppercase tracking-wider mb-2">Active Connections</div>
                    <div className="text-4xl font-bold text-blue-600">{selectedNode.connections}</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl">
                    <div className="text-sm text-green-600 font-semibold uppercase tracking-wider mb-2">Requests Processed Today</div>
                    <div className="text-4xl font-bold text-green-600">{selectedNode.processedToday}</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl">
                    <div className="text-sm text-purple-600 font-semibold uppercase tracking-wider mb-2">Average Response Time</div>
                    <div className="text-3xl font-bold text-purple-600">127ms</div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl">
                    <div className="text-sm text-emerald-600 font-semibold uppercase tracking-wider mb-2">Success Rate</div>
                    <div className="text-3xl font-bold text-emerald-600">98.7%</div>
                  </div>
                </div>
              </div>

              {/* AI Models */}
              <div className="glass-card p-6 lg:col-span-2 border border-purple-500/20">
                <h3 className="font-bold text-slate-700 mb-6 text-lg">Loaded AI Models</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedNode.aiModelsLoaded.map((model, index) => (
                    <div key={index} className="glass-card p-4 border border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-indigo-100/50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                        <span className="font-bold text-slate-800">{model}</span>
                      </div>
                      <div className="text-sm text-slate-600 font-medium">
                        {model.includes('vision') && 'Image classification and analysis'}
                        {model.includes('nlp') && 'Natural language processing'}
                        {model.includes('speech') && 'Voice transcription and analysis'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Nodes Overview */
          <div className="space-y-6">
            {edgeNodes.map((node) => (
              <div
                key={node.id}
                className={`border-l-4 p-6 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm border ${
                  getNodeStatusColor(node.status)
                } hover:shadow-xl card-hover glass-card`}
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      node.status === 'online' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                      node.status === 'degraded' || node.status === 'sms_only' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                      'bg-gradient-to-br from-red-500 to-red-600'
                    } text-white shadow-lg`}>
                      <ServerIcon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="font-bold text-xl text-slate-800">{node.name}</h3>
                      <p className="text-slate-600 font-medium">{node.location}</p>
                      <p className="text-sm text-slate-500">ID: {node.id}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(node.status)}
                      <span className={`status-badge ${
                        node.status === 'online' ? 'status-resolved' :
                        node.status === 'degraded' || node.status === 'sms_only' ? 'status-pending' :
                        'status-critical'
                      }`}>
                        {node.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      Last ping: {formatTimeAgo(node.lastPing)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-100/50 to-blue-200/50 rounded-xl border border-blue-200/50">
                    <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Active Connections</div>
                    <div className="text-xl font-bold text-blue-700">{node.connections}</div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-100/50 to-green-200/50 rounded-xl border border-green-200/50">
                    <div className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">Processed Today</div>
                    <div className="text-xl font-bold text-green-700">{node.processedToday}</div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-purple-100/50 to-purple-200/50 rounded-xl border border-purple-200/50">
                    <div className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">Network Mode</div>
                    <div className="flex items-center space-x-2">
                      {getNetworkIcon(node.networkMode)}
                      <span className="text-sm font-bold text-purple-700">{node.networkMode}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-amber-100/50 to-amber-200/50 rounded-xl border border-amber-200/50">
                    <div className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">Battery</div>
                    <div className="text-sm font-bold text-amber-700">
                      {node.batteryLevel || 'AC Power'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div className="flex items-center space-x-6">
                    <span className="text-slate-600 font-medium">
                      AI Models: {node.aiModelsLoaded.length} loaded
                    </span>
                    {node.status === 'sms_only' && (
                      <span className="text-amber-600 font-bold bg-amber-100 px-3 py-1 rounded-full text-sm">
                        SMS Fallback Mode
                      </span>
                    )}
                  </div>

                  <button className="btn-primary px-4 py-2 text-sm">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemStatus;