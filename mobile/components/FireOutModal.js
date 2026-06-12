import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

export default function FireOutModal({ visible, incident, onClose }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Background fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Modal scale in
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Checkmark pop
      setTimeout(() => {
        Animated.spring(checkmarkScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }).start();
      }, 200);
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      checkmarkScale.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());

    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const dummyData = {
    title: 'Structure Fire',
    location: '456 Elm St, District 3',
    reportedTime: '14:32',
    extinguishedTime: '15:47',
    duration: '1 hr 15 min',
    unitsResponded: 6,
    personnel: 24,
    injuries: 0,
    evacuated: 12,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Modal Container */}
      <View style={styles.centeredView}>
        <Animated.View
          style={[
            styles.modalView,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Success Checkmark */}
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkmarkScale }],
              },
            ]}
          >
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={56} color={COLORS.white} />
            </View>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>Fire Out!</Text>
          <Text style={styles.subtitle}>Incident Successfully Extinguished</Text>

          {/* Incident Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="flame" size={20} color={COLORS.fireRed} />
                <Text style={styles.infoLabel}>Type</Text>
              </View>
              <Text style={styles.infoValue}>{dummyData.title}</Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="location" size={20} color={COLORS.medicalBlue} />
                <Text style={styles.infoLabel}>Location</Text>
              </View>
              <Text style={styles.infoValue}>{dummyData.location}</Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="time" size={20} color={COLORS.emerald} />
                <Text style={styles.infoLabel}>Duration</Text>
              </View>
              <Text style={styles.infoValue}>{dummyData.duration}</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dummyData.unitsResponded}</Text>
              <Text style={styles.statLabel}>Units</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dummyData.personnel}</Text>
              <Text style={styles.statLabel}>Personnel</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dummyData.injuries}</Text>
              <Text style={styles.statLabel}>Injuries</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{dummyData.evacuated}</Text>
              <Text style={styles.statLabel}>Evacuated</Text>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>Done</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalView: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...SHADOWS.large,
  },

  // Checkmark
  checkmarkContainer: {
    marginBottom: SPACING.lg,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },

  // Text
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '900',
    color: COLORS.slate900,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.slate500,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },

  // Info Card
  infoCard: {
    width: '100%',
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.slate600,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.slate900,
    maxWidth: '50%',
    textAlign: 'right',
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.slate200,
    marginVertical: SPACING.xs,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  statBox: {
    flex: 1,
    minWidth: 70,
    backgroundColor: COLORS.slate100,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.emerald,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.slate600,
    textAlign: 'center',
  },

  // Button
  closeButton: {
    width: '100%',
    backgroundColor: COLORS.emerald,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
