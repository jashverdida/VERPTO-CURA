import React from 'react';
import { Circle } from 'react-leaflet';
import { FireIcon } from '@heroicons/react/24/solid';

// Dummy heatmap data with fire incident counts across different areas
const HEATMAP_HOTSPOTS = [
  {
    id: 1,
    lat: 14.5601,
    lng: 121.0188,
    area: 'Makati CBD',
    incidents: 12,
    severity: 'high'
  },
  {
    id: 2,
    lat: 14.5868,
    lng: 121.0521,
    area: 'Ortigas Center',
    incidents: 8,
    severity: 'high'
  },
  {
    id: 3,
    lat: 14.6091,
    lng: 121.0245,
    area: 'EDSA Quezon City',
    incidents: 15,
    severity: 'critical'
  },
  {
    id: 4,
    lat: 14.5458,
    lng: 121.0442,
    area: 'Fort Bonifacio',
    incidents: 5,
    severity: 'medium'
  },
  {
    id: 5,
    lat: 14.6352,
    lng: 121.0440,
    area: 'North Quezon City',
    incidents: 9,
    severity: 'high'
  },
  {
    id: 6,
    lat: 14.5794,
    lng: 121.0774,
    area: 'Pasig City',
    incidents: 6,
    severity: 'medium'
  },
  {
    id: 7,
    lat: 14.5550,
    lng: 121.0300,
    area: 'Taguig Business District',
    incidents: 11,
    severity: 'high'
  },
  {
    id: 8,
    lat: 14.6250,
    lng: 121.0600,
    area: 'San Juan Heights',
    incidents: 4,
    severity: 'low'
  }
];

const HeatmapOverlay = ({ hoveredHotspot, setHoveredHotspot }) => {
  // Function to determine circle radius and opacity based on incident count
  const getCircleStyle = (incidents, severity) => {
    const radius = Math.min(incidents * 800, 3000); // Scale radius based on incident count

    const colorMap = {
      critical: { color: '#DC2626', opacity: 0.6 }, // red-600
      high: { color: '#F97316', opacity: 0.5 }, // orange-500
      medium: { color: '#FBBF24', opacity: 0.4 }, // amber-400
      low: { color: '#FBBF24', opacity: 0.3 } // amber-400
    };

    return {
      radius,
      ...colorMap[severity]
    };
  };

  return (
    <>
      {HEATMAP_HOTSPOTS.map((hotspot) => {
        const style = getCircleStyle(hotspot.incidents, hotspot.severity);
        const isHovered = hoveredHotspot?.id === hotspot.id;

        return (
          <Circle
            key={hotspot.id}
            center={[hotspot.lat, hotspot.lng]}
            radius={style.radius}
            pathOptions={{
              color: style.color,
              weight: isHovered ? 3 : 2,
              opacity: isHovered ? 0.8 : style.opacity,
              fillOpacity: isHovered ? 0.15 : 0.1,
              dashArray: isHovered ? '0' : '5, 5',
              fillColor: style.color
            }}
            eventHandlers={{
              mouseover: () => setHoveredHotspot(hotspot),
              mouseout: () => setHoveredHotspot(null)
            }}
          />
        );
      })}
    </>
  );
};

export { HEATMAP_HOTSPOTS };
export default HeatmapOverlay;
