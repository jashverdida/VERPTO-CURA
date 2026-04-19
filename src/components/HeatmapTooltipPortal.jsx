import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FireIcon } from '@heroicons/react/24/solid';

const HeatmapTooltipPortal = ({ hotspot, mapRef, onHotspotChange }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [displayedHotspot, setDisplayedHotspot] = useState(null);
  const tooltipRef = useRef(null);
  const leaveTimeoutRef = useRef(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });

  // Handle hotspot change with debounced hide
  useEffect(() => {
    if (hotspot) {
      // Clear any pending hide timeout
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }
      // Show the tooltip immediately
      setDisplayedHotspot(hotspot);
    } else {
      // Debounce the hide by 150ms to allow user to move cursor to tooltip
      leaveTimeoutRef.current = setTimeout(() => {
        setDisplayedHotspot(null);
        leaveTimeoutRef.current = null;
      }, 150);
    }

    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, [hotspot]);

  // Update tooltip position on mouse move - with minimal state updates
  useEffect(() => {
    if (!displayedHotspot || !mapRef?.current) {
      return;
    }

    const updateTooltipPosition = (e) => {
      if (!tooltipRef.current) return;

      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const tooltipWidth = tooltipRect.width || 280;
      const tooltipHeight = tooltipRect.height || 200;

      // LARGER OFFSET: 25px instead of 15px to avoid cursor-tooltip overlap
      let x = e.clientX + 25;
      let y = e.clientY + 25;

      // Check right edge collision - flip to left
      if (x + tooltipWidth > window.innerWidth - 10) {
        x = e.clientX - tooltipWidth - 25;
      }

      // Check bottom edge collision - flip to top
      if (y + tooltipHeight > window.innerHeight - 10) {
        y = e.clientY - tooltipHeight - 25;
      }

      // Ensure not going off left/top edges
      x = Math.max(10, x);
      y = Math.max(10, y);

      // OPTIMIZATION: Only update state if position changed significantly
      // Prevents excessive re-renders from tiny cursor movements
      const positionChanged =
        Math.abs(x - lastPositionRef.current.x) > 2 ||
        Math.abs(y - lastPositionRef.current.y) > 2;

      if (positionChanged) {
        lastPositionRef.current = { x, y };
        setPosition({ x, y });
      }
    };

    const mapElement = mapRef.current;
    mapElement.addEventListener('mousemove', updateTooltipPosition);

    return () => {
      mapElement.removeEventListener('mousemove', updateTooltipPosition);
    };
  }, [displayedHotspot, mapRef]);

  if (!displayedHotspot) return null;

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

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className={`bg-gradient-to-br ${getSeverityBgGradient(displayedHotspot.severity)} border rounded-lg shadow-2xl p-4 w-64 transform transition-all animate-in fade-in zoom-in duration-200 pointer-events-auto`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        // PERFORMANCE: Use transform for GPU acceleration instead of left/top
        transform: `translate3d(0, 0, 0)`,
        willChange: 'transform',
      }}
      // Keep tooltip visible when cursor is over it
      onMouseEnter={() => {
        if (leaveTimeoutRef.current) {
          clearTimeout(leaveTimeoutRef.current);
          leaveTimeoutRef.current = null;
        }
      }}
      onMouseLeave={() => {
        // When leaving tooltip, debounce the hide
        leaveTimeoutRef.current = setTimeout(() => {
          setDisplayedHotspot(null);
          if (onHotspotChange) {
            onHotspotChange(null);
          }
          leaveTimeoutRef.current = null;
        }, 100);
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800">{displayedHotspot.area}</h3>
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getSeverityColor(displayedHotspot.severity)}`}>
          {displayedHotspot.severity.toUpperCase()}
        </div>
      </div>

      {/* Main Content - Fire Incidents Count */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg ${
            displayedHotspot.severity === 'critical' ? 'bg-red-100' :
            displayedHotspot.severity === 'high' ? 'bg-orange-100' :
            displayedHotspot.severity === 'medium' ? 'bg-amber-100' :
            'bg-emerald-100'
          }`}>
            <FireIcon className={`w-6 h-6 ${
              displayedHotspot.severity === 'critical' ? 'text-red-600' :
              displayedHotspot.severity === 'high' ? 'text-orange-600' :
              displayedHotspot.severity === 'medium' ? 'text-amber-600' :
              'text-emerald-600'
            }`} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fire Incidents</p>
            <p className={`text-3xl font-black ${
              displayedHotspot.severity === 'critical' ? 'text-red-600' :
              displayedHotspot.severity === 'high' ? 'text-orange-600' :
              displayedHotspot.severity === 'medium' ? 'text-amber-600' :
              'text-emerald-600'
            }`}>
              {displayedHotspot.incidents}
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
          <span className="font-semibold text-slate-800">{(displayedHotspot.incidents / 2.5).toFixed(1)}</span>
        </div>
      </div>

      {/* Gradient Border Effect - Explicitly non-interactive */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none opacity-0"
        style={{
          background: `linear-gradient(135deg, transparent, rgba(255,255,255,0.1), transparent)`,
          borderRadius: 'inherit'
        }}
      ></div>
    </div>
  );

  return createPortal(tooltipContent, document.body);
};

export default HeatmapTooltipPortal;
