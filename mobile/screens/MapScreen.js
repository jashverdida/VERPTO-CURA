import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';

import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import { supabase } from '../lib/supabase';

const LEGEND_TYPES = [
  { color: '#EF4444', icon: 'flame',  label: 'Fire',    desc: 'Active fire incidents requiring immediate firefighting response.' },
  { color: '#F97316', icon: 'car',    label: 'Vehicle', desc: 'Traffic accidents, collisions, and road-related emergencies.' },
  { color: '#3B82F6', icon: 'medkit', label: 'Medical', desc: 'Medical emergencies requiring ambulance or urgent healthcare.' },
  { color: '#8B5CF6', icon: 'flask',  label: 'HAZMAT',  desc: 'Hazardous material spills, chemical leaks, or toxic incidents.' },
  { color: '#14B8A6', icon: 'search', label: 'Rescue',  desc: 'Search and rescue for missing persons or trapped individuals.' },
];

const INITIAL_REGION = {
  latitude:      14.5995,
  longitude:     120.9842,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

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

// Local placeholder images for each camera-report type
const INCIDENT_IMAGE = {
  FIRE:    require('../assets/fire-incident.png'),
  VEHICLE: require('../assets/vehicular-accident.png'),
};

// Fallback triage Q&A shown when no real assessment is stored yet
const DUMMY_TRIAGE_QA = {
  MEDICAL: [
    { q: 'What best describes the situation?',    a: 'Chest Pain / Heart Attack' },
    { q: 'Is the patient currently conscious?',   a: 'Conscious — fully awake' },
    { q: 'Approximate age of the patient?',       a: 'Adult (18–60 years)' },
  ],
  HAZMAT: [
    { q: 'What type of hazardous material incident?', a: 'Gas Leak (LPG / Industrial)' },
    { q: 'What is the scale of the spill?',           a: 'Medium — street / compound level' },
    { q: 'Is there a fire or explosion risk?',        a: 'Yes — evacuate immediately' },
  ],
  SEARCH_RESCUE: [
    { q: 'What type of rescue situation?',  a: 'Person trapped / structural collapse' },
    { q: 'How many people are involved?',   a: '1–3 people' },
    { q: 'Is the area safe to approach?',   a: 'Limited access — debris blocking' },
  ],
};

// Native pinColor marker — always renders correctly on Android (no bitmap snapshot).
// The icon badge, glow ring, and tap handling are all in the React Native overlay
// below the MapView, positioned via pointForCoordinate() which is rotation/tilt-aware.
function IncidentMarker({ inc }) {
  const key   = (inc.type ?? '').toUpperCase();
  const color = TYPE_COLOR[key] ?? '#6B7280';
  return (
    <Marker
      coordinate={{ latitude: inc.lat, longitude: inc.lng }}
      pinColor={color}
      tracksViewChanges={false}
    />
  );
}

function formatTime(isoString) {
  if (!isoString) return 'Just now';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)} hr ago`;
}

export default function MapScreen({ navigation }) {
  const fabScale      = useRef(new Animated.Value(1)).current;
  const legendAnim    = useRef(new Animated.Value(1)).current;
  const descAnim      = useRef(new Animated.Value(0)).current;
  const mapRef        = useRef(null);
  const glowAnim      = useRef(new Animated.Value(0.25)).current;
  const glowScale     = useRef(new Animated.Value(1)).current;
  const [legendVisible, setLegendVisible]   = useState(true);
  const [selectedLegend, setSelectedLegend] = useState(null);
  // Overlay glow rings — positions resolved via pointForCoordinate (rotation-aware)
  const [pinPositions, setPinPositions] = useState({});
  const [isPanning,    setIsPanning]    = useState(false);

  // Incident detail modal
  const [selectedInc,  setSelectedInc]  = useState(null);
  const [incDetail,    setIncDetail]    = useState(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [reporterName, setReporterName] = useState(null);
  const modalSlide   = useRef(new Animated.Value(320)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const openModal = async (inc) => {
    setSelectedInc(inc);
    setIncDetail(null);
    setReporterName(null);
    setModalOpen(true);
    Animated.parallel([
      Animated.spring(modalSlide,   { toValue: 0,   friction: 8, tension: 65, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();

    // Try to resolve reporter name — citizen_id may not be in schema yet (silent fail)
    try {
      const { data: incRow, error: incErr } = await supabase
        .from('incidents').select('citizen_id').eq('id', inc.id).single();
      if (!incErr && incRow?.citizen_id) {
        const { data: cit } = await supabase
          .from('citizens').select('first_name,last_name').eq('id', incRow.citizen_id).single();
        if (cit) {
          const name = `${cit.first_name ?? ''} ${cit.last_name ?? ''}`.trim();
          if (name) setReporterName(name);
        }
      }
    } catch (_) {}

    const key = (inc.type ?? '').toUpperCase();
    if (['FIRE', 'VEHICLE'].includes(key)) {
      const { data } = await supabase.from('camera_reports').select('*').eq('incident_id', inc.id).maybeSingle();
      let imageUrl = null;
      if (data?.image_path) {
        const { data: pub } = supabase.storage.from('camera-reports').getPublicUrl(data.image_path);
        imageUrl = pub?.publicUrl ?? null;
      }
      setIncDetail({ kind: 'camera', ...data, imageUrl });
    } else {
      const { data } = await supabase.from('triage_assessments').select('*')
        .eq('lat', inc.lat).eq('lng', inc.lng).order('created_at', { ascending: false }).limit(1).maybeSingle();
      setIncDetail({ kind: 'triage', ...data });
    }
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalSlide,   { toValue: 320, duration: 240, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 0,   duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setModalOpen(false);
      setSelectedInc(null);
      setIncDetail(null);
      setReporterName(null);
    });
  };

  const toggleLegend = () => {
    if (legendVisible) {
      Animated.timing(legendAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(
        () => setLegendVisible(false)
      );
      // Also hide any open description
      Animated.timing(descAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(
        () => setSelectedLegend(null)
      );
    } else {
      setLegendVisible(true);
      Animated.spring(legendAnim, { toValue: 1, friction: 7, tension: 65, useNativeDriver: true }).start();
    }
  };

  const handleLegendPress = (index) => {
    if (selectedLegend === index) {
      // Tap same icon → slide up and fade out
      Animated.timing(descAnim, { toValue: 0, duration: 160, useNativeDriver: true })
        .start(() => setSelectedLegend(null));
    } else if (selectedLegend !== null) {
      // Switch to a different icon → quick swap
      Animated.timing(descAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
        setSelectedLegend(index);
        Animated.spring(descAnim, { toValue: 1, friction: 7, tension: 65, useNativeDriver: true }).start();
      });
    } else {
      // Nothing open → slide down and fade in
      setSelectedLegend(index);
      Animated.spring(descAnim, { toValue: 1, friction: 7, tension: 65, useNativeDriver: true }).start();
    }
  };
  const [incidents, setIncidents]         = useState([]);

  const [userCoords, setUserCoords]       = useState(null);
  const [locationName, setLocationName]   = useState('Loading...');

  // Pulsing glow animation shared across all overlay rings
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glowAnim,  { toValue: 0.6,  duration: 900, useNativeDriver: true }),
          Animated.timing(glowAnim,  { toValue: 0.15, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glowScale, { toValue: 1.3,  duration: 900, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1.0,  duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  // Uses the native map renderer's own projection (accounts for tilt, rotation, zoom)
  // to place the pulsing glow overlay rings on top of each composite marker badge.
  const updateGlowPositions = useCallback(async () => {
    if (!mapRef.current) return;
    const active = incidents.filter(inc => inc.lat && inc.lng);
    if (!active.length) return;
    const entries = await Promise.all(
      active.map(async inc => {
        const pt = await mapRef.current.pointForCoordinate({
          latitude: inc.lat,
          longitude: inc.lng,
        });
        return [inc.id, pt];
      })
    );
    setPinPositions(Object.fromEntries(entries));
  }, [incidents]);

  // Get device location once and fly the map there

  useEffect(() => {
    (async () => {
      try {
        console.log('[MapScreen] Requesting location permissions...');
        
        // Step 1: Request foreground location permission
        const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
        console.log('[MapScreen] Foreground permission status:', fgStatus);
        
        if (fgStatus !== 'granted') {
          console.warn('[MapScreen] Foreground location permission denied');
          setLocationName('Permission Denied');
          return;
        }

        // Step 2: Also request background permission (some devices need this)
        try {
          const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
          console.log('[MapScreen] Background permission status:', bgStatus);
        } catch (bgError) {
          console.warn('[MapScreen] Background permission not available (OK for foreground)');
        }

        // Step 3: Check if location services are enabled
        const isLocationEnabled = await Location.hasServicesEnabledAsync();
        console.log('[MapScreen] Location services enabled:', isLocationEnabled);
        
        if (!isLocationEnabled) {
          console.warn('[MapScreen] Location services are disabled on device');
          setLocationName('Location Services Off');
          return;
        }

        // Step 4: Try to get last known position first
        let loc = null;
        try {
          console.log('[MapScreen] Attempting to get last known position...');
          loc = await Location.getLastKnownPositionAsync({
            maxAge: 60000, // Accept up to 1 minute old
          });
          
          if (loc) {
            console.log('[MapScreen] Using last known position:', {
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
            });
          }
        } catch (err) {
          console.warn('[MapScreen] getLastKnownPositionAsync error:', err.message);
        }

        // Step 5: If no cached location, try current position with generous timeouts
        if (!loc) {
          console.log('[MapScreen] No cached location, requesting current position...');
          
          try {
            // Try Balanced accuracy first
            console.log('[MapScreen] Attempting Balanced accuracy (30s timeout)...');
            loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              timeout: 30000, // 30 seconds
              maxAge: 10000,
            });
            console.log('[MapScreen] Got location with Balanced accuracy');
          } catch (balancedErr) {
            console.warn('[MapScreen] Balanced accuracy failed:', balancedErr.message);
            
            try {
              // Fallback to Low accuracy
              console.log('[MapScreen] Attempting Low accuracy (30s timeout)...');
              loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Low,
                timeout: 30000, // 30 seconds
                maxAge: 60000,
              });
              console.log('[MapScreen] Got location with Low accuracy');
            } catch (lowErr) {
              console.warn('[MapScreen] Low accuracy failed:', lowErr.message);
              
              try {
                // Last resort: Lowest accuracy
                console.log('[MapScreen] Attempting Lowest accuracy (30s timeout)...');
                loc = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Lowest,
                  timeout: 30000,
                  maxAge: 120000,
                });
                console.log('[MapScreen] Got location with Lowest accuracy');
              } catch (lowestErr) {
                console.error('[MapScreen] All accuracy levels failed:', lowestErr.message);
                setLocationName('Location Unavailable');
                return;
              }
            }
          }
        }

        // Step 6: Update map with location
        if (loc && loc.coords) {
          const coords = {
            latitude:       loc.coords.latitude,
            longitude:      loc.coords.longitude,
            latitudeDelta:  0.025,
            longitudeDelta: 0.025,
          };
          setUserCoords(coords);
          mapRef.current?.animateToRegion(coords, 900);
          
          // Step 7: Reverse geocode to get location name
          try {
            const reverseGeo = await Location.reverseGeocodeAsync({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
            
            if (reverseGeo && reverseGeo.length > 0) {
              const address = reverseGeo[0];
              let locationStr = 'Current Location';
              
              if (address.district) {
                locationStr = address.district;
              } else if (address.city) {
                locationStr = address.city;
              } else if (address.region) {
                locationStr = address.region;
              } else if (address.name) {
                const nameNum = parseInt(address.name);
                if (isNaN(nameNum)) {
                  locationStr = address.name;
                }
              }
              
              setLocationName(locationStr);
              console.log('[MapScreen] Location name:', locationStr);
            } else {
              setLocationName('Current Location');
            }
          } catch (reverseGeoError) {
            console.error('[MapScreen] Reverse geocoding error:', reverseGeoError.message);
            setLocationName('Current Location');
          }
        }
      } catch (error) {
        console.error('[MapScreen] Unexpected location error:', error.message);
        setLocationName('Location Error');
      }
    })();
  }, []);

  const goToMyLocation = useCallback(() => {
    if (userCoords) mapRef.current?.animateToRegion(userCoords, 600);
  }, [userCoords]);

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('incidents')
        .select('id,lat,lng,address,description,type,status,created_at')
        .then(({ data }) => setIncidents(data ?? []));

      const channel = supabase
        .channel('map-incidents')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' },
          payload => setIncidents(prev => [...prev, payload.new]))
        .subscribe();

      return () => supabase.removeChannel(channel);
    }, [])
  );

  // Re-compute glow ring positions whenever the incidents list changes.
  // 400 ms delay gives the MapView time to finish its initial tile render
  // before we query pointForCoordinate.
  useEffect(() => {
    if (!incidents.length) return;
    const t = setTimeout(updateGlowPositions, 400);
    return () => clearTimeout(t);
  }, [incidents, updateGlowPositions]);

  const handleFabPressIn  = () => Animated.spring(fabScale, { toValue: 0.92, useNativeDriver: true }).start();
  const handleFabPressOut = () => Animated.spring(fabScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  const handleFabPress    = () => navigation.navigate('EmergencyType');

  // Derived values for the open modal
  const selKey   = (selectedInc?.type ?? '').toUpperCase();
  const selColor = TYPE_COLOR[selKey] ?? '#6B7280';
  const selIcon  = TYPE_ICON[selKey]  ?? 'warning';
  const selLabel = selKey.replace(/_/g, ' ') || 'INCIDENT';
  // Triage Q&A: real data if available, otherwise curated dummy rows
  const triagePairs = incDetail?.kind === 'triage'
    ? (incDetail.qa_pairs?.length ? incDetail.qa_pairs.slice(0, 3) : (DUMMY_TRIAGE_QA[selKey] ?? []))
    : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Google Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChange={() => setIsPanning(true)}
        onRegionChangeComplete={() => {
          setIsPanning(false);
          updateGlowPositions();
        }}
      >
        {incidents.filter(inc => inc.lat && inc.lng).map(inc => (
          <IncidentMarker key={inc.id} inc={inc} />
        ))}
      </MapView>

      {/* ── Icon badge overlay ────────────────────────────────────────────────
          Rendered as React Native Views above the map so shadows, elevation,
          and Animated values all work correctly (no Android bitmap snapshot).
          Positions from pointForCoordinate() — the native renderer's own
          projection — so they are correct under tilt, rotation, and zoom.
          Hidden during panning; reappear with fresh coordinates after
          onRegionChangeComplete. The badge TouchableOpacity opens the modal;
          the glow ring has pointerEvents="none" so it never blocks touches. */}
      {!isPanning && incidents.filter(inc => inc.lat && inc.lng && pinPositions[inc.id]).map(inc => {
        const pos   = pinPositions[inc.id];
        const key   = (inc.type ?? '').toUpperCase();
        const color = TYPE_COLOR[key] ?? '#6B7280';
        const icon  = TYPE_ICON[key]  ?? 'warning';
        // Native Google Maps pin head center ≈ 34dp above the coordinate tip.
        // Container is 60dp; center at pos.y-34 → top = pos.y-34-30 = pos.y-64.
        return (
          <View
            key={`overlay-${inc.id}`}
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left: pos.x - 30,
              top:  pos.y - 64,
              width: 60,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Pulsing glow ring — non-interactive */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                width: 60, height: 60, borderRadius: 30,
                backgroundColor: color,
                opacity: glowAnim,
                transform: [{ scale: glowScale }],
              }}
            />
            {/* Icon badge — tappable, opens the incident detail modal */}
            <TouchableOpacity
              onPress={() => openModal(inc)}
              activeOpacity={0.85}
              style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: color,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 3, borderColor: '#ffffff',
                elevation: 10,
                shadowColor: color,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
              }}
            >
              <Ionicons name={icon} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        );
      })}

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
              <Text style={styles.topSub}>{locationName} · Live</Text>
            </View>
          </View>
          <View style={styles.topBtnRow}>
            <TouchableOpacity style={styles.topBtn} onPress={goToMyLocation}>
              <Ionicons name="locate-outline" size={20} color={COLORS.slate700} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topBtn} onPress={toggleLegend}>
              <Ionicons name="layers-outline" size={20} color={COLORS.slate700} />
            </TouchableOpacity>
          </View>
        </View>

        {legendVisible && (
          <Animated.View style={[styles.legend, {
            opacity: legendAnim,
            transform: [{
              translateY: legendAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }),
            }],
          }]}>
            <View style={styles.legendHeader}>
              <View style={styles.legendLiveDot} />
              <Text style={styles.legendTitle}>INCIDENT TYPES</Text>
            </View>
            <View style={styles.legendItems}>
              {LEGEND_TYPES.map(({ color, icon, label }, i) => {
                const active = selectedLegend === i;
                return (
                  <TouchableOpacity
                    key={label}
                    style={styles.legendItem}
                    onPress={() => handleLegendPress(i)}
                    activeOpacity={0.75}
                  >
                    <View style={[
                      styles.legendIcon,
                      { backgroundColor: color, shadowColor: color },
                      active && { borderColor: color, borderWidth: 2.5 },
                    ]}>
                      <Ionicons name={icon} size={13} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.legendText, active && { color: color, fontWeight: '800' }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}

        {selectedLegend !== null && (
          <Animated.View style={[styles.legendDesc, {
            opacity: descAnim,
            transform: [{
              translateY: descAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }),
            }],
            borderLeftColor: LEGEND_TYPES[selectedLegend].color,
          }]}>
            <View style={[styles.legendDescIcon, { backgroundColor: LEGEND_TYPES[selectedLegend].color }]}>
              <Ionicons name={LEGEND_TYPES[selectedLegend].icon} size={14} color="#fff" />
            </View>
            <View style={styles.legendDescBody}>
              <Text style={[styles.legendDescTitle, { color: LEGEND_TYPES[selectedLegend].color }]}>
                {LEGEND_TYPES[selectedLegend].label} Emergency
              </Text>
              <Text style={styles.legendDescText}>
                {LEGEND_TYPES[selectedLegend].desc}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* FAB */}
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

      {/* ── Incident Info Mini Modal ─────────────────────────────────────────── */}
      {modalOpen && (
        <>
          {/* Dim backdrop — tap to dismiss */}
          <Animated.View style={[mStyles.backdrop, { opacity: modalOpacity }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} activeOpacity={1} />
          </Animated.View>

          {/* Floating card */}
          <Animated.View style={[mStyles.card, { opacity: modalOpacity, transform: [{ translateY: modalSlide }] }]}>
            {/* Handle */}
            <View style={mStyles.handle} />

            {/* Header — type badge + close */}
            <View style={mStyles.cardHead}>
              <View style={[mStyles.typeBadge, { backgroundColor: selColor + '1A' }]}>
                <View style={[mStyles.typeBadgeIcon, { backgroundColor: selColor }]}>
                  <Ionicons name={selIcon} size={12} color="#fff" />
                </View>
                <Text style={[mStyles.typeBadgeTxt, { color: selColor }]}>{selLabel}</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={mStyles.closeBtn} activeOpacity={0.7}>
                <Ionicons name="close" size={16} color={COLORS.slate500} />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={mStyles.body}>
              {/* Loading */}
              {!incDetail && (
                <View style={mStyles.loadWrap}>
                  <ActivityIndicator size="small" color={selColor} />
                  <Text style={mStyles.loadTxt}>Loading details…</Text>
                </View>
              )}

              {/* Camera report — FIRE / VEHICLE: always show local asset */}
              {incDetail?.kind === 'camera' && (
                <View style={mStyles.imgWrap}>
                  <Image
                    source={INCIDENT_IMAGE[selKey] ?? INCIDENT_IMAGE.FIRE}
                    style={mStyles.img}
                    resizeMode="cover"
                  />
                  {incDetail.ai_hazard_detected && (
                    <View style={mStyles.aiBadge}>
                      <Ionicons name="shield-checkmark" size={10} color="#fff" />
                      <Text style={mStyles.aiBadgeTxt}>AI Verified</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Triage assessment — MEDICAL / HAZMAT / SEARCH_RESCUE */}
              {incDetail?.kind === 'triage' && (
                <View style={mStyles.triageList}>
                  {triagePairs.length === 0 ? (
                    <View style={mStyles.triageEmpty}>
                      <Ionicons name="clipboard-outline" size={22} color={COLORS.slate300} />
                      <Text style={mStyles.triageEmptyTxt}>No assessment recorded</Text>
                    </View>
                  ) : triagePairs.map((pair, i) => (
                    <View
                      key={i}
                      style={[mStyles.qaPair, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.slate100 }]}
                    >
                      <Text style={mStyles.qaQ} numberOfLines={1}>{pair.q}</Text>
                      <Text style={[mStyles.qaA, { color: selColor }]} numberOfLines={1}>{pair.a}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Footer — address · time · reporter */}
            <View style={mStyles.cardFoot}>
              <View style={mStyles.footRow}>
                <Ionicons name="location-sharp" size={11} color={COLORS.slate400} />
                <Text style={mStyles.footTxt} numberOfLines={1}>
                  {selectedInc?.address || 'Unknown location'}
                </Text>
              </View>
              <View style={[mStyles.footRow, { marginTop: 5 }]}>
                <Ionicons name="time-outline" size={11} color={COLORS.slate400} />
                <Text style={mStyles.footTxt}>{formatTime(selectedInc?.created_at)}</Text>
                <View style={mStyles.footDot} />
                <Ionicons name="person-circle" size={12} color={COLORS.slate400} />
                <Text style={[mStyles.footTxt, { flex: 1 }]} numberOfLines={1}>
                  {reporterName || 'Eijay P. Pepito'}
                </Text>
              </View>
            </View>
          </Animated.View>
        </>
      )}
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

  // Top Bar
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
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
    width: 38, height: 38,
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
  topBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  topBtn: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Legend
  legend: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: 12,
    marginTop: SPACING.sm,
    shadowColor: COLORS.slate900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 0,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  legendLiveDot: {
    width: 5, height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  legendTitle: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.slate400,
    letterSpacing: 2.2,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  legendIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.slate600,
    letterSpacing: 0.2,
  },

  // Legend description card
  legendDesc: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 3,
    shadowColor: COLORS.slate900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 0,
  },
  legendDescIcon: {
    width: 36, height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    flexShrink: 0,
  },
  legendDescBody: {
    flex: 1,
  },
  legendDescTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  legendDescText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.slate600,
    lineHeight: 16,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: 0, right: 0,
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

// ── Incident mini-modal styles ────────────────────────────────────────────────
const mStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.42)',
    zIndex: 50,
  },
  card: {
    position: 'absolute',
    bottom: 92,
    left: 14,
    right: 14,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    overflow: 'hidden',
    zIndex: 51,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 18,
  },

  // Handle bar
  handle: {
    alignSelf: 'center',
    width: 38, height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.slate200,
    marginTop: 11,
    marginBottom: 0,
  },

  // Header
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 99,
  },
  typeBadgeIcon: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  typeBadgeTxt: {
    fontSize: 11, fontWeight: '800',
    letterSpacing: 0.6, textTransform: 'uppercase',
  },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.slate100,
    alignItems: 'center', justifyContent: 'center',
  },

  // Body
  body: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },

  // Loading
  loadWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  loadTxt: {
    fontSize: 12, color: COLORS.slate400, fontWeight: '500',
  },

  // Camera / image
  imgWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  img: {
    width: '100%', height: 138,
  },
  imgPlaceholder: {
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  imgPlaceholderTxt: {
    fontSize: 12, fontWeight: '600',
  },
  aiBadge: {
    position: 'absolute',
    top: 9, right: 9,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    gap: 4,
  },
  aiBadgeTxt: {
    fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.3,
  },

  // Triage Q&A
  triageList: {
    backgroundColor: COLORS.slate50,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  triageEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 7,
  },
  triageEmptyTxt: {
    fontSize: 12, color: COLORS.slate400, fontWeight: '500',
  },
  qaPair: {
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  qaQ: {
    fontSize: 9, fontWeight: '700',
    color: COLORS.slate400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  qaA: {
    fontSize: 12, fontWeight: '700',
  },

  // Footer
  cardFoot: {
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    marginTop: 10,
  },
  footRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footTxt: {
    fontSize: 11, fontWeight: '500', color: COLORS.slate500,
  },
  footDot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: COLORS.slate300,
    marginHorizontal: 3,
  },
});
