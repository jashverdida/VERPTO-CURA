import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Animated,
  Modal,
  Platform,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import { addFireReport } from '../constants/SharedState';

const { width, height } = Dimensions.get('window');

// ── Dummy reverse-geocode ──────────────────────────────────────────────────────
const STREET_NAMES = [
  'Burgos St', 'Rizal Ave', 'Mabini St', 'Quezon Blvd',
  'España Blvd', 'P. Casal St', 'Carriedo St', 'Taft Ave',
  'UN Ave', 'Pedro Gil St', 'Lepanto St', 'Ongpin St',
];
function getDummyAddress(lat, lng) {
  const idx = Math.abs(Math.floor((lat * 1000 + lng * 100))) % STREET_NAMES.length;
  const num = Math.abs(Math.floor((lat + lng) * 500)) % 300 + 10;
  return `${num} ${STREET_NAMES[idx]}, Barangay 123, Manila`;
}

// ── Leaflet full-screen location picker HTML ──────────────────────────────────
const LOCATION_PICKER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body,#map{width:100%;height:100%;}
    body{overflow:hidden;background:#F1F5F9;}

    /* ── Centre pin ── */
    #center-pin{
      position:fixed;top:50%;left:50%;
      transform:translate(-50%,-100%);
      z-index:1000;pointer-events:none;
      display:flex;flex-direction:column;align-items:center;
    }
    .pin-head{
      width:52px;height:52px;
      background:linear-gradient(145deg,#FF4500,#EF4444);
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 6px 24px rgba(239,68,68,0.6);
      display:flex;align-items:center;justify-content:center;
      border:3px solid rgba(255,255,255,0.95);
    }
    .pin-emoji{transform:rotate(45deg);font-size:24px;line-height:1;}
    .pin-shadow{
      width:14px;height:7px;
      background:rgba(0,0,0,0.2);
      border-radius:50%;margin-top:3px;
      filter:blur(2px);
    }

    /* ── Pulse ring ── */
    #pulse-ring{
      position:fixed;top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:86px;height:86px;
      border:2px dashed rgba(239,68,68,0.4);
      border-radius:50%;z-index:999;
      pointer-events:none;
      animation:pulse 2.4s ease-in-out infinite;
    }
    @keyframes pulse{
      0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.45;}
      50%{transform:translate(-50%,-50%) scale(1.28);opacity:0.8;}
    }

    /* ── Drag hint ── */
    #drag-hint{
      position:fixed;bottom:14px;left:50%;
      transform:translateX(-50%);
      background:rgba(15,23,42,0.78);
      color:#fff;font-size:12px;font-weight:700;
      padding:7px 18px;border-radius:24px;z-index:1001;
      pointer-events:none;letter-spacing:0.3px;
      transition:opacity 0.4s;white-space:nowrap;
    }
    #drag-hint.hidden{opacity:0;}

    .leaflet-control-zoom,.leaflet-control-attribution{display:none!important;}
  </style>
</head>
<body>
<div id="map"></div>
<div id="pulse-ring"></div>
<div id="center-pin">
  <div class="pin-head"><span class="pin-emoji">🔥</span></div>
  <div class="pin-shadow"></div>
</div>
<div id="drag-hint">Drag map to pin location</div>
<script>
  var map=L.map('map',{
    center:[14.5995,120.9842],zoom:17,
    zoomControl:false,attributionControl:false,
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);

  var hint=document.getElementById('drag-hint');
  var hintTimer;

  function sendCenter(){
    var c=map.getCenter();
    if(window.ReactNativeWebView){
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'loc',lat:c.lat,lng:c.lng}));
    }
  }

  map.on('movestart',function(){
    hint.classList.add('hidden');
    clearTimeout(hintTimer);
  });
  map.on('moveend',function(){
    sendCenter();
    hintTimer=setTimeout(function(){hint.classList.remove('hidden');},2400);
  });

  setTimeout(sendCenter,600);
