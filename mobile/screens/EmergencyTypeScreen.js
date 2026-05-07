import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

// ── Layout math ───────────────────────────────────────────────────────────────
const { width: W, height: H } = Dimensions.get('window');
const TOP_PAD  = Platform.OS === 'ios' ? 54 : 44;
const HEADER_H = TOP_PAD + 60;
const AVAIL_H  = H - HEADER_H;

const R         = Math.min(W * 0.295, 118);   // orbit radius
const NODE_SIZE = 72;                           // icon circle diameter
const HUB_SIZE  = 82;                           // center hub diameter
const CX        = W / 2;
const CY        = HEADER_H + AVAIL_H * 0.5 + 10; // pentagon center, slightly below mid

// ── Emergency definitions (pentagon order: top → clockwise) ──────────────────
const EMERGENCIES = [
  {
    id: 'medical',
    icon: 'medkit',
    label: 'Medical',
    sub: 'Emergency',
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.35)',
    onSelect: (nav) => nav.navigate('TriageChat', { type: 'medical' }),
  },
  {
    id: 'vehicle',
    icon: 'car',
    label: 'Vehicle',
    sub: 'Accident',
    color: '#F97316',
    glow: 'rgba(249,115,22,0.35)',
    onSelect: (nav) => nav.navigate('Camera', { emergencyType: 'vehicle' }),
  },
  {
    id: 'fire',
    icon: 'flame',
    label: 'Fire',
    sub: 'Incident',
    color: '#EF4444',
    glow: 'rgba(239,68,68,0.35)',
    onSelect: (nav) => nav.navigate('Camera', { emergencyType: 'fire' }),
  },
  {
    id: 'hazmat',
    icon: 'flask',
    label: 'HAZMAT',
    sub: 'Hazardous',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.35)',
    onSelect: (nav) => nav.navigate('TriageChat', { type: 'hazmat' }),
  },
  {
    id: 'sar',
    icon: 'search',
    label: 'Search &',
    sub: 'Rescue',
    color: '#14B8A6',
    glow: 'rgba(20,184,166,0.35)',
    onSelect: (nav) => nav.navigate('TriageChat', { type: 'search_rescue' }),
  },
];

// Pentagon positions (top = -90°, clockwise 72° steps)
const POSITIONS = EMERGENCIES.map((_, i) => {
  const a = (-90 + i * 72) * (Math.PI / 180);
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
});

// Spoke angles (degrees, for each connecting line)
const SPOKE_ANGLES = POSITIONS.map(pos =>
  Math.atan2(pos.y - CY, pos.x - CX) * (180 / Math.PI)
);

