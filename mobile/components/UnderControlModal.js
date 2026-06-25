import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

const STATUS_ROWS = [
  {
    icon: 'shield-checkmark',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    label: 'Status',
    value: 'Perimeter Established',
  },
  {
    icon: 'flame',
    iconBg: '#FFEDD5',
    iconColor: '#EA580C',
    label: 'Incident Type',
    value: 'Structure Fire',
  },
  {
    icon: 'location',
    iconBg: '#DBEAFE',
    iconColor: '#3B82F6',
    label: 'Location',
    value: 'Rizal Avenue, Barangay 456',
  },
  {
    icon: 'time',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    label: 'Est. Containment',
    value: '~30 minutes',
  },
];

const STATS = [
  { value: '6',   label: 'Units\nOn Scene' },
  { value: '24',  label: 'Personnel\nDeployed' },
  { value: '100m', label: 'Safety\nRadius' },
];

export default function UnderControlModal({ visible, onClose }) {
  const scaleAnim   = useRef(new Animated.Value(0.88)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const shieldScale = useRef(new Animated.Value(0)).current;
  const shieldBob   = useRef(new Animated.Value(0)).current;
  const statsAnim   = useRef(new Animated.Value(0)).current;
  const glowAnim    = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 45, useNativeDriver: true }),
      ]).start();

      // Shield pop
      setTimeout(() => {
        Animated.spring(shieldScale, {
          toValue: 1, friction: 4, tension: 65, useNativeDriver: true,
        }).start();
      }, 150);

      // Gentle floating bob
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(shieldBob, { toValue: -6, duration: 1800, useNativeDriver: true }),
            Animated.timing(shieldBob, { toValue: 0,  duration: 1800, useNativeDriver: true }),
          ])
        ).start();

        // Amber glow pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1,   duration: 1200, useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
          ])
        ).start();
      }, 500);

      // Stats fade in
      setTimeout(() => {
        Animated.timing(statsAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
      }, 400);
    } else {
      scaleAnim.setValue(0.88);
      fadeAnim.setValue(0);
      shieldScale.setValue(0);
      shieldBob.setValue(0);
      statsAnim.setValue(0);
      glowAnim.setValue(0.6);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 220, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      <View style={styles.centeredView}>
        <Animated.View
          style={[styles.modal, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          {/* ── Hero image with amber/gold overlay ── */}
          <View style={styles.heroWrapper}>
            <Image
              source={require('../assets/fire-incident.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Amber containment tint */}
            <LinearGradient
              colors={['rgba(180,83,9,0.6)', 'rgba(217,119,6,0.82)', 'rgba(161,98,7,0.75)']}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'transparent', 'rgba(0,0,0,0.2)']}
              style={StyleSheet.absoluteFill}
            />

            {/* Animated shield icon */}
            <Animated.View
              style={[
                styles.shieldWrap,
                {
                  transform: [
                    { scale: shieldScale },
                    { translateY: shieldBob },
                  ],
                  opacity: glowAnim,
                },
              ]}
            >
              <View style={styles.shieldOuter}>
                <View style={styles.shieldInner}>
                  <Ionicons name="shield-checkmark" size={42} color="#FEF3C7" />
                </View>
              </View>
            </Animated.View>

            {/* Status pill */}
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>MONITORING ACTIVE</Text>
            </View>
          </View>

          {/* ── Body ── */}
          <View style={styles.body}>
            <Text style={styles.title}>Under Control</Text>
            <Text style={styles.subtitle}>Fire contained — actively managed by responders</Text>

            {/* Stats row */}
            <Animated.View style={[styles.statsRow, { opacity: statsAnim }]}>
              {STATS.map((s) => (
                <View key={s.label} style={styles.statBox}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Status detail card */}
            <View style={styles.detailCard}>
              {STATUS_ROWS.map((row, i) => (
                <View key={row.label}>
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIcon, { backgroundColor: row.iconBg }]}>
                      <Ionicons name={row.icon} size={17} color={row.iconColor} />
                    </View>
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>{row.label}</Text>
                      <Text style={styles.detailValue}>{row.value}</Text>
                    </View>
                  </View>
                  {i < STATUS_ROWS.length - 1 && <View style={styles.rowSep} />}
                </View>
              ))}
            </View>

            {/* Advisory banner */}
            <View style={styles.advisoryBanner}>
              <Ionicons name="information-circle" size={18} color="#D97706" />
              <Text style={styles.advisoryText}>
                Stay clear of the area. Follow instructions from on-ground responders.
              </Text>
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.gotItBtn} onPress={handleClose} activeOpacity={0.85}>
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
              <Text style={styles.gotItText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    ...SHADOWS.large,
  },

  // ── Hero ──
  heroWrapper: {
    height: 155,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  shieldWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  shieldOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(217,119,6,0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(254,243,199,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FCD34D',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FEF3C7',
    letterSpacing: 1.2,
  },

  // ── Body ──
  body: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.slate900,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.slate500,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 18,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: '#D97706',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.slate500,
    textAlign: 'center',
    lineHeight: 13,
  },

  // Detail card
  detailCard: {
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    gap: SPACING.sm,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailText: { flex: 1 },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate500,
    marginBottom: 1,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  rowSep: {
    height: 1,
    backgroundColor: COLORS.slate100,
    marginLeft: 16 + 36 + 8,
  },

  // Advisory
  advisoryBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    marginBottom: SPACING.md,
  },
  advisoryText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#92400E',
    lineHeight: 18,
  },

  // Button
  gotItBtn: {
    width: '100%',
    backgroundColor: '#D97706',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  gotItText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
