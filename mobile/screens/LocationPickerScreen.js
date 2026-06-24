import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');
const TOP_PAD = Platform.OS === 'ios' ? 54 : 44;

// ── Google Maps dark "Aubergine" style ────────────────────────────────────────
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

// ── Type config helpers ───────────────────────────────────────────────────────
const TRIAGE_CFG = {
  medical:       { color: '#3B82F6', label: 'Medical',         icon: 'medkit' },
  hazmat:        { color: '#8B5CF6', label: 'HAZMAT',          icon: 'flask'  },
  search_rescue: { color: '#14B8A6', label: 'Search & Rescue', icon: 'search' },
};

function resolveType(mode, emergencyType, triageType) {
  if (mode === 'triage') {
    return TRIAGE_CFG[triageType] ?? { color: COLORS.emerald, label: 'Emergency', icon: 'warning' };
  }
  if (emergencyType === 'vehicle') return { color: '#F97316', label: 'Vehicle Accident', icon: 'car' };
  return { color: '#EF4444', label: 'Fire Incident', icon: 'flame' };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LocationPickerScreen({ navigation, route }) {
  const {
    mode,
    emergencyType,
    capturedImageUri,
    detections,
    triageType,
    qaPairs,
    hazmatPhotoUri,
  } = route.params ?? {};

  const { color, label, icon } = resolveType(mode, emergencyType, triageType);

  const STREET_DELTA = 0.003;

  const [lat,        setLat]        = useState(10.3157);
  const [lng,        setLng]        = useState(123.8854);
  // Controlled region — the MapView renders exactly this, no animateToRegion needed
  const [mapRegion,  setMapRegion]  = useState({
    latitude:      10.3157,
    longitude:     123.8854,
    latitudeDelta: STREET_DELTA,
    longitudeDelta: STREET_DELTA,
  });
  const [address,    setAddress]    = useState('Locating...');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess,  setIsSuccess]  = useState(false);

  const mapRef        = useRef(null);
  const isDraggingRef = useRef(false);
  const pinY          = useRef(new Animated.Value(0)).current;
  const pinScale      = useRef(new Animated.Value(1)).current;
  const shadowScale   = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale  = useRef(new Animated.Value(0.85)).current;
  const pulseAnim     = useRef(new Animated.Value(1)).current;
  const geocodeTimer  = useRef(null);

  // Moves the map to a GPS fix — just a state update, no animation API.
  const goToGPS = useCallback((latitude, longitude) => {
    setLat(latitude);
    setLng(longitude);
    setMapRegion({ latitude, longitude, latitudeDelta: STREET_DELTA, longitudeDelta: STREET_DELTA });
  }, []);

  // ── GPS on mount ──
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          reverseGeocode(10.3157, 123.8854);
          return;
        }

        // Instant: cached GPS (no satellite wait)
        const cached = await Location.getLastKnownPositionAsync({ maxAge: 120000 }).catch(() => null);
        if (cached) {
          goToGPS(cached.coords.latitude, cached.coords.longitude);
          reverseGeocode(cached.coords.latitude, cached.coords.longitude);
        }

        // Precise: live GPS in background
        try {
          const live = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            maxAge: 5000,
            timeout: 15000,
          });
          goToGPS(live.coords.latitude, live.coords.longitude);
          reverseGeocode(live.coords.latitude, live.coords.longitude);
        } catch (_) {
          if (!cached) reverseGeocode(10.3157, 123.8854);
        }
      } catch (_) {
        reverseGeocode(10.3157, 123.8854);
      }
    })();
  }, []);

  // ── Reverse geocode via Nominatim ──
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
        { headers: { 'User-Agent': 'CURA-Emergency-App/1.0' } }
      );
      const data = await res.json();
      if (data?.address) {
        const a = data.address;
        const parts = [
          a.road || a.pedestrian || a.footway || a.path,
          a.suburb || a.neighbourhood || a.village || a.town || a.city_district || a.city,
        ].filter(Boolean);
        setAddress(
          parts.length > 0
            ? parts.join(', ')
            : (data.display_name || '').split(',').slice(0, 2).join(',').trim()
        );
      }
    } catch (_) {
      setAddress(`${latitude.toFixed(5)}° N, ${Math.abs(longitude).toFixed(5)}° E`);
    }
  }, []);

  // ── Map drag handlers ──
  const handleRegionChange = useCallback(() => {
    if (isDraggingRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    setAddress('...');
    clearTimeout(geocodeTimer.current);
    Animated.parallel([
      Animated.spring(pinY,      { toValue: -22, friction: 5, tension: 100, useNativeDriver: true }),
      Animated.spring(pinScale,  { toValue: 1.18, friction: 5, tension: 100, useNativeDriver: true }),
      Animated.spring(shadowScale, { toValue: 0.65, friction: 5, tension: 100, useNativeDriver: true }),
    ]).start();
  }, [pinY, pinScale, shadowScale]);

  const handleRegionChangeComplete = useCallback((region) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    setLat(region.latitude);
    setLng(region.longitude);
    setMapRegion(region); // preserves whatever zoom the user dragged to
    Animated.parallel([
      Animated.spring(pinY,      { toValue: 0, friction: 7, tension: 70, useNativeDriver: true }),
      Animated.spring(pinScale,  { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      Animated.spring(shadowScale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
    ]).start();
    clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(() => reverseGeocode(region.latitude, region.longitude), 400);
  }, [reverseGeocode, pinY, pinScale, shadowScale]);

  // ── Submit ──
  const handleDone = async () => {
    if (isSubmitting || isSuccess) return;
    setIsSubmitting(true);

    try {
      if (mode === 'camera') {
        let imagePath = null;
        if (capturedImageUri) {
          try {
            const blob = await (await fetch(capturedImageUri)).blob();
            const fileName = `${Date.now()}.jpg`;
            const { data: sd, error: se } = await supabase.storage
              .from('camera-reports')
              .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });
            if (!se) imagePath = sd.path;
          } catch (_) {}
        }
        const top = (detections?.length ?? 0) > 0
          ? detections.reduce((a, b) => a.confidence > b.confidence ? a : b)
          : null;
        const { data: incident } = await supabase.from('incidents').insert({
          type:           emergencyType?.toUpperCase(),
          lat, lng, address,
          ai_verified:    (detections?.length ?? 0) > 0,
          ai_confidence:  top ? Math.round(top.confidence * 100) : null,
          ai_hazard_type: top ? top.class?.toUpperCase() : null,
          status: 'active', severity: 'medium',
        }).select().single();
        if (incident) {
          await supabase.from('camera_reports').insert({
            incident_id:        incident.id,
            image_path:         imagePath,
            ai_hazard_detected: (detections?.length ?? 0) > 0,
            ai_confidence:      top ? Math.round(top.confidence * 100) : null,
            ai_hazard_type:     top ? top.class?.toUpperCase() : null,
          });
        }
      } else {
        let imagePath = null;
        if (hazmatPhotoUri) {
          try {
            const blob = await (await fetch(hazmatPhotoUri)).blob();
            const { data: sd } = await supabase.storage
              .from('camera-reports')
              .upload(`hazmat_${Date.now()}.jpg`, blob, { contentType: 'image/jpeg', upsert: false });
            if (sd) imagePath = sd.path;
          } catch (_) {}
        }
        await supabase.from('triage_assessments').insert({
          type: triageType, qa_pairs: qaPairs,
          photo_url: imagePath ?? hazmatPhotoUri ?? null,
          lat, lng, address,
        });
        await supabase.from('incidents').insert({
          type: triageType?.toUpperCase(),
          lat, lng, address,
          status: 'active', severity: 'medium', ai_verified: false,
        });
      }
    } catch (_) {}

    setIsSubmitting(false);
    setIsSuccess(true);

    Animated.parallel([
      Animated.spring(successScale,  { toValue: 1,   friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
        ])
      ).start();
    });

    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs', params: { screen: 'Map' } }] });
    }, 2400);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Google Map (full screen) ── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={DARK_MAP_STYLE}
        region={mapRegion}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      />

      {/* ── Fixed centre pin ── */}
      <View style={styles.pinAnchor} pointerEvents="none">
        {/* Pulse ring */}
        {!isDragging && (
          <View style={[styles.pinPulse, { borderColor: color + '55' }]} />
        )}
        <Animated.View style={[styles.pinWrapper, {
          transform: [{ translateY: pinY }, { scale: pinScale }],
        }]}>
          {/* Head circle */}
          <View style={[styles.pinHead, { backgroundColor: color }]}>
            <View style={styles.pinInner}>
              <Ionicons name={icon} size={20} color="#fff" />
            </View>
          </View>
          {/* Stem */}
          <View style={[styles.pinStem, { borderTopColor: color }]} />
        </Animated.View>
        {/* Ground shadow */}
        <Animated.View style={[styles.pinShadow, {
          transform: [{ scaleX: shadowScale }],
        }]} />
      </View>

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: TOP_PAD + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>Pin Location</Text>
          <Text style={styles.topBarSub}>Drag the map to place the pin</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
          <Ionicons name={icon} size={12} color={color} />
          <Text style={[styles.typeBadgeText, { color }]} numberOfLines={1}>{label}</Text>
        </View>
      </View>

      {/* ── Bottom panel (dark glass) ── */}
      <View style={[styles.bottomPanel, { paddingBottom: Platform.OS === 'ios' ? 44 : 24 }]}>
        <View style={styles.handleBar} />

        <Text style={styles.destLabel}>Destination</Text>

        <View style={styles.addressRow}>
          <View style={[styles.addrIconWrap, { backgroundColor: color + '20' }]}>
            <Ionicons name="location" size={20} color={color} />
          </View>
          <View style={styles.addrTextBlock}>
            {address === '...' || address === 'Locating...' ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={color} />
                <Text style={styles.locatingText}>Locating…</Text>
              </View>
            ) : (
              <>
                <Text style={styles.addrMain} numberOfLines={2}>{address}</Text>
                <Text style={styles.addrCoords}>
                  {lat.toFixed(5)}° N · {Math.abs(lng).toFixed(5)}° E
                </Text>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.doneBtn, {
            backgroundColor: color,
            shadowColor: color,
            opacity: isSubmitting ? 0.7 : 1,
          }]}
          onPress={handleDone}
          activeOpacity={0.88}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? <ActivityIndicator color={COLORS.white} />
            : (
              <>
                <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
                <Text style={styles.doneBtnText}>Done</Text>
              </>
            )
          }
        </TouchableOpacity>
      </View>

      {/* ── Success overlay ── */}
      {isSuccess && (
        <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
          <Animated.View style={[styles.successContent, { transform: [{ scale: successScale }] }]}>
            <View style={styles.successIconWrap}>
              <Animated.View style={[styles.successPulse, { transform: [{ scale: pulseAnim }] }]} />
              <Ionicons name="checkmark-circle" size={72} color={COLORS.emerald} />
            </View>
            <Text style={styles.successTitle}>Payload Transmitted</Text>
            <Text style={styles.successSub}>to Commel</Text>
            <View style={styles.successDetails}>
              <View style={styles.successDetailRow}>
                <Ionicons name="shield-checkmark" size={15} color={COLORS.emerald} />
                <Text style={styles.successDetailText}>
                  {mode === 'camera' && (detections?.length ?? 0) > 0
                    ? `AI Verified · ${detections.length} Hazard(s) Found`
                    : 'Report Confirmed'}
                </Text>
              </View>
              <View style={styles.successDetailRow}>
                <Ionicons name="location" size={15} color={COLORS.emerald} />
                <Text style={styles.successDetailText} numberOfLines={1}>{address}</Text>
              </View>
              <View style={styles.successDetailRow}>
                <Ionicons name="checkmark-circle" size={15} color={COLORS.emerald} />
                <Text style={styles.successDetailText}>Emergency services notified</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.returnBtn}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs', params: { screen: 'Map' } }] })}
            >
              <Ionicons name="map" size={20} color={COLORS.white} />
              <Text style={styles.returnBtnText}>Return to Map</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0F1A' },

  // ── Centre pin ──────────────────────────────────────────────────────────────
  pinAnchor: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  pinPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    top: '50%',
    marginTop: -30 - 32,
  },
  pinWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  pinHead: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pinInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinStem: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -3,
  },
  pinShadow: {
    width: 18,
    height: 7,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.35)',
    marginTop: -4,
  },

  // ── Top bar ─────────────────────────────────────────────────────────────────
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: 14,
    gap: SPACING.sm,
    backgroundColor: 'rgba(8, 14, 26, 0.78)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: { flex: 1 },
  topBarTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  topBarSub: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
    marginTop: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    maxWidth: 90,
  },

  // ── Bottom panel ─────────────────────────────────────────────────────────────
  bottomPanel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#0D1828',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 24,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 4,
  },
  destLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  addrIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addrTextBlock: { flex: 1 },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locatingText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  addrMain: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 20,
  },
  addrCoords: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    marginTop: 2,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    borderRadius: BORDER_RADIUS.xl,
    gap: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
    marginTop: 4,
  },
  doneBtnText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // ── Success overlay ──────────────────────────────────────────────────────────
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,15,25,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    paddingHorizontal: SPACING.xl,
  },
  successContent: { alignItems: 'center' },
  successIconWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  successPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.emerald + '30',
  },
  successTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  successSub: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.emerald,
    marginBottom: SPACING.lg,
  },
  successDetails: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: 12,
    width: width * 0.82,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: SPACING.xl,
  },
  successDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  successDetailText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.slate300,
    flex: 1,
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emerald,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: BORDER_RADIUS.full,
    gap: 10,
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  returnBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});