</script>
</body>
</html>
`;

export default function ReportScreen({ navigation, route }) {
  const photoUri = route.params?.photoUri || null;
  const emergencyType = route.params?.emergencyType || 'fire';

  const isVehicle = emergencyType === 'vehicle';
  const typeLabel = isVehicle ? 'Vehicle Accident' : 'Fire Incident';
  const typeColor = isVehicle ? '#F97316' : '#EF4444';
  const typeEmoji = isVehicle ? '🚗' : '🔥';

  const [description, setDescription] = useState('');
  const [selectedLat, setSelectedLat] = useState(14.5995);
  const [selectedLng, setSelectedLng] = useState(120.9842);

  // Pending state lives inside the picker modal; only commits on "Select Location"
  const [pendingLat, setPendingLat] = useState(14.5995);
  const [pendingLng, setPendingLng] = useState(120.9842);

  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const confirmScale = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.82)).current;
  const successCheckScale = useRef(new Animated.Value(0)).current;

  const address = getDummyAddress(selectedLat, selectedLng);
  const pendingAddress = getDummyAddress(pendingLat, pendingLng);

  // ── Location picker handlers ──
  const handlePickerMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'loc') {
        setPendingLat(data.lat);
        setPendingLng(data.lng);
      }
    } catch (e) {}
  }, []);

  const openLocationPicker = () => {
    // Start pending from currently confirmed location
    setPendingLat(selectedLat);
    setPendingLng(selectedLng);
    setLocationPickerVisible(true);
  };

  const confirmLocation = () => {
    setSelectedLat(pendingLat);
    setSelectedLng(pendingLng);
    setLocationPickerVisible(false);
  };

  const cancelLocation = () => {
    setLocationPickerVisible(false);
  };

  // ── Submit report ──
  const handleConfirm = () => {
    if (confirming || confirmed) return;
    setConfirming(true);

    Animated.sequence([
      Animated.timing(confirmScale, { toValue: 0.93, duration: 90, useNativeDriver: true }),
      Animated.timing(confirmScale, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();

    addFireReport({
      lat: selectedLat,
      lng: selectedLng,
      address,
      description: description.trim() || 'Fire emergency reported by citizen.',
      photoUri,
      aiAnalysis:
        'Thermal anomaly confirmed at reported location. Citizen-submitted fire incident. Hazard classification: active combustion. AI confidence: 94%. Emergency response has been dispatched.',
    });

    setTimeout(() => {
      setConfirmed(true);
      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(successOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start(() => {
        Animated.spring(successCheckScale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }).start();
      });

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { screen: 'Map' } }],
        });
      }, 2000);
    }, 350);
  };

  const topPad = Platform.OS === 'ios' ? 54 : 44;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.slate700} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Report {typeLabel}</Text>
          <Text style={styles.headerSub}>Confirm details before submitting</Text>
        </View>
        <View style={styles.urgentBadge}>
          <View style={styles.urgentDot} />
          <Text style={styles.urgentText}>Urgent</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Photo Section ── */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <Ionicons name="camera" size={15} color={COLORS.slate600} />
              <Text style={styles.sectionLabel}>Captured Image</Text>
              <View style={[styles.fireBadge, { backgroundColor: typeColor + '18' }]}>
                <Text style={styles.fireBadgeEmoji}>{typeEmoji}</Text>
                <Text style={[styles.fireBadgeText, { color: typeColor }]}>{isVehicle ? 'Accident' : 'Fire'}</Text>
              </View>
            </View>
            <View style={styles.photoCard}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
              ) : (
                <View style={[styles.photo, styles.photoPlaceholder]}>
                  <Text style={styles.placeholderEmoji}>{typeEmoji}</Text>
                  <Text style={styles.placeholderTitle}>{typeLabel}</Text>
                  <Text style={styles.placeholderSub}>Photo captured</Text>
                </View>
              )}
              <View style={styles.photoOverlay}>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={11} color={COLORS.white} />
                  <Text style={styles.verifiedText}>AI Verified</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Description ── */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <Ionicons name="create-outline" size={15} color={COLORS.slate600} />
              <Text style={styles.sectionLabel}>
                Additional Details
                <Text style={styles.optionalTag}> · Optional</Text>
              </Text>
            </View>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                placeholder="Describe what you see — floors involved, people nearby, fire size..."
                placeholderTextColor={COLORS.slate400}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* ── Location (tappable row) ── */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <Ionicons name="location" size={15} color={COLORS.fireRed} />
              <Text style={styles.sectionLabel}>Pin Location</Text>
            </View>

            <TouchableOpacity
              style={styles.locationRow}
              onPress={openLocationPicker}
              activeOpacity={0.75}
            >
              <View style={styles.locationIconWrap}>
                <Ionicons name="location" size={18} color={COLORS.fireRed} />
              </View>
              <View style={styles.locationTextBlock}>
                <Text style={styles.locationAddress}>{address}</Text>
                <Text style={styles.locationCoords}>
                  {selectedLat.toFixed(5)}° N, {Math.abs(selectedLng).toFixed(5)}° E
                </Text>
              </View>
              <View style={styles.locationChevronWrap}>
                <Ionicons name="map" size={15} color={COLORS.fireRed} />
                <Text style={styles.locationChangeTap}>Change</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>

        {/* ── Confirm Footer ── */}
        <View style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md }]}>
          <Animated.View style={{ transform: [{ scale: confirmScale }] }}>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: typeColor, shadowColor: typeColor }, confirming && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              activeOpacity={0.9}
            >
              <Ionicons name={isVehicle ? 'car' : 'flame'} size={22} color={COLORS.white} />
              <Text style={styles.confirmBtnText}>Confirm Emergency Report</Text>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.65)" />
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.disclaimer}>
            This will immediately alert emergency responders in your area.
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* ── Full-screen Location Picker Modal ── */}
      <Modal
        visible={locationPickerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={cancelLocation}
      >
        <View style={styles.pickerContainer}>
          <StatusBar barStyle="dark-content" />

          {/* Picker header */}
          <View style={[styles.pickerHeader, { paddingTop: topPad }]}>
            <Text style={styles.pickerHeaderTitle}>Pin the Fire Location</Text>
            <Text style={styles.pickerHeaderSub}>Drag the map to place the marker</Text>
          </View>

          {/* Map — fills all remaining space */}
          <View style={styles.pickerMapContainer}>
            <WebView
              style={styles.pickerWebView}
              source={{ html: LOCATION_PICKER_HTML }}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              bounces={false}
              onMessage={handlePickerMessage}
            />
          </View>

          {/* Bottom panel */}
          <View style={[styles.pickerBottom, { paddingBottom: Platform.OS === 'ios' ? 36 : SPACING.lg }]}>
            {/* Address preview */}
            <View style={styles.pickerAddressRow}>
              <View style={styles.pickerAddressIcon}>
                <Ionicons name="location" size={18} color={COLORS.fireRed} />
              </View>
              <View style={styles.pickerAddressText}>
                <Text style={styles.pickerAddressMain} numberOfLines={1}>{pendingAddress}</Text>
                <Text style={styles.pickerAddressCoords}>
                  {pendingLat.toFixed(5)}° N, {Math.abs(pendingLng).toFixed(5)}° E
                </Text>
              </View>
            </View>

            {/* Select Location */}
            <TouchableOpacity style={styles.selectBtn} onPress={confirmLocation} activeOpacity={0.88}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <Text style={styles.selectBtnText}>Select Location</Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelLocation} activeOpacity={0.75}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Success Overlay ── */}
      {confirmed && (
        <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <Animated.View style={[styles.successIconWrap, { transform: [{ scale: successCheckScale }] }]}>
              <View style={styles.successIconBg}>
                <Ionicons name="checkmark" size={42} color={COLORS.white} />
              </View>
            </Animated.View>
            <Text style={styles.successTitle}>Report Submitted</Text>
            <Text style={styles.successSub}>Dispatching responders now</Text>
            <View style={styles.successDetails}>
              <View style={styles.successRow}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.emerald} />
                <Text style={styles.successRowText}>Emergency services notified</Text>
              </View>
              <View style={styles.successRow}>
                <Ionicons name="location" size={14} color={COLORS.emerald} />
                <Text style={styles.successRowText}>Location pinned on live map</Text>
              </View>
              <View style={styles.successRow}>
                <Ionicons name="time" size={14} color={COLORS.emerald} />
                <Text style={styles.successRowText}>Estimated ETA: 4–6 minutes</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
    ...SHADOWS.small,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  headerSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate500,
    fontWeight: '500',
    marginTop: 1,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
    marginLeft: SPACING.sm,
  },
  urgentDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.fireRed,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.fireRed,
    letterSpacing: 0.3,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },

  // Section
  section: { marginBottom: SPACING.lg },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.slate800,
    letterSpacing: 0.2,
  },
  optionalTag: { fontWeight: '500', color: COLORS.slate500 },
  fireBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
    marginLeft: 'auto',
  },
  fireBadgeEmoji: { fontSize: 12 },
  fireBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.fireRed,
    letterSpacing: 0.3,
  },

  // Photo
  photoCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.medium,
    position: 'relative',
  },
  photo: { width: '100%', height: 210 },
  photoPlaceholder: {
    backgroundColor: '#1A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 52, marginBottom: 8 },
  placeholderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholderSub: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 3,
  },
  photoOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // Description input
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  textInput: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.slate800,
    lineHeight: 20,
    minHeight: 72,
    fontWeight: '500',
  },

  // Location row (tappable)
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    padding: SPACING.md,
    gap: 12,
    ...SHADOWS.small,
  },
  locationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextBlock: { flex: 1 },
  locationAddress: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.slate800,
  },
  locationCoords: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate500,
    fontWeight: '500',
    marginTop: 2,
  },
  locationChevronWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationChangeTap: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.fireRed,
  },

  // Footer
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    ...SHADOWS.large,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.fireRed,
    paddingVertical: 17,
    borderRadius: BORDER_RADIUS.xl,
    gap: 10,
    shadowColor: COLORS.fireRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate400,
    fontWeight: '500',
    marginTop: SPACING.sm,
    marginBottom: 4,
  },

  // ── Full-screen Picker Modal ──────────────────────────────────────────────
  pickerContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  pickerHeader: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
    ...SHADOWS.small,
  },
  pickerHeaderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  pickerHeaderSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate500,
    fontWeight: '500',
    marginTop: 2,
  },
  pickerMapContainer: {
    flex: 1,
  },
  pickerWebView: {
    flex: 1,
  },
  pickerBottom: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    gap: SPACING.sm,
    ...SHADOWS.large,
  },
  pickerAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginBottom: 4,
  },
  pickerAddressIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerAddressText: { flex: 1 },
  pickerAddressMain: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.slate800,
  },
  pickerAddressCoords: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate500,
    fontWeight: '500',
    marginTop: 1,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.emerald,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.xl,
    gap: 8,
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  selectBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.slate100,
  },
  cancelBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.slate600,
  },

  // Success overlay
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    paddingHorizontal: SPACING.xl,
  },
  successCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.large,
  },
  successIconWrap: { marginBottom: SPACING.lg },
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: 4,
  },
  successSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.slate500,
    fontWeight: '500',
    marginBottom: SPACING.lg,
  },
  successDetails: {
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  successRowText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.slate700,
  },
});
