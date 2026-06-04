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
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
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

// ── Incident callout card ─────────────────────────────────────────────────────
// react-native-maps View-child bitmap capture is broken in this environment —
// even a plain 52×52 circle with no stem still showed partial. Root cause:
// the Google Maps native renderer on Android doesn't composite React Native
// View bitmaps reliably in this SDK/device combination.
//
// Solution: use native pinColor (always renders correctly) + a styled Callout
// that shows the icon, type label, address and time on tap.
function IncidentCallout({ inc }) {
  const key   = (inc.type ?? '').toUpperCase();
  const color = TYPE_COLOR[key] ?? '#6B7280';
  const icon  = TYPE_ICON[key]  ?? 'warning';
  return (
    <View style={calloutStyles.wrap}>
      <View style={[calloutStyles.badge, { backgroundColor: color }]}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <View style={calloutStyles.info}>
        <Text style={[calloutStyles.type, { color }]}>
          {key.replace('_', ' ')}
        </Text>
        <Text style={calloutStyles.address} numberOfLines={2}>
          {inc.address || 'Unknown location'}
        </Text>
        <Text style={calloutStyles.time}>{formatTime(inc.created_at)}</Text>
      </View>
    </View>
  );
}

const calloutStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    gap: 10,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  badge: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  info: { flex: 1 },
  type: {
    fontSize: 11, fontWeight: '800', letterSpacing: 0.5,
    textTransform: 'uppercase', marginBottom: 2,
  },
  address: {
    fontSize: 12, fontWeight: '600', color: '#1E293B', lineHeight: 16,
  },
  time: {
    fontSize: 11, color: '#94A3B8', fontWeight: '500', marginTop: 2,
  },
});

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
  const [legendVisible, setLegendVisible]   = useState(true);
  const [selectedLegend, setSelectedLegend] = useState(null);
  // Screen positions for icon badge overlay (React Native Views on top of native pins)
  const [pinPositions, setPinPositions] = useState({});
  const [mapPanning, setMapPanning]     = useState(false);

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

  const updatePinPositions = useCallback(async (currentIncidents) => {
    if (!mapRef.current) return;
    const active = (currentIncidents ?? incidents).filter(inc => inc.lat && inc.lng);
    if (!active.length) return;
    const positions = {};
    await Promise.all(active.map(async inc => {
      try {
        const pt = await mapRef.current.pointForCoordinate({ latitude: inc.lat, longitude: inc.lng });
        positions[inc.id] = pt;
      } catch (_) {}
    }));
    setPinPositions(positions);
  }, [incidents]);
  const [userCoords, setUserCoords]       = useState(null);
  const [locationName, setLocationName]   = useState('Loading...');

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

  const handleFabPressIn  = () => Animated.spring(fabScale, { toValue: 0.92, useNativeDriver: true }).start();
  const handleFabPressOut = () => Animated.spring(fabScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  const handleFabPress    = () => navigation.navigate('EmergencyType');

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
        onMapReady={() => updatePinPositions()}
        onRegionChange={() => setMapPanning(true)}
        onRegionChangeComplete={() => { setMapPanning(false); updatePinPositions(); }}
      >
        {incidents.filter(inc => inc.lat && inc.lng).map(inc => {
          const key = (inc.type ?? '').toUpperCase();
          const color = TYPE_COLOR[key] ?? '#6B7280';
          return (
            <Marker
              key={inc.id}
              coordinate={{ latitude: inc.lat, longitude: inc.lng }}
              pinColor={color}
            >
              <Callout tooltip>
                <IncidentCallout inc={inc} />
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* ── Icon badges on pin heads ──────────────────────────────────────────
          React Native Views (not bitmap-captured markers) placed over each
          native pin's round head using pointForCoordinate screen positions.
          Hidden during panning so they don't visually lag behind the map. */}
      {!mapPanning && incidents.filter(inc => inc.lat && inc.lng && pinPositions[inc.id]).map(inc => {
        const pos = pinPositions[inc.id];
        const key  = (inc.type ?? '').toUpperCase();
        const color = TYPE_COLOR[key] ?? '#6B7280';
        const icon  = TYPE_ICON[key]  ?? 'warning';
        return (
          <View
            key={`badge-${inc.id}`}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: pos.x - 22,
              top:  pos.y - 56,   // centered on native pin head
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: color,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 3,
              borderColor: 'rgba(255,255,255,0.95)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.35,
              shadowRadius: 6,
              elevation: 10,
            }}
          >
            <Ionicons name={icon} size={22} color="#fff" />
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

  // Callout bubble
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
