import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

const { height } = Dimensions.get('window');

const DETAIL_ROWS = [
  {
    icon: 'flame',
    iconBg: '#FEE2E2',
    iconColor: '#EF4444',
    label: 'Incident Type',
    value: 'Structure Fire',
    valueColor: '#0F172A',
  },
  {
    icon: 'location',
    iconBg: '#DBEAFE',
    iconColor: '#3B82F6',
    label: 'Address',
    value: 'Rizal Avenue, Barangay 456',
    valueColor: '#0F172A',
  },
  {
    icon: 'shield-checkmark',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    label: 'Evacuation Zone',
    value: 'YES – Within 500m',
    valueColor: '#EF4444',
    bold: true,
  },
  {
    icon: 'partly-sunny',
    iconBg: '#F1F5F9',
    iconColor: '#64748B',
    label: 'Wind Condition',
    value: '12 km/h NE',
    valueColor: '#0F172A',
  },
];

export default function ProximityAlertModal({ visible, onClose, onViewMap }) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim  = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up
      Animated.spring(slideAnim, {
        toValue: 0, friction: 7, tension: 40, useNativeDriver: true,
      }).start();

      // Shake on entry
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10,  duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8,  duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8,   duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 80, useNativeDriver: true }),
      ]).start();

      // Pulse badge
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 650, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 650, useNativeDriver: true }),
        ])
      ).start();

      // Expanding ring
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1.8, duration: 1000, useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 1,   duration: 0,    useNativeDriver: true }),
        ])
      ).start();
    } else {
      slideAnim.setValue(height);
      pulseAnim.setValue(1);
      ringAnim.setValue(1);
      shakeAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height, duration: 300, useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      />

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] },
        ]}
      >
        {/* ── Hero Image ── */}
        <View style={styles.heroWrapper}>
          <Image
            source={require('../assets/fire-incident.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(150,10,10,0.55)', 'rgba(100,5,5,0.93)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Pulsing alert badge */}
          <View style={styles.badgeAnchor}>
            <Animated.View
              style={[
                styles.badgeRing,
                { transform: [{ scale: ringAnim }], opacity: ringAnim.interpolate({ inputRange: [1, 1.8], outputRange: [0.5, 0] }) },
              ]}
            />
            <Animated.View style={[styles.badge, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="alert-circle" size={26} color={COLORS.white} />
            </Animated.View>
          </View>

          {/* Title over image */}
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>Fire Nearby!</Text>
            <Text style={styles.heroSubtitle}>Active emergency within proximity</Text>
          </View>
        </View>

        {/* ── Scrollable content ── */}
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false} bounces={false}>
          {/* Distance / Direction row */}
          <View style={styles.metricRow}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>0.8 km</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Direction</Text>
              <View style={styles.directionInner}>
                <Text style={styles.metricValue}>Northeast</Text>
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={22}
                  color={COLORS.fireRed}
                  style={{ transform: [{ rotate: '45deg' }] }}
                />
              </View>
            </View>
          </View>

          {/* Detail card */}
          <View style={styles.detailCard}>
            {DETAIL_ROWS.map((row, i) => (
              <View key={row.label}>
                <View style={styles.detailRow}>
                  <View style={[styles.detailIcon, { backgroundColor: row.iconBg }]}>
                    <Ionicons name={row.icon} size={18} color={row.iconColor} />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>{row.label}</Text>
                    <Text style={[styles.detailValue, { color: row.valueColor, fontWeight: row.bold ? '800' : '600' }]}>
                      {row.value}
                    </Text>
                  </View>
                </View>
                {i < DETAIL_ROWS.length - 1 && <View style={styles.rowSep} />}
              </View>
            ))}
          </View>

          {/* Warning banner */}
          <View style={styles.warningBanner}>
            <View style={styles.warningIconWrap}>
              <Ionicons name="warning" size={16} color={COLORS.fireRed} />
            </View>
            <Text style={styles.warningText}>
              Evacuate if instructed by authorities. Stay updated with CURA.
            </Text>
          </View>

          <View style={{ height: SPACING.md }} />
        </ScrollView>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.dismissBtn} onPress={handleClose} activeOpacity={0.8}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={onViewMap ?? handleClose}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate" size={18} color={COLORS.white} />
            <Text style={styles.mapBtnText}>View on Map</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '90%',
    ...SHADOWS.large,
  },

  // ── Hero ──
  heroWrapper: {
    height: 190,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  dragHandle: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
    zIndex: 10,
  },
  badgeAnchor: {
    position: 'absolute',
    top: 28,
    right: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  badgeRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.fireRed,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  heroTextBlock: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: 70,
    zIndex: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginTop: 3,
  },

  // ── Body ──
  body: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },

  // Metric row
  metricRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  metricCol: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#FEE2E2',
    marginVertical: SPACING.sm,
  },
  metricLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.slate500,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.fireRed,
  },
  directionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Detail card
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    gap: SPACING.sm,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.slate500,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.slate900,
  },
  rowSep: {
    height: 1,
    backgroundColor: COLORS.slate100,
    marginLeft: 56 + SPACING.md,
  },

  // Warning
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.fireRed,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginBottom: SPACING.sm,
  },
  warningIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.fireRed,
    lineHeight: 18,
  },

  // Buttons
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 32 : SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    backgroundColor: COLORS.white,
  },
  dismissBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.slate100,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  dismissText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.slate700,
  },
  mapBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.fireRed,
    ...SHADOWS.medium,
  },
  mapBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});
