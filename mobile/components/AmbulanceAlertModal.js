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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

const { height } = Dimensions.get('window');

// Alternating siren flash colors
const SIREN_RED  = '#EF4444';
const SIREN_BLUE = '#3B82F6';

export default function AmbulanceAlertModal({ visible, onClose }) {
  const slideAnim  = useRef(new Animated.Value(height)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const sirenAnim  = useRef(new Animated.Value(0)).current; // 0 = red, 1 = blue
  const crossScale = useRef(new Animated.Value(0)).current;
  const urgentAnim = useRef(new Animated.Value(1)).current;

  const sirenLoopRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Slide up
      Animated.spring(slideAnim, {
        toValue: 0, friction: 7, tension: 38, useNativeDriver: true,
      }).start();

      // Aggressive shake on entry
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
      ]).start();

      // Cross pop
      setTimeout(() => {
        Animated.spring(crossScale, {
          toValue: 1, friction: 4, tension: 70, useNativeDriver: true,
        }).start();
      }, 200);

      // Siren flash (red ↔ blue)
      sirenLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(sirenAnim, { toValue: 1, duration: 380, useNativeDriver: false }),
          Animated.timing(sirenAnim, { toValue: 0, duration: 380, useNativeDriver: false }),
        ])
      );
      sirenLoopRef.current.start();

      // Urgent text pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(urgentAnim, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(urgentAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      slideAnim.setValue(height);
      shakeAnim.setValue(0);
      sirenAnim.setValue(0);
      crossScale.setValue(0);
      urgentAnim.setValue(1);
      sirenLoopRef.current?.stop();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height, duration: 300, useNativeDriver: true,
    }).start(() => onClose());
  };

  const sirenColor = sirenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SIREN_RED, SIREN_BLUE],
  });

  const sirenBg = sirenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(239,68,68,0.18)', 'rgba(59,130,246,0.18)'],
  });

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
        {/* ── Hero image ── */}
        <View style={styles.heroWrapper}>
          <Image
            source={require('../assets/vehicular-accident.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Dark base gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(15,23,42,0.72)', 'rgba(15,23,42,0.92)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Siren flash overlay — color-only, no separate opacity (avoids driver conflict) */}
          <Animated.View
            style={[StyleSheet.absoluteFill, { backgroundColor: sirenBg }]}
          />

          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Siren light row */}
          <View style={styles.sirenRow}>
            <Animated.View style={[styles.sirenLight, { backgroundColor: sirenColor }]} />
            <Animated.View style={[styles.sirenLight, { backgroundColor: sirenColor }]} />
            <Animated.View style={[styles.sirenLight, { backgroundColor: sirenColor }]} />
          </View>

          {/* Animated cross badge */}
          <Animated.View
            style={[styles.crossWrap, { transform: [{ scale: crossScale }] }]}
          >
            <Animated.View style={[styles.crossBg, { backgroundColor: sirenColor }]}>
              <Ionicons name="medical" size={30} color={COLORS.white} />
            </Animated.View>
            <Animated.View style={[styles.crossRing, { borderColor: sirenColor }]} />
          </Animated.View>

          {/* Hero text */}
          <View style={styles.heroTextBlock}>
            <Animated.Text
              style={[styles.heroTitle, { transform: [{ scale: urgentAnim }] }]}
            >
              Ambulance Incoming!
            </Animated.Text>
            <Text style={styles.heroSubtitle}>Emergency vehicle approaching your area</Text>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>
          {/* Urgent instruction card */}
          <Animated.View style={[styles.urgentCard, { backgroundColor: sirenBg }]}>
            <Animated.View style={[styles.urgentIconWrap, { backgroundColor: sirenColor }]}>
              <Ionicons name="warning" size={22} color={COLORS.white} />
            </Animated.View>
            <View style={styles.urgentTextBlock}>
              <Text style={styles.urgentHeading}>Please move out of the way!</Text>
              <Text style={styles.urgentBody}>
                Clear all lanes immediately. Allow the ambulance to pass through safely.
              </Text>
            </View>
          </Animated.View>

          {/* Info grid */}
          <View style={styles.infoGrid}>
            {[
              { icon: 'speedometer', iconBg: '#FEE2E2', iconColor: '#EF4444', label: 'ETA', value: '~2 min' },
              { icon: 'navigate',    iconBg: '#DBEAFE', iconColor: '#3B82F6', label: 'Direction', value: 'Southbound' },
              { icon: 'business',    iconBg: '#F0FDF4', iconColor: COLORS.emerald, label: 'Destination', value: 'General Hospital' },
              { icon: 'pulse',       iconBg: '#FEE2E2', iconColor: '#EF4444', label: 'Priority', value: 'Code 3 – Critical' },
            ].map((item) => (
              <View key={item.label} style={styles.infoCell}>
                <View style={[styles.infoCellIcon, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={16} color={item.iconColor} />
                </View>
                <Text style={styles.infoCellLabel}>{item.label}</Text>
                <Text style={styles.infoCellValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>What to do right now</Text>
            {[
              { icon: 'arrow-back',         text: 'Pull over to the right side of the road' },
              { icon: 'pause-circle',       text: 'Stop and wait until the ambulance passes' },
              { icon: 'eye-off',            text: 'Do not follow or block the vehicle' },
            ].map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Ionicons name={step.icon} size={15} color={COLORS.slate400} style={{ marginRight: 6 }} />
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Button ── */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.understoodBtn} onPress={handleClose} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.understoodText}>Understood — Clearing the Way</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '92%',
    ...SHADOWS.large,
  },

  // ── Hero ──
  heroWrapper: {
    height: 200,
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
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 20,
  },

  // Siren lights
  sirenRow: {
    position: 'absolute',
    top: 22,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    zIndex: 10,
  },
  sirenLight: {
    width: 12, height: 12,
    borderRadius: 6,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },

  // Cross badge
  crossWrap: {
    position: 'absolute',
    top: 44,
    right: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  crossBg: {
    width: 60, height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  crossRing: {
    position: 'absolute',
    width: 74, height: 74,
    borderRadius: 37,
    borderWidth: 2,
    opacity: 0.5,
  },

  // Hero text
  heroTextBlock: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: 80,
    zIndex: 10,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },

  // ── Body ──
  body: {
    padding: SPACING.md,
    gap: SPACING.md,
  },

  // Urgent card
  urgentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  urgentIconWrap: {
    width: 48, height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...SHADOWS.small,
  },
  urgentTextBlock: { flex: 1 },
  urgentHeading: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.slate900,
    marginBottom: 3,
  },
  urgentBody: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate600,
    lineHeight: 17,
  },

  // Info grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  infoCell: {
    width: '47.5%',
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    padding: SPACING.sm,
    alignItems: 'flex-start',
    gap: 4,
  },
  infoCellIcon: {
    width: 32, height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  infoCellLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate500,
    letterSpacing: 0.3,
  },
  infoCellValue: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.slate900,
  },

  // Steps
  stepsCard: {
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    padding: SPACING.md,
    gap: 10,
  },
  stepsTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.slate900,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepNum: {
    width: 22, height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.medicalBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    flexShrink: 0,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
  },
  stepText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate700,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },

  // Button
  btnRow: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 32 : SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    backgroundColor: COLORS.white,
  },
  understoodBtn: {
    width: '100%',
    backgroundColor: COLORS.medicalBlue,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.medicalBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  understoodText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
