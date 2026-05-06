import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

// ── Leaflet HTML injected into WebView ──────────────────────────────────────
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

    /* Custom marker styles */
    .pin-own {
      width: 28px; height: 28px; border-radius: 50%;
      background: #3B82F6; border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(59,130,246,0.5);
      display: flex; align-items: center; justify-content: center;
    }
    .pin-nearby {
      width: 28px; height: 28px; border-radius: 50%;
      background: #EF4444; border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(239,68,68,0.5);
      display: flex; align-items: center; justify-content: center;
    }
    .pin-dot {
      width: 10px; height: 10px; border-radius: 50%; background: #fff;
    }

    /* Popup */
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(15,23,42,0.12);
      padding: 0;
    }
    .leaflet-popup-content { margin: 0; }
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
    .badge-own { background: #EFF6FF; color: #3B82F6; }
    .badge-nearby { background: #FEF2F2; color: #EF4444; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  // ── Map Init ──
  var map = L.map('map', {
    center: [14.5995, 120.9842],
    zoom: 14,
    zoomControl: true,
    attributionControl: false,
  });

  // Light tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map);

  // ── Jurisdiction Polygon ──
  var jurisdictionCoords = [
    [14.612, 120.970],
    [14.612, 120.998],
    [14.587, 120.998],
    [14.587, 120.970],
  ];
  L.polygon(jurisdictionCoords, {
    color: '#10B981',
    weight: 2,
    opacity: 0.8,
    fillColor: '#10B981',
    fillOpacity: 0.08,
    dashArray: '6 4',
  }).addTo(map).bindTooltip('Jurisdiction: Barangay 123', {
    permanent: false,
    direction: 'center',
    className: '',
  });

  // ── Helper: create icon ──
  function makeIcon(type) {
    var cls = type === 'own' ? 'pin-own' : 'pin-nearby';
    return L.divIcon({
      className: '',
      html: '<div class="' + cls + '"><div class="pin-dot"></div></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16],
    });
  }

  // ── Own Reports (Blue) ──
  var ownReports = [
    { lat: 14.601, lng: 120.982, title: 'Vehicle Collision', loc: '789 Oak Ave', time: '10 min ago' },
    { lat: 14.596, lng: 120.975, title: 'Medical Response', loc: '55 Rizal Blvd', time: '32 min ago' },
  ];
  ownReports.forEach(function(r) {
    L.marker([r.lat, r.lng], { icon: makeIcon('own') })
      .addTo(map)
      .bindPopup(
        '<div class="popup-card">' +
        '<div class="popup-label" style="color:#3B82F6">&#9679; OWN REPORT</div>' +
        '<div class="popup-title">' + r.title + '</div>' +
        '<div class="popup-loc">' + r.loc + '</div>' +
        '<span class="badge badge-own">' + r.time + '</span>' +
        '</div>'
      );
  });

  // ── Nearby Reports (Red) ──
  var nearbyReports = [
    { lat: 14.605, lng: 120.990, title: 'Building Fire', loc: '456 Elm St', time: '5 min ago' },
    { lat: 14.598, lng: 120.986, title: 'Cardiac Arrest', loc: '123 Main St', time: '2 min ago' },
    { lat: 14.592, lng: 120.979, title: 'Fall Injury', loc: '202 Maple Dr', time: '15 min ago' },
  ];
  nearbyReports.forEach(function(r) {
    L.marker([r.lat, r.lng], { icon: makeIcon('nearby') })
      .addTo(map)
      .bindPopup(
        '<div class="popup-card">' +
        '<div class="popup-label" style="color:#EF4444">&#9679; NEARBY REPORT</div>' +
        '<div class="popup-title">' + r.title + '</div>' +
        '<div class="popup-loc">' + r.loc + '</div>' +
        '<span class="badge badge-nearby">' + r.time + '</span>' +
        '</div>'
      );
  });
</script>
</body>
</html>
`;

// ── Component ────────────────────────────────────────────────────────────────
export default function MapScreen({ navigation }) {
  const fabScale = useRef(new Animated.Value(1)).current;
  const [legendVisible, setLegendVisible] = useState(true);

  const handleFabPressIn = () => {
    Animated.spring(fabScale, { toValue: 0.92, useNativeDriver: true }).start();
  };
  const handleFabPressOut = () => {
    Animated.spring(fabScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };
  const handleFabPress = () => {
    navigation.navigate('Camera');
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

      {/* Top overlay header */}
      <View style={styles.topBar} pointerEvents="box-none">
        <View style={styles.topBarInner}>
          <View style={styles.topBarLeft}>
            <Image
              source={require('../assets/cura-logo.png')}
              style={styles.topLogoImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.topTitle}>Map View</Text>
              <Text style={styles.topSub}>Barangay 123 · Live</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.topBtn} onPress={() => setLegendVisible(v => !v)}>
            <Ionicons name="layers-outline" size={20} color={COLORS.slate700} />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        {legendVisible && (
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.medicalBlue }]} />
              <Text style={styles.legendText}>Own Reports</Text>
            </View>
            <View style={styles.legendDivider} />
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.fireRed }]} />
              <Text style={styles.legendText}>Nearby Reports</Text>
            </View>
            <View style={styles.legendDivider} />
            <View style={styles.legendItem}>
              <View style={[styles.jurisdictionSwatch]} />
              <Text style={styles.legendText}>Jurisdiction</Text>
            </View>
          </View>
        )}
      </View>

      {/* Floating Action Button — Report Emergency */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <Animated.View style={{ transform: [{ scale: fabScale }] }}>
          <TouchableOpacity
            style={styles.fab}
            onPressIn={handleFabPressIn}
            onPressOut={handleFabPressOut}
            onPress={handleFabPress}
            activeOpacity={1}
          >
            <Ionicons name="warning" size={22} color={COLORS.white} />
            <Text style={styles.fabLabel}>Report Emergency</Text>
          </TouchableOpacity>
        </Animated.View>
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
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    ...SHADOWS.medium,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topLogoImage: {
    width: 38,
    height: 38,
    marginRight: SPACING.sm,
  },
  topTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  topSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate500,
    fontWeight: '500',
    marginTop: -1,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Legend ──
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
    ...SHADOWS.small,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  jurisdictionSwatch: {
    width: 14,
    height: 10,
    borderRadius: 2,
    backgroundColor: COLORS.emerald + '30',
    borderWidth: 1.5,
    borderColor: COLORS.emerald,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.slate600,
  },
  legendDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.slate200,
  },

  // ── FAB ──
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.fireRed,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.full,
    gap: 8,
    shadowColor: COLORS.fireRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  fabLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});
