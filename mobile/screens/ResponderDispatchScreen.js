import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

// ── Leaflet HTML injected into WebView (Tactical Dark Mode) ──────────────────
const TACTICAL_MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #000; }
    
    /* Tactical Pins */
    .pin-responder {
      width: 24px; height: 24px; border-radius: 50%;
      background: #3B82F6; border: 3px solid #fff;
      box-shadow: 0 0 10px #3B82F6;
    }
    .pin-incident {
      width: 30px; height: 30px; border-radius: 50%;
      background: #EF4444; border: 3px solid #000;
      box-shadow: 0 0 15px #EF4444;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: bold; font-size: 16px;
    }
    .pin-hazard {
      width: 20px; height: 20px; border-radius: 4px;
      background: #EAB308; border: 2px solid #000;
      box-shadow: 0 0 8px #EAB308;
    }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', {
    center: [14.601, 120.982], // Middle of route
    zoom: 15,
    zoomControl: false,
    attributionControl: false,
  });

  // Dark tactical tile layer (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map);

  // Coordinates
  var responderLoc = [14.596, 120.975];
  var incidentLoc = [14.605, 120.990];
  var hazardLoc = [14.600, 120.983];

  // Route Line (Dashed)
  var routeLine = L.polyline([responderLoc, hazardLoc, incidentLoc], {
    color: '#3B82F6',
    weight: 4,
    opacity: 0.8,
    dashArray: '10, 10'
  }).addTo(map);

  // Markers
  L.marker(responderLoc, {
    icon: L.divIcon({ className: '', html: '<div class="pin-responder"></div>', iconSize: [24,24], iconAnchor: [12,12] })
  }).addTo(map);

  L.marker(incidentLoc, {
    icon: L.divIcon({ className: '', html: '<div class="pin-incident">!</div>', iconSize: [30,30], iconAnchor: [15,15] })
  }).addTo(map);

  L.marker(hazardLoc, {
    icon: L.divIcon({ className: '', html: '<div class="pin-hazard"></div>', iconSize: [20,20], iconAnchor: [10,10] })
  }).addTo(map).bindTooltip('Hazard: Flooding', { permanent: true, direction: 'right', className: 'tactical-tooltip' });

  map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
</script>
</body>
</html>
`;

// ── Swipe To Confirm Component ───────────────────────────────────────────────
const SwipeToConfirm = ({ onConfirm }) => {
  const [confirmed, setConfirmed] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const sliderWidth = width - SPACING.md * 2 - SPACING.md * 2; // Accounting for container padding
  const knobWidth = 60;
  const maxDrag = sliderWidth - knobWidth - 8; // 8 for padding

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !confirmed,
      onMoveShouldSetPanResponder: () => !confirmed,
      onPanResponderMove: (e, gesture) => {
        if (gesture.dx > 0 && gesture.dx <= maxDrag) {
          pan.setValue({ x: gesture.dx, y: 0 });
        }
      },
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx > maxDrag * 0.85) {
          // Confirm
          Animated.spring(pan, {
            toValue: { x: maxDrag, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            setConfirmed(true);
            onConfirm();
          });
        } else {
          // Reset
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.swipeTrack}>
        <Text style={styles.swipeText}>
          {confirmed ? 'ON SCENE' : 'SWIPE TO MARK ON SCENE >>'}
        </Text>
      </View>
      <Animated.View
        style={[
          styles.swipeKnob,
          { transform: [{ translateX: pan.x }] },
          confirmed && { backgroundColor: COLORS.emerald }
        ]}
        {...panResponder.panHandlers}
      >
        <Ionicons name={confirmed ? "checkmark" : "chevron-forward-outline"} size={32} color={COLORS.slate900} />
      </Animated.View>
    </View>
  );
};

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function ResponderDispatchScreen() {
  const [countdown, setCountdown] = useState(3600); // 60 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAction = (actionName) => {
    Alert.alert("Tactical Action", `${actionName} triggered. Sending to Commel.`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Active Dispatch Header */}
      <View style={styles.dispatchHeader}>
        <View style={styles.statusBanner}>
          <Ionicons name="warning" size={24} color={COLORS.slate900} />
          <Text style={styles.statusText}>DISPATCHED: STRUCTURAL FIRE</Text>
        </View>
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>GOLDEN HOUR SLA</Text>
          <Text style={[styles.timerValue, countdown < 600 && { color: COLORS.fireRed }]}>
            {formatTime(countdown)}
          </Text>
        </View>
        <View style={styles.incidentDetails}>
          <Text style={styles.detailText}><Ionicons name="location" size={14}/> 456 Elm St, District 3</Text>
          <Text style={styles.detailText}><Ionicons name="time" size={14}/> Reported 5m ago</Text>
        </View>
      </View>

      {/* Tactical Map View */}
      <View style={styles.mapContainer}>
        <WebView
          style={styles.map}
          source={{ html: TACTICAL_MAP_HTML }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
        />
        {/* Map Overlays for Tactical Feel */}
        <View style={styles.mapOverlayTop} pointerEvents="none" />
        <View style={styles.mapOverlayBottom} pointerEvents="none" />
        <View style={styles.gpsBadge}>
          <View style={styles.gpsDot} />
          <Text style={styles.gpsText}>GPS ACTIVE</Text>
        </View>
      </View>

      {/* Glove-Friendly Action Panel */}
      <View style={styles.actionPanel}>
        <SwipeToConfirm onConfirm={() => handleAction('MARK ON SCENE')} />

        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.medicalBlue }]} 
            onPress={() => handleAction('REQUEST BACKUP')}
          >
            <Ionicons name="shield" size={32} color={COLORS.white} />
            <Text style={styles.actionButtonText}>REQ BACKUP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.rescueYellow }]} 
            onPress={() => handleAction('ESCALATE HAZMAT')}
          >
            <Ionicons name="flask" size={32} color={COLORS.slate900} />
            <Text style={[styles.actionButtonText, { color: COLORS.slate900 }]}>HAZMAT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.fireRed }]} 
            onPress={() => handleAction('MEDICAL REQUIRED')}
          >
            <Ionicons name="medkit" size={32} color={COLORS.white} />
            <Text style={styles.actionButtonText}>MEDICAL REQ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Ultra-dark theme
  },
  
  // ── Dispatch Header ──
  dispatchHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.fireRed,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    gap: 10,
  },
  statusText: {
    color: COLORS.slate900,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#000',
  },
  timerLabel: {
    color: COLORS.slate400,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  timerValue: {
    color: COLORS.emerald,
    fontSize: 32,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  incidentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#1a1a1a',
  },
  detailText: {
    color: COLORS.slate300,
    fontSize: 14,
    fontWeight: '500',
  },

  // ── Map View ──
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapOverlayTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mapOverlayBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  gpsBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
    gap: 6,
  },
  gpsDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.emerald,
  },
  gpsText: {
    color: COLORS.emerald, fontSize: 10, fontWeight: '700', letterSpacing: 1,
  },

  // ── Action Panel ──
  actionPanel: {
    backgroundColor: '#121212',
    padding: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: '#333',
    paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.md,
  },
  
  // Swipe to Confirm
  swipeContainer: {
    height: 70,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
  },
  swipeTrack: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeText: {
    color: COLORS.slate500,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  swipeKnob: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.warning,
    borderRadius: 6,
    position: 'absolute',
    left: 4,
    top: 3,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },

  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    height: 100,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
