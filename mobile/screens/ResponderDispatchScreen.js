import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

// ── Leaflet HTML Map ──────────────────────────────────────────────────────────
const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    body { background: #F8FAFC; }

    .pin-responder {
      width: 28px; height: 28px; border-radius: 50%;
      background: #3B82F6; border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(59,130,246,0.5);
      display: flex; align-items: center; justify-content: center;
    }
    .pin-incident {
      width: 28px; height: 28px; border-radius: 50%;
      background: #EF4444; border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(239,68,68,0.5);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: bold; font-size: 16px;
    }
    .pin-hazard {
      width: 24px; height: 24px; border-radius: 50%;
      background: #EAB308; border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(234,179,8,0.5);
    }

    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(15,23,42,0.12);
      padding: 0;
    }
    .popup-card {
      padding: 12px 16px;
      min-width: 160px;
    }
    .popup-label {
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .popup-title { font-size: 14px; font-weight: 700; color: #0F172A; }
    .popup-loc { font-size: 11px; color: #64748B; margin-top: 2px; }
    .badge {
      display: inline-block; margin-top: 6px;
      padding: 2px 8px; border-radius: 99px;
      font-size: 10px; font-weight: 700;
    }
    .badge-responder { background: #EFF6FF; color: #3B82F6; }
    .badge-incident { background: #FEF2F2; color: #EF4444; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', {
    center: [14.601, 120.982],
    zoom: 14,
    zoomControl: true,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map);

  var responderLoc = [14.596, 120.975];
  var incidentLoc = [14.605, 120.990];
  var hazardLoc = [14.600, 120.983];

  // Route Line
  var routeLine = L.polyline([responderLoc, hazardLoc, incidentLoc], {
    color: '#3B82F6',
    weight: 3,
    opacity: 0.7,
    dashArray: '8 5'
  }).addTo(map);

  // Markers
  L.marker(responderLoc, {
    icon: L.divIcon({ className: '', html: '<div class="pin-responder"></div>', iconSize: [28,28], iconAnchor: [14,14] })
  }).addTo(map).bindPopup(
    '<div class="popup-card">' +
    '<div class="popup-label" style="color:#3B82F6">&#9679; YOU (RESPONDER)</div>' +
    '<div class="popup-title">Your Position</div>' +
    '<div class="popup-loc">Ready for dispatch</div>' +
    '<span class="badge badge-responder">Active</span>' +
    '</div>'
  );

  L.marker(hazardLoc, {
    icon: L.divIcon({ className: '', html: '<div class="pin-hazard"></div>', iconSize: [24,24], iconAnchor: [12,12] })
  }).addTo(map).bindPopup(
    '<div class="popup-card">' +
    '<div class="popup-label" style="color:#EAB308">⚠ HAZARD</div>' +
    '<div class="popup-title">Flooding Risk</div>' +
    '<div class="popup-loc">Between you and incident</div>' +
    '</div>'
  );

  L.marker(incidentLoc, {
    icon: L.divIcon({ className: '', html: '<div class="pin-incident">!</div>', iconSize: [28,28], iconAnchor: [14,14] })
  }).addTo(map).bindPopup(
    '<div class="popup-card">' +
    '<div class="popup-label" style="color:#EF4444">&#9679; INCIDENT</div>' +
    '<div class="popup-title">Structure Fire</div>' +
    '<div class="popup-loc">456 Elm St, District 3</div>' +
    '<span class="badge badge-incident">Critical</span>' +
    '</div>'
  );

  map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
</script>
</body>
</html>
`;

// ── Component ────────────────────────────────────────────────────────────────
export default function ResponderDispatchScreen() {
  const [countdown, setCountdown] = useState(3600);
  const fabScale = useRef(new Animated.Value(1)).current;

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

  const handleFabPressIn = () => {
    Animated.spring(fabScale, { toValue: 0.92, useNativeDriver: true }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(fabScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const handleAction = (action) => {
    Alert.alert('Responder Action', `${action} - Status updated`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Full-screen Map */}
      <WebView
        style={styles.map}
        source={{ html: MAP_HTML }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
      />

      {/* Top Bar - Incident Header */}
      <View style={styles.topBar} pointerEvents="box-none">
        <View style={[styles.topBarInner, { backgroundColor: COLORS.fireRed }]}>
          <View style={styles.topBarLeft}>
            <View style={[styles.topLogoBox, { backgroundColor: COLORS.slate900 }]}>
              <Ionicons name="warning" size={18} color={COLORS.fireRed} />
            </View>
            <View>
              <Text style={[styles.topTitle, { color: COLORS.slate900 }]}>DISPATCHED</Text>
              <Text style={[styles.topSub, { color: COLORS.slate900 }]}>Structure Fire</Text>
            </View>
          </View>
          <View style={styles.timerBadge}>
            <Text style={styles.timerLabel}>SLA</Text>
            <Text style={[styles.timerValue, countdown < 600 && { color: COLORS.slate900 }]}>
              {formatTime(countdown)}
            </Text>
          </View>
        </View>

        {/* Incident Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color={COLORS.fireRed} />
            <Text style={styles.detailText}>456 Elm St, District 3</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color={COLORS.medicalBlue} />
            <Text style={styles.detailText}>Reported 5 minutes ago</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons - Bottom */}
      <View style={styles.actionBar} pointerEvents="box-none">
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.emerald }]}
            onPress={() => handleAction('Arrival')}
          >
            <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>ON SCENE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.medicalBlue }]}
            onPress={() => handleAction('Backup Requested')}
          >
            <Ionicons name="shield" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>BACKUP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.fireRed }]}
            onPress={() => handleAction('Medical Dispatch')}
          >
            <Ionicons name="medkit" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>MEDICAL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  map: {
    flex: 1,
  },

  // ── Top Bar ──
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 54 : 44,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  topBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    ...SHADOWS.medium,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topLogoBox: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  topTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  topSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate600,
    fontWeight: '500',
    marginTop: -1,
  },
  timerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  timerLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.slate900,
    letterSpacing: 1,
  },
  timerValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.fireRed,
  },

  // Details Card
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.slate700,
    fontWeight: '500',
    marginLeft: SPACING.sm,
  },

  // ── Action Bar ──
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate200,
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 30 : SPACING.md,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    height: 80,
  },
  actionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
