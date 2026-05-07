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

function markerColor(type) {
  return TYPE_COLOR[type] ?? '#6B7280';
}

function formatTime(isoString) {
  if (!isoString) return 'Just now';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)} hr ago`;
}

export default function MapScreen({ navigation }) {
  const fabScale   = useRef(new Animated.Value(1)).current;
  const mapRef     = useRef(null);
  const [legendVisible, setLegendVisible] = useState(true);
  const [incidents, setIncidents]         = useState([]);
  const [userCoords, setUserCoords]       = useState(null);

  // Get device location once and fly the map there
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude:       loc.coords.latitude,
        longitude:      loc.coords.longitude,
        latitudeDelta:  0.025,
        longitudeDelta: 0.025,
      };
      setUserCoords(coords);
      mapRef.current?.animateToRegion(coords, 900);
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
      >
        {incidents.filter(inc => inc.lat && inc.lng).map(inc => (
          <Marker
            key={inc.id}
            coordinate={{ latitude: inc.lat, longitude: inc.lng }}
            pinColor={markerColor(inc.type)}
          >
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Text style={styles.calloutType}>{inc.type ?? 'INCIDENT'}</Text>
                <Text style={styles.calloutAddress} numberOfLines={2}>
                  {inc.address || 'Unknown location'}
                </Text>
                {inc.description ? (
                  <Text style={styles.calloutDesc} numberOfLines={2}>{inc.description}</Text>
                ) : null}
                <Text style={styles.calloutTime}>{formatTime(inc.created_at)}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

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
          <View style={styles.topBtnRow}>
            <TouchableOpacity style={styles.topBtn} onPress={goToMyLocation}>
              <Ionicons name="locate-outline" size={20} color={COLORS.slate700} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topBtn} onPress={() => setLegendVisible(v => !v)}>
              <Ionicons name="layers-outline" size={20} color={COLORS.slate700} />
            </TouchableOpacity>
          </View>
        </View>

        {legendVisible && (
          <View style={styles.legend}>
            {[
              { color: '#EF4444', label: 'Fire' },
              { color: '#F97316', label: 'Vehicle' },
              { color: '#3B82F6', label: 'Medical' },
              { color: '#8B5CF6', label: 'HAZMAT' },
              { color: '#14B8A6', label: 'Rescue' },
            ].map(({ color, label }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <View style={styles.legendDivider} />}
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={styles.legendText}>{label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
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
  callout: {
    width: 200,
    padding: 10,
  },
  calloutType: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 1,
    marginBottom: 3,
  },
  calloutAddress: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  calloutDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  calloutTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
    ...SHADOWS.small,
    gap: 8,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10, height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate600,
  },
  legendDivider: {
    width: 1, height: 12,
    backgroundColor: COLORS.slate200,
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
