import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import {
  MapIcon,
  MapPinIcon,
  ClockIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const DEFAULT_CENTER = { lat: 14.5994, lng: 121.0437 };

const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};

const DUMMY_REPORTS = [
  { id: 1, type: 'fire',     title: 'Structure Fire',      description: 'Multi-story building fire reported',         location: 'Makati CBD, Metro Manila',      lat: 14.5601, lng: 121.0188, priority: 'critical', reportTime: '2026-03-24 14:32', units: ['FR-001', 'FR-002', 'FR-003'], status: 'responding' },
  { id: 2, type: 'medical',  title: 'Medical Emergency',   description: 'Heart attack at commercial building',        location: 'Ortigas Center',                lat: 14.5868, lng: 121.0521, priority: 'critical', reportTime: '2026-03-24 14:28', units: ['MED-005', 'MED-006'],         status: 'responding' },
  { id: 3, type: 'accident', title: 'Road Accident',       description: 'Multi-vehicle collision on highway',         location: 'EDSA, Quezon City',             lat: 14.6091, lng: 121.0245, priority: 'high',     reportTime: '2026-03-24 14:15', units: ['RES-004', 'MED-003'],         status: 'en-route'   },
  { id: 4, type: 'rescue',   title: 'Person Trapped',      description: 'Individual trapped in elevator',             location: 'BGC Tower 2, Fort Bonifacio',   lat: 14.5458, lng: 121.0442, priority: 'high',     reportTime: '2026-03-24 14:10', units: ['RES-001', 'RES-002'],         status: 'on-scene'   },
  { id: 5, type: 'fire',     title: 'Small Fire',          description: 'Electrical fire in residential unit',        location: 'Quezon City, North',            lat: 14.6352, lng: 121.0440, priority: 'medium',   reportTime: '2026-03-24 13:45', units: ['FR-004'],                     status: 'on-scene'   },
  { id: 6, type: 'medical',  title: 'Emergency Response',  description: 'Diabetic patient requiring assistance',      location: 'Pasig City',                    lat: 14.5794, lng: 121.0774, priority: 'medium',   reportTime: '2026-03-24 13:20', units: ['MED-002'],                    status: 'on-scene'   },
];

const TYPE_COLOR = {
  fire:     '#EF4444',
  medical:  '#3B82F6',
  accident: '#EAB308',
  rescue:   '#A855F7',
};

const USER_LOCATION_ICON = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <circle cx="11" cy="11" r="10" fill="#4285F4" fill-opacity="0.18"/>
    <circle cx="11" cy="11" r="6" fill="#4285F4" stroke="white" stroke-width="2"/>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 22, height: 22, equals: () => false },
    anchor: { x: 11, y: 11, equals: () => false },
  };
})();

function getMarkerIcon(type, priority) {
  const color = priority === 'critical' ? '#DC2626' : (TYPE_COLOR[type] ?? '#6B7280');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28">
    <circle cx="14" cy="14" r="11" fill="${color}" stroke="white" stroke-width="2.5"/>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 28, height: 28, equals: () => false },
    anchor: { x: 14, y: 14, equals: () => false },
  };
}

export default function GoogleMapContainer() {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: API_KEY ?? '' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(12);
  const [userLocation, setUserLocation] = useState(null);
  const wrapperRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        setCenter(pos);
        setZoom(14);
        setUserLocation(pos);
        mapRef.current?.panTo(pos);
      },
      () => {}
    );
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  React.useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden" ref={wrapperRef}>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white z-20 relative flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Emergency Response Map</h2>
            <p className="text-xs text-slate-500">Live incident tracking · Google Maps</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={toggleFullscreen} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            {isFullscreen
              ? <ArrowsPointingInIcon className="w-5 h-5 text-slate-600" />
              : <ArrowsPointingOutIcon className="w-5 h-5 text-slate-600" />}
          </button>
          <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">Live</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        {loadError && (
          <div className="flex items-center justify-center h-full text-red-500 text-sm">
            Failed to load Google Maps. Check your API key.
          </div>
        )}
        {!isLoaded && !loadError && (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Loading map…
          </div>
        )}
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={zoom}
            options={MAP_OPTIONS}
            onLoad={map => { mapRef.current = map; }}
            onClick={() => setSelectedReport(null)}
          >
            {userLocation && (
              <Marker
                position={userLocation}
                icon={USER_LOCATION_ICON}
                title="Your location"
                zIndex={9999}
              />
            )}

            {DUMMY_REPORTS.map(report => (
              <Marker
                key={report.id}
                position={{ lat: report.lat, lng: report.lng }}
                icon={getMarkerIcon(report.type, report.priority)}
                onClick={() => setSelectedReport(report)}
              />
            ))}

            {selectedReport && (
              <InfoWindow
                position={{ lat: selectedReport.lat, lng: selectedReport.lng }}
                onCloseClick={() => setSelectedReport(null)}
              >
                <div className="min-w-[200px] p-1">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="text-sm font-bold text-slate-800">{selectedReport.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap ${
                      selectedReport.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      selectedReport.priority === 'high'     ? 'bg-amber-100 text-amber-700' :
                                                               'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedReport.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{selectedReport.description}</p>
                  <div className="space-y-1.5 border-t border-slate-200 pt-2">
                    <div className="flex items-center space-x-2 text-xs">
                      <MapPinIcon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700">{selectedReport.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <ClockIcon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700">{selectedReport.reportTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-600">Status:</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        selectedReport.status === 'responding' ? 'bg-blue-100 text-blue-700' :
                        selectedReport.status === 'en-route'   ? 'bg-amber-100 text-amber-700' :
                                                                  'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedReport.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedReport.units.map(u => (
                        <span key={u} className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs">{u}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>

      {/* Footer legend */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 z-20 relative flex-shrink-0">
        <div className="flex items-center justify-between text-xs flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Markers:</span>
            {[['#DC2626','Fire/Critical'],['#3B82F6','Medical'],['#EAB308','Accident'],['#A855F7','Rescue']].map(([color, label]) => (
              <div key={label} className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate-600">{label}</span>
              </div>
            ))}
          </div>
          <div className="text-slate-600 ml-auto">
            <span className="font-semibold text-emerald-600">{DUMMY_REPORTS.length}</span> active incidents
          </div>
        </div>
      </div>
    </div>
  );
}