// ── Component ─────────────────────────────────────────────────────────────────
export default function EmergencyTypeScreen({ navigation }) {
  // Hub entrance + pulse
  const hubAnim    = useRef(new Animated.Value(0)).current;
  const pulse1     = useRef(new Animated.Value(1)).current;
  const pulse2     = useRef(new Animated.Value(1)).current;

  // Per-item bloom
  const itemAnims  = useRef(EMERGENCIES.map(() => new Animated.Value(0))).current;
  // Per-item press scale
  const pressAnims = useRef(EMERGENCIES.map(() => new Animated.Value(1))).current;
  // Spoke opacity
  const spokeAnims = useRef(EMERGENCIES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // 1. Hub fades + scales in
    Animated.spring(hubAnim, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();

    // 2. Items bloom out with stagger (after short delay)
    setTimeout(() => {
      Animated.stagger(
        70,
        itemAnims.map(a =>
          Animated.spring(a, { toValue: 1, friction: 6, tension: 55, useNativeDriver: true })
        )
      ).start();
      Animated.stagger(
        70,
        spokeAnims.map(a =>
          Animated.timing(a, { toValue: 1, duration: 380, useNativeDriver: true })
        )
      ).start();
    }, 240);

    // 3. Hub pulse rings (staggered start)
    const runPulse = (anim, delay) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1.85, duration: 1400, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 1,    duration: 0,    useNativeDriver: true }),
          ])
        ).start();
      }, delay);
    };
    runPulse(pulse1, 600);
    runPulse(pulse2, 1300);
  }, []);

  const handlePress = (item, index) => {
    Animated.sequence([
      Animated.timing(pressAnims[index], { toValue: 0.86, duration: 100, useNativeDriver: true }),
      Animated.timing(pressAnims[index], { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start(() => item.onSelect(navigation));
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Tap background to dismiss */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => navigation.goBack()}
      />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: TOP_PAD }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EMERGENCY RESPONSE</Text>
          </View>
          <Text style={styles.headerTitle}>Select Type</Text>
        </View>
      </View>

      {/* ── Radial canvas ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

        {/* Decorative concentric rings */}
        <View style={[styles.ring, {
          width: R * 1.9, height: R * 1.9,
          borderRadius: R * 0.95,
          left: CX - R * 0.95, top: CY - R * 0.95,
        }]} />
        <View style={[styles.ring, {
          width: R * 2.8, height: R * 2.8,
          borderRadius: R * 1.4,
          left: CX - R * 1.4, top: CY - R * 1.4,
          opacity: 0.035,
        }]} />
        <View style={[styles.ring, {
          width: R, height: R,
          borderRadius: R * 0.5,
          left: CX - R * 0.5, top: CY - R * 0.5,
          opacity: 0.06,
        }]} />

        {/* Connecting spokes */}
        {EMERGENCIES.map((item, i) => (
          <Animated.View
            key={`spoke-${item.id}`}
            style={{
              position: 'absolute',
              width: R,
              height: 1.5,
              left: (CX + POSITIONS[i].x) / 2 - R / 2,
              top:  (CY + POSITIONS[i].y) / 2 - 0.75,
              backgroundColor: item.color,
              opacity: spokeAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.22],
              }),
              transform: [{ rotate: `${SPOKE_ANGLES[i]}deg` }],
            }}
          />
        ))}

        {/* ── Hub (center) ── */}
        <Animated.View
          style={{
            position: 'absolute',
            left: CX - HUB_SIZE / 2,
            top:  CY - HUB_SIZE / 2,
            width: HUB_SIZE,
            height: HUB_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: hubAnim,
            transform: [{ scale: hubAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
          }}
        >
          {/* Pulse ring 1 */}
          <Animated.View style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulse1 }],
              opacity: pulse1.interpolate({ inputRange: [1, 1.85], outputRange: [0.28, 0] }),
            },
          ]} />
          {/* Pulse ring 2 */}
          <Animated.View style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulse2 }],
              opacity: pulse2.interpolate({ inputRange: [1, 1.85], outputRange: [0.18, 0] }),
            },
          ]} />
          {/* Hub circle */}
          <View style={styles.hubCircle}>
            <Ionicons name="warning" size={28} color={COLORS.emerald} />
          </View>
          <Text style={styles.hubLabel}>SELECT</Text>
        </Animated.View>

        {/* ── Item nodes ── */}
        {EMERGENCIES.map((item, i) => {
          const pos = POSITIONS[i];
          const dx  = pos.x - CX;
          const dy  = pos.y - CY;

          return (
            <Animated.View
              key={item.id}
              style={{
                position: 'absolute',
                alignItems: 'center',
                // Center the node container on pos.x, pos.y
                left: CX - NODE_SIZE / 2,
                top:  CY - NODE_SIZE / 2,
                width: NODE_SIZE,
                opacity: itemAnims[i],
                transform: [
                  {
                    translateX: itemAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, dx],
                    }),
                  },
                  {
                    translateY: itemAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, dy],
                    }),
                  },
                  {
                    scale: Animated.multiply(
                      pressAnims[i],
                      itemAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] })
                    ),
                  },
                ],
              }}
            >
              <TouchableOpacity
                onPress={() => handlePress(item, i)}
                activeOpacity={1}
                style={styles.nodeTouch}
              >
                {/* Glow halo */}
                <View style={[styles.nodeGlow, { backgroundColor: item.glow }]} />

                {/* Icon circle */}
                <View style={[styles.nodeCircle, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={26} color={COLORS.white} />
                </View>

                {/* Labels */}
                <Text style={styles.nodeLabel}>{item.label}</Text>
                <Text style={styles.nodeSub}>{item.sub}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Bottom hint */}
      <View style={styles.hintRow}>
        <Ionicons name="tap-water-outline" size={13} color="rgba(255,255,255,0.25)" />
        <Text style={styles.hintText}>Tap an emergency type to begin</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(8, 16, 32, 0.86)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerText: {
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(239,68,68,0.85)',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // Decorative ring
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.055)',
  },

  // Hub
  pulseRing: {
    position: 'absolute',
    width: HUB_SIZE,
    height: HUB_SIZE,
    borderRadius: HUB_SIZE / 2,
    borderWidth: 1.5,
    borderColor: COLORS.emerald,
  },
  hubCircle: {
    width: HUB_SIZE,
    height: HUB_SIZE,
    borderRadius: HUB_SIZE / 2,
    backgroundColor: '#111E35',
    borderWidth: 2,
    borderColor: COLORS.emerald + '70',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  hubLabel: {
    marginTop: 7,
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2.5,
  },

  // Node
  nodeTouch: {
    alignItems: 'center',
  },
  nodeGlow: {
    position: 'absolute',
    width: NODE_SIZE + 14,
    height: NODE_SIZE + 14,
    borderRadius: (NODE_SIZE + 14) / 2,
    top: -7,
    left: -7,
    opacity: 0.28,
  },
  nodeCircle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  nodeLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.2,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  nodeSub: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginTop: 1,
  },

  // Bottom hint
  hintRow: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  hintText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.22)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
