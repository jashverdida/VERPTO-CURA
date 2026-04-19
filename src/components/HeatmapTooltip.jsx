import React from 'react';
import { FireIcon } from '@heroicons/react/24/solid';

const HeatmapTooltip = ({ hotspot }) => {
  if (!hotspot) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  const getSeverityBgGradient = (severity) => {
    switch (severity) {
      case 'critical':
        return 'from-red-50 to-red-100 border-red-200';
      case 'high':
        return 'from-orange-50 to-orange-100 border-orange-200';
      case 'medium':
        return 'from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'from-emerald-50 to-emerald-100 border-emerald-200';
    }
  };

  return (
    <div className="fixed pointer-events-none z-50">
      <div className="animate-in fade-in zoom-in duration-200">
        {/* Stylish Mini Modal */}
        <div className={`bg-gradient-to-br ${getSeverityBgGradient(hotspot.severity)} border rounded-lg shadow-xl p-4 w-64 transform transition-all`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">{hotspot.area}</h3>
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getSeverityColor(hotspot.severity)}`}>
              {hotspot.severity.toUpperCase()}
            </div>
          </div>

          {/* Main Content - Fire Incidents Count */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-lg ${
                hotspot.severity === 'critical' ? 'bg-red-100' :
                hotspot.severity === 'high' ? 'bg-orange-100' :
                hotspot.severity === 'medium' ? 'bg-amber-100' :
                'bg-emerald-100'
              }`}>
                <FireIcon className={`w-6 h-6 ${
                  hotspot.severity === 'critical' ? 'text-red-600' :
                  hotspot.severity === 'high' ? 'text-orange-600' :
                  hotspot.severity === 'medium' ? 'text-amber-600' :
                  'text-emerald-600'
                }`} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fire Incidents</p>
                <p className={`text-3xl font-black ${
                  hotspot.severity === 'critical' ? 'text-red-600' :
                  hotspot.severity === 'high' ? 'text-orange-600' :
                  hotspot.severity === 'medium' ? 'text-amber-600' :
                  'text-emerald-600'
                }`}>
                  {hotspot.incidents}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Time Period:</span>
              <span className="font-semibold text-slate-800">Last 30 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Avg per month:</span>
              <span className="font-semibold text-slate-800">{(hotspot.incidents / 2.5).toFixed(1)}</span>
            </div>
          </div>

          {/* Gradient Border Effect */}
          <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0" style={{
            background: `linear-gradient(135deg, transparent, rgba(255,255,255,0.1), transparent)`,
            borderRadius: 'inherit'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapTooltip;
