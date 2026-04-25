import React, { useState, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapIcon,
  MapPinIcon,
  ClockIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import HeatmapOverlay from './HeatmapOverlay';
import HeatmapTooltipPortal from './HeatmapTooltipPortal';

// Fix for default marker icons in Leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for different emergency types
const createCustomIcon = (color, isCircle = true) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `;

  return L.divIcon({
    html: `<div style="
      width: 28px;
      height: 28px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Dummy incident/report data with Metro Manila coordinates
const DUMMY_REPORTS = [
  {
    id: 1,
    type: 'fire',
    title: 'Structure Fire',
    description: 'Multi-story building fire reported',
    location: 'Makati CBD, Metro Manila',
    lat: 14.5601,
    lng: 121.0188,
    priority: 'critical',
    reportTime: '2026-03-24 14:32',
    units: ['FR-001', 'FR-002', 'FR-003'],
    status: 'responding'
  },
  {
    id: 2,
    type: 'medical',
    title: 'Medical Emergency',
    description: 'Heart attack reported at commercial building',
    location: 'Ortigas Center',
    lat: 14.5868,
    lng: 121.0521,
    priority: 'critical',
    reportTime: '2026-03-24 14:28',
    units: ['MED-005', 'MED-006'],
    status: 'responding'
  },
  {
    id: 3,
    type: 'accident',
    title: 'Road Accident',
    description: 'Multi-vehicle collision on highway',
    location: 'EDSA, Quezon City',
    lat: 14.6091,
    lng: 121.0245,
    priority: 'high',
    reportTime: '2026-03-24 14:15',
    units: ['RES-004', 'MED-003'],
    status: 'en-route'
  },
  {
    id: 4,
    type: 'rescue',
    title: 'Person Trapped',
    description: 'Individual trapped in elevator',
    location: 'BGC Tower 2, Fort Bonifacio',
    lat: 14.5458,
    lng: 121.0442,
    priority: 'high',
    reportTime: '2026-03-24 14:10',
    units: ['RES-001', 'RES-002'],
    status: 'on-scene'
  },
  {
    id: 5,
    type: 'fire',
    title: 'Small Fire',
    description: 'Electrical fire in residential unit',
    location: 'Quezon City, North',
    lat: 14.6352,
    lng: 121.0440,
    priority: 'medium',
    reportTime: '2026-03-24 13:45',
    units: ['FR-004'],
    status: 'on-scene'
  },
  {
    id: 6,
    type: 'medical',
    title: 'Emergency Response',
    description: 'Diabetic patient requiring assistance',
    location: 'Pasig City',
    lat: 14.5794,
    lng: 121.0774,
    priority: 'medium',
    reportTime: '2026-03-24 13:20',
    units: ['MED-002'],
    status: 'on-scene'
  }
];

const getMarkerColor = (type, priority) => {
  if (priority === 'critical') return '#DC2626'; // red-600
  if (type === 'fire') return '#EF4444'; // red-500
  if (type === 'medical') return '#3B82F6'; // blue-500
  if (type === 'accident') return '#EAB308'; // yellow-500
  if (type === 'rescue') return '#A855F7'; // purple-500
  return '#6B7280'; // gray-500
};

const MapContainerComponent = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapWrapperRef = useRef(null);
  const mapContentRef = useRef(null);

  // Metro Manila center coordinates
  const center = [14.5994, 121.0437];

  const toggleFullscreen = () => {
    if (!mapWrapperRef.current) return;

    if (!isFullscreen) {
      if (mapWrapperRef.current.requestFullscreen) {
        mapWrapperRef.current.requestFullscreen();
      } else if (mapWrapperRef.current.webkitRequestFullscreen) {
        mapWrapperRef.current.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden" ref={mapWrapperRef}>
      {/* Map Header - Always in front */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white z-20 relative flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Emergency Response Map</h2>
            <p className="text-xs text-slate-500">Live incident tracking • OpenStreetMap</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 flex items-center justify-center"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="w-5 h-5 text-slate-600" />
            ) : (
              <ArrowsPointingOutIcon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Live Status */}
          <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 relative z-20">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-700">Live</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Container - Strictly Constrained */}
      <div className="flex-1 min-w-0 min-h-0 relative z-10" ref={mapContentRef}>
        <LeafletMapContainer
          center={center}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          {/* OpenStreetMap Tiles - FREE, no API key needed */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Heatmap Overlay with Fire Incident Hotspots */}
          <HeatmapOverlay hoveredHotspot={hoveredHotspot} setHoveredHotspot={setHoveredHotspot} />

          {/* Emergency Markers */}
          {DUMMY_REPORTS.map((report) => (
            <Marker
              key={report.id}
              position={[report.lat, report.lng]}
              icon={createCustomIcon(getMarkerColor(report.type, report.priority))}
              eventHandlers={{
                click: () => setSelectedReport(report),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800">{report.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      report.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      report.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {report.priority.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3">{report.description}</p>

                  <div className="space-y-1.5 border-t border-slate-200 pt-2">
                    <div className="flex items-center space-x-2 text-xs">
                      <MapPinIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-slate-700">{report.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <ClockIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-slate-700">{report.reportTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-600">Status:</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        report.status === 'responding' ? 'bg-blue-100 text-blue-700' :
                        report.status === 'en-route' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {report.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="text-xs mt-2">
                      <span className="text-slate-600">Units:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {report.units.map((unit) => (
                          <span key={unit} className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs">
                            {unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </LeafletMapContainer>
      </div>

      {/* Heatmap Tooltip Portal - Renders to document.body for absolute freedom */}
      <HeatmapTooltipPortal hotspot={hoveredHotspot} onHotspotChange={setHoveredHotspot} mapRef={mapContentRef} />

      {/* Map Footer - Legend - Always in front */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 z-20 relative flex-shrink-0">
        <div className="flex items-center justify-between text-xs flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Incident Markers:</div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              <span className="text-slate-600">Fire/Critical</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600">Medical</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-600">Accident</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
              <span className="text-slate-600">Rescue</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Heatmap:</div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-slate-600">Critical</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-slate-600">High</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <span className="text-slate-600">Medium</span>
            </div>
          </div>

          <div className="text-slate-600 ml-auto">
            <span className="font-semibold text-emerald-600">{DUMMY_REPORTS.length}</span> active incidents
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapContainerComponent;
