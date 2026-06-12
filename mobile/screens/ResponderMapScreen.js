import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  ActivityIndicator,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import { supabase } from '../lib/supabase';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = 'AIzaSyASeu4ipHv3PWUkSsKxdUk725fbSc5pkLk';

const INITIAL_REGION = {
  latitude:      10.3157,
  longitude:     123.8854,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const FALLBACK_ORIGIN = { latitude: 10.3286, longitude: 123.8984 };

const ASSIGNED_INCIDENT = {
  id:             'assign-1',
  type:           'FIRE',
  title:          'Transformer Fire — VECO Cebu Substation B',
  address:        'M.J. Cuenco Ave., Lahug, Cebu City',
  severity:       'critical',
  alarmLevel:     1,
  lat:            10.3320,
  lng:            123.9060,
  reportedBy:     'Maria Santos',
  submittedAt:    '2026-06-05T09:28:00',
  acknowledgedAt: '2026-06-05T09:30:00',
};

// Static Cebu mock incidents — always shown regardless of Supabase data
const CEBU_INCIDENTS = [
  { id: 'assign-1',  type: 'FIRE',          lat: 10.3320, lng: 123.9060 },
  { id: 'cebu-med',  type: 'MEDICAL',        lat: 10.3080, lng: 123.8890 },
  { id: 'cebu-veh',  type: 'VEHICLE',        lat: 10.3250, lng: 123.8770 },
  { id: 'cebu-haz',  type: 'HAZMAT',         lat: 10.3040, lng: 123.9080 },
  { id: 'cebu-rsc',  type: 'SEARCH_RESCUE',  lat: 10.3180, lng: 123.9020 },
];

const TYPE_COLOR = {
  FIRE:          '#EF4444',
  VEHICLE:       '#F97316',
  MEDICAL:       '#3B82F6',
  HAZMAT:        '#8B5CF6',
  SEARCH_RESCUE: '#14B8A6',
};

const TYPE_ICON = {
  FIRE:          'flame',
  VEHICLE:       'car',
  MEDICAL:       'medkit',
  HAZMAT:        'flask',
  SEARCH_RESCUE: 'search',
};

/* ── Utilities ────────────────────────────────────────────────────────────── */

function decodePolyline(encoded) {
  const pts = [];
  let i = 0, lat = 0, lng = 0;
  while (i < encoded.length) {
    let shift = 0, res = 0, b;
    do { b = encoded.charCodeAt(i++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += res & 1 ? ~(res >> 1) : res >> 1;
    shift = 0; res = 0;
    do { b = encoded.charCodeAt(i++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += res & 1 ? ~(res >> 1) : res >> 1;
    pts.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return pts;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

/* ══════════════════════════════════════════════════════════════════════════ */

export default function ResponderMapScreen() {
  const mapRef          = useRef(null);
  const animInterval    = useRef(null);
  const currentRegion   = useRef(INITIAL_REGION); // tracks latest map region for re-sync

  const [incidents,      setIncidents]      = useState([]);
  const [pinPositions,   setPinPositions]   = useState({});
  const [userLocation,   setUserLocation]   = useState(null);
  const [displayedRoute, setDisplayedRoute] = useState([]);
  const [routeInfo,      setRouteInfo]      = useState(null);
  const [isRouting,      setIsRouting]      = useState(false);
  const [routeActive,    setRouteActive]    = useState(false);

  const cardSlide   = useRef(new Animated.Value(-140)).current;
  const bottomAnim  = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.25)).current;
  const glowScale   = useRef(new Animated.Value(1)).current;

  const origin = userLocation
    ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
    : FALLBACK_ORIGIN;

  const straightKm = haversineKm(
    origin.latitude, origin.longitude,
    ASSIGNED_INCIDENT.lat, ASSIGNED_INCIDENT.lng,
  );

  /* ── Pulsing glow loop (shared across all badge overlays) ── */
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 0.65, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.20, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glowScale, { toValue: 1.35, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1.00, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  /* ── Slide assignment card in on mount ── */
  useEffect(() => {
    Animated.spring(cardSlide, {
      toValue: 0, friction: 7, tension: 55, useNativeDriver: true,
    }).start();
    return () => { if (animInterval.current) clearInterval(animInterval.current); };
  }, []);

  /* ── Badge overlay position formula ─────────────────────────────────────
     Identical to citizen MapScreen: lat/lng → screen (x, y) using the
     map's current region. Called on every onRegionChange so overlays
     always track the native pinColor markers perfectly.

     Formula:
       x = ((lng − centerLng) / lngDelta + 0.5) × SCREEN_W
       y = ((centerLat − lat) / latDelta  + 0.5) × SCREEN_H            */
  const computePinPositions = useCallback((region) => {
    currentRegion.current = region; // persist for re-sync after incidents load

    // Merge static Cebu incidents with any live Supabase Cebu-area incidents
    const dbCebu = incidents.filter(inc => {
      const la = inc.lat ?? inc.latitude;
      const lo = inc.lng ?? inc.longitude;
      return la && lo && la > 9.8 && la < 10.8 && lo > 123.5 && lo < 124.2;
    });
    const all = [
      ...CEBU_INCIDENTS,
      ...dbCebu.filter(inc => !CEBU_INCIDENTS.some(c => c.id === inc.id)),
    ];

    const pos = {};
    all.forEach(inc => {
      const la = inc.lat ?? inc.latitude;
      const lo = inc.lng ?? inc.longitude;
      if (!la || !lo) return;
      pos[inc.id] = {
        x: ((lo - region.longitude) / region.longitudeDelta + 0.5) * SCREEN_W,
        y: ((region.latitude - la)  / region.latitudeDelta  + 0.5) * SCREEN_H,
      };
    });
    setPinPositions(pos);
  }, [incidents]);

  /* Re-sync overlay positions whenever incidents arrive from Supabase.
     Without this, positions would stay stale until the user moves the map. */
  useEffect(() => {
    computePinPositions(currentRegion.current);
  }, [computePinPositions]);

  /* ── Location + Supabase feed ── */
  useFocusEffect(useCallback(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation(loc.coords);
      }
    })();

    supabase.from('incidents').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setIncidents(data ?? []));

    const ch = supabase.channel('responder-map-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' },
        (p) => setIncidents(prev => [p.new, ...prev]))
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, []));

  /* ── Google Directions API ── */
  const getRoute = async () => {
    if (isRouting) return;
    setIsRouting(true);
    const dest = { latitude: ASSIGNED_INCIDENT.lat, longitude: ASSIGNED_INCIDENT.lng };

    try {
      const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${origin.latitude},${origin.longitude}` +
        `&destination=${dest.latitude},${dest.longitude}` +
        `&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;

      const res  = await fetch(url);
      const data = await res.json();

      if (data.routes?.length) {
        const pts  = decodePolyline(data.routes[0].overview_polyline.points);
        const dist = data.routes[0].legs[0].distance.text;
        const dur  = data.routes[0].legs[0].duration.text;
        setRouteInfo({ distance: dist, duration: dur });
        animateRouteDrawing(pts);
        mapRef.current?.fitToCoordinates([origin, dest], {
          edgePadding: { top: 220, right: 60, bottom: 260, left: 60 },
          animated: true,
        });
      } else {
        setDisplayedRoute([origin, dest]);
        setRouteInfo({ distance: `${straightKm} km`, duration: '~6 min' });
      }

      setRouteActive(true);
      Animated.spring(bottomAnim, { toValue: 1, friction: 8, tension: 55, useNativeDriver: true }).start();
    } catch {
      setDisplayedRoute([origin, dest]);
      setRouteActive(true);
      setRouteInfo({ distance: `${straightKm} km`, duration: '~6 min' });
      Animated.spring(bottomAnim, { toValue: 1, friction: 8, tension: 55, useNativeDriver: true }).start();
    } finally {
      setIsRouting(false);
    }
  };

  const animateRouteDrawing = (fullRoute) => {
    if (animInterval.current) clearInterval(animInterval.current);
    setDisplayedRoute([]);
    let progress = 0;
    const total = fullRoute.length;
    const step  = Math.max(1, Math.ceil(total / 50));
    animInterval.current = setInterval(() => {
      progress += step;
      if (progress >= total) {
        setDisplayedRoute(fullRoute);
        clearInterval(animInterval.current);
      } else {
        setDisplayedRoute(fullRoute.slice(0, progress));
      }
    }, 30);
  };

  const clearRoute = () => {
    if (animInterval.current) clearInterval(animInterval.current);
    setDisplayedRoute([]);
    setRouteActive(false);
    setRouteInfo(null);
    Animated.timing(bottomAnim, { toValue: 0, duration: 260, useNativeDriver: true }).start();
  };

  const openInGoogleMaps = () => {
    const { lat, lng } = ASSIGNED_INCIDENT;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${origin.latitude},${origin.longitude}` +
      `&destination=${lat},${lng}&travelmode=driving`
    );
  };

  // All pin markers (Cebu static set for guaranteed visibility)
  const allMarkers = CEBU_INCIDENTS;

  const bottomTranslate = bottomAnim.interpolate({
    inputRange: [0, 1], outputRange: [220, 0],
  });

  return (
    <View style={styles.container}>
      {/* translucent matches citizen MapScreen — keeps SCREEN_H formula correct */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Google Map ── */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onMapReady={() => computePinPositions(INITIAL_REGION)}
        onRegionChange={computePinPositions}
        onRegionChangeComplete={computePinPositions}
      >
        {/* Native pinColor markers (always renders on all Android/iOS configs) */}
        {allMarkers.map(inc => {
          const color = TYPE_COLOR[(inc.type ?? '').toUpperCase()] ?? '#6B7280';
          return (
            <Marker
              key={String(inc.id)}
              coordinate={{ latitude: inc.lat, longitude: inc.lng }}
              pinColor={color}
              tracksViewChanges={false}
            />
          );
        })}

        {/* Animated route polyline */}
        {displayedRoute.length > 1 && (
          <Polyline
            coordinates={displayedRoute}
            strokeColor="#EF4444"
            strokeWidth={5}
            lineJoin="round"
            lineCap="round"
          />
        )}
      </MapView>

      {/* ── Icon badge overlays ─────────────────────────────────────────────
          React Native Views positioned OUTSIDE MapView using the lat/lng →
          screen-pixel formula. Updated on every onRegionChange so they
          always sit flush over the native pin head.
          pointerEvents="box-none" lets map gestures pass through.          */}
      {allMarkers.map(inc => {
        const pos        = pinPositions[inc.id];
        if (!pos) return null;
        const key        = (inc.type ?? '').toUpperCase();
        const color      = TYPE_COLOR[key]  ?? '#6B7280';
        const iconName   = TYPE_ICON[key]   ?? 'alert-circle';
        const isAssigned = inc.id === ASSIGNED_INCIDENT.id;
        const badgeSize  = isAssigned ? 50 : 44;
        const glowSize   = isAssigned ? 70 : 60;

        return (
          <View
            key={`badge-${inc.id}`}
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left:     pos.x - glowSize / 2,
              top:      pos.y - 108,
              width:    glowSize,
              height:   glowSize,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Pulsing glow ring */}
            <Animated.View
              style={{
                position: 'absolute',
                width: glowSize, height: glowSize,
                borderRadius: glowSize / 2,
                backgroundColor: color,
                opacity: glowOpacity,
                transform: [{ scale: Animated.multiply(glowScale, 0.78) }],
              }}
            />
            {/* Badge circle */}
            <View
              style={{
                width: badgeSize, height: badgeSize,
                borderRadius: badgeSize / 2,
                backgroundColor: color,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: isAssigned ? 3.5 : 3,
                borderColor: 'rgba(255,255,255,0.95)',
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.85,
                shadowRadius: isAssigned ? 14 : 10,
                elevation: isAssigned ? 14 : 10,
              }}
            >
              <Ionicons name={iconName} size={isAssigned ? 24 : 20} color="#fff" />
            </View>
          </View>
        );
      })}

      {/* ── Assignment card (top, always visible) ── */}
      <Animated.View style={[styles.assignCard, { transform: [{ translateY: cardSlide }] }]}>
        <View style={styles.cardAccentStripe} />
        <View style={styles.cardInner}>
          <View style={styles.cardInfoRow}>
            <View style={styles.cardTypeIcon}>
              <Ionicons name="flame" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.cardMetaRow}>
                <Text style={styles.cardMetaLabel}>ASSIGNED EMERGENCY</Text>
                <View style={styles.alarmPill}>
                  <Ionicons name="warning-outline" size={10} color="#EF4444" />
                  <Text style={styles.alarmPillText}>Alarm Lvl {ASSIGNED_INCIDENT.alarmLevel}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{ASSIGNED_INCIDENT.title}</Text>
              <Text style={styles.cardAddress} numberOfLines={1}>{ASSIGNED_INCIDENT.address}</Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.routeBtn, routeActive && styles.routeBtnClear]}
              onPress={routeActive ? clearRoute : getRoute}
              activeOpacity={0.85}
            >
              {isRouting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons
                    name={routeActive ? 'close-circle-outline' : 'navigate'}
                    size={15} color="#fff"
                  />
              }
              <Text style={styles.routeBtnText}>
                {isRouting ? 'Routing…' : routeActive ? 'Clear Route' : 'GET ROUTE'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.externalBtn} onPress={openInGoogleMaps} activeOpacity={0.8}>
              <Ionicons name="open-outline" size={16} color={COLORS.emerald} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* ── Bottom card: incident details + route info ──
          Hidden until GET ROUTE is pressed; slides up with spring animation. */}
      <Animated.View
        style={[
          styles.bottomCard,
          {
            opacity:   bottomAnim,
            transform: [{ translateY: bottomTranslate }],
          },
        ]}
        pointerEvents={routeActive ? 'auto' : 'none'}
      >
        <View style={styles.bottomTop}>
          <Image
            source={require('../assets/fire-incident.png')}
            style={styles.incidentThumb}
            resizeMode="cover"
          />
          <View style={styles.incidentInfo}>
            <View style={styles.citizenRow}>
              <Text style={styles.citizenName}>{ASSIGNED_INCIDENT.reportedBy}</Text>
              <View style={styles.levelBadge}>
                <Ionicons name="flame" size={10} color="#EF4444" />
                <Text style={styles.levelBadgeText}>Level 1</Text>
              </View>
            </View>
            <View style={styles.tsRow}>
              <Ionicons name="paper-plane-outline" size={11} color={COLORS.emerald} />
              <Text style={styles.tsLabel}>SUBMITTED</Text>
              <Text style={styles.tsValue}>{fmtDateTime(ASSIGNED_INCIDENT.submittedAt)}</Text>
            </View>
            <View style={styles.tsRow}>
              <Ionicons name="checkmark-done-outline" size={11} color="#3B82F6" />
              <Text style={styles.tsLabel}>ACKNOWLEDGED</Text>
              <Text style={styles.tsValue}>{fmtDateTime(ASSIGNED_INCIDENT.acknowledgedAt)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomDivider} />

        <View style={styles.routeStatsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconRow}>
              <Ionicons name="location" size={14} color="#F59E0B" />
              <Text style={styles.statValue}>{routeInfo?.distance ?? `${straightKm} km`}</Text>
            </View>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <View style={styles.statIconRow}>
              <Ionicons name="time" size={14} color="#3B82F6" />
              <Text style={styles.statValue}>{routeInfo?.duration ?? '—'}</Text>
            </View>
            <Text style={styles.statLabel}>ETA</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <View style={styles.statIconRow}>
              <View style={styles.codeRedDot} />
              <Text style={[styles.statValue, { color: '#EF4444' }]}>Code 3</Text>
            </View>
            <Text style={styles.statLabel}>Priority</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1 },

  assignCard: {
    position: 'absolute',
    top:   Platform.OS === 'ios' ? 56 : 48,
    left:  SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  cardAccentStripe: { height: 3, backgroundColor: '#EF4444' },
  cardInner:        { padding: SPACING.md },
  cardInfoRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  cardTypeIcon: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#EF4444',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 8, elevation: 6,
  },
  cardMetaRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 3 },
  cardMetaLabel: { fontSize: 9, fontWeight: '800', color: '#EF4444', letterSpacing: 1.5 },
  alarmPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  alarmPillText: { fontSize: 9, fontWeight: '700', color: '#EF4444' },
  cardTitle:     { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  cardAddress:   { fontSize: FONT_SIZES.sm, color: '#64748B', fontWeight: '500' },
  cardActions:   { flexDirection: 'row', gap: SPACING.sm },
  routeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.xs, backgroundColor: '#EF4444',
    paddingVertical: SPACING.sm + 2, borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 8, elevation: 6,
  },
  routeBtnClear: { backgroundColor: '#64748B', shadowColor: '#64748B' },
  routeBtnText:  { fontSize: FONT_SIZES.sm, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  externalBtn: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: `${COLORS.emerald}18`,
    borderWidth: 1.5, borderColor: `${COLORS.emerald}40`,
    justifyContent: 'center', alignItems: 'center',
  },

  bottomCard: {
    position: 'absolute',
    bottom: 100,
    left:   SPACING.md,
    right:  SPACING.md,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
  },
  bottomTop:     { flexDirection: 'row' },
  incidentThumb: { width: 90, height: 110 },
  incidentInfo:  { flex: 1, padding: SPACING.sm + 2, justifyContent: 'center', gap: 5 },

  citizenRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 3,
  },
  citizenName: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#0F172A', flex: 1 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  levelBadgeText: { fontSize: 9, fontWeight: '800', color: '#EF4444' },

  tsRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tsLabel:  { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase', width: 92 },
  tsValue:  { fontSize: 10, fontWeight: '600', color: '#334155', flex: 1 },

  bottomDivider: { height: 1, backgroundColor: 'rgba(239,68,68,0.12)' },

  routeStatsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.md,
  },
  statItem:    { alignItems: 'center', gap: 2 },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue:   { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#0F172A' },
  statLabel:   { fontSize: 9, fontWeight: '600', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase' },
  statSep:     { width: 1, height: 32, backgroundColor: 'rgba(0,0,0,0.08)' },
  codeRedDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
});
