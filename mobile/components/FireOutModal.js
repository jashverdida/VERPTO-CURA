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

const STATS = [
  { value: 6,  label: 'Units' },
  { value: 24, label: 'Personnel' },
  { value: 0,  label: 'Injuries' },
];

export default function FireOutModal({ visible, incident, onClose }) {
  const scaleAnim     = useRef(new Animated.Value(0.85)).current;
  const fadeAnim      = useRef(new Animated.Value(0)).current;
  const checkScale    = useRef(new Animated.Value(0)).current;
  const checkRotate   = useRef(new Animated.Value(0)).current;
  const statsAnim     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 45, useNativeDriver: true }),
      ]).start();

      // Checkmark pop with slight overshoot
      setTimeout(() => {
        Animated.sequence([
          Animated.spring(checkScale, { toValue: 1.15, friction: 4, tension: 70, useNativeDriver: true }),
          Animated.spring(checkScale, { toValue: 1,    friction: 5, tension: 50, useNativeDriver: true }),
        ]).start();
        Animated.timing(checkRotate, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      }, 160);

      // Stats fade in
      setTimeout(() => {
        Animated.timing(statsAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }, 420);
    } else {
      scaleAnim.setValue(0.85);
      fadeAnim.setValue(0);
      checkScale.setValue(0);
      checkRotate.setValue(0);
      statsAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 220, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const checkRotateDeg = checkRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-20deg', '0deg'],
  });

  const data = incident ?? {
    title:    'Structure Fire',
    location: '456 Elm St, District 3',
    duration: '1 hr 15 min',
    evacuated: 12,
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      {/* Modal */}
      <View style={styles.centeredView}>
        <Animated.View
          style={[
            styles.modal,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* ── Hero image with green overlay ── */}
          <View style={styles.heroWrapper}>
            <Image
              source={require('../assets/fire-incident.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Green success tint overlay */}
            <LinearGradient
              colors={['rgba(4,120,87,0.75)', 'rgba(16,185,129,0.88)', 'rgba(5,150,105,0.78)']}
              style={StyleSheet.absoluteFill}
            />
            {/* Subtle dark-to-transparent so text is readable */}
            <LinearGradient
              colors={['rgba(0,0,0,0.08)', 'transparent', 'rgba(0,0,0,0.15)']}
              style={StyleSheet.absoluteFill}
            />

            {/* Animated checkmark */}
            <Animated.View
              style={[
                styles.checkWrap,
                { transform: [{ scale: checkScale }, { rotate: checkRotateDeg }] },
              ]}
            >
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={44} color={COLORS.white} />
              </View>
              {/* Halo ring */}
              <View style={styles.checkHalo} />
            </Animated.View>
          </View>

          {/* ── Body ── */}
          <View style={styles.body}>
            <Text style={styles.title}>Fire Out!</Text>
            <Text style={styles.subtitle}>Incident Successfully Extinguished</Text>

            {/* Info rows */}
            <View style={styles.infoCard}>
              {[
                { icon: 'flame',    iconColor: COLORS.fireRed,   bg: '#FEE2E2', label: 'Type',     value: data.title },
                { icon: 'location', iconColor: COLORS.medicalBlue, bg: '#DBEAFE', label: 'Location', value: data.location },
                { icon: 'time',     iconColor: COLORS.emerald,   bg: '#D1FAE5', label: 'Duration', value: data.duration },
              ].map((row, i, arr) => (
                <View key={row.label}>
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIcon, { backgroundColor: row.bg }]}>
                      <Ionicons name={row.icon} size={17} color={row.iconColor} />
                    </View>
                    <Text style={styles.infoLabel}>{row.label}</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>{row.value}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.rowSep} />}
                </View>
              ))}
            </View>

            {/* Stats */}
            <Animated.View style={[styles.statsRow, { opacity: statsAnim }]}>
              {STATS.map((s) => (
                <View key={s.label} style={styles.statBox}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </Animated.View>

            {/* Evacuated wide stat */}
            <Animated.View style={[styles.evacuatedBox, { opacity: statsAnim }]}>
              <Text style={styles.statValue}>{data.evacuated}</Text>
              <Text style={styles.statLabel}>Evacuated</Text>
            </Animated.View>

            {/* Done button */}
            <TouchableOpacity style={styles.doneBtn} onPress={handleClose} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>Done</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
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
    height: 160,
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
  checkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },
  checkHalo: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  // ── Body ──
  body: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.slate900,
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.slate500,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  // Info card
  infoCard: {
    width: '100%',
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    gap: SPACING.sm,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.slate500,
    flex: 1,
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.slate900,
    maxWidth: '52%',
    textAlign: 'right',
  },
  rowSep: {
    height: 1,
    backgroundColor: COLORS.slate200,
    marginLeft: 16 + 34 + 8,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
    marginBottom: SPACING.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  evacuatedBox: {
    width: '100%',
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginBottom: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.emerald,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.slate500,
    textAlign: 'center',
  },

  // Done button
  doneBtn: {
    width: '100%',
    backgroundColor: COLORS.emerald,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.emerald,
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
