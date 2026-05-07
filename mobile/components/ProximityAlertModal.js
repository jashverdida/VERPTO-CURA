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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

const { height } = Dimensions.get('window');

export default function ProximityAlertModal({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up from bottom
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Continuous pulse on alert icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Shake effect on first appearance
      Animated.sequence([
        Animated.timing(shake, {
          toValue: -8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(height);
      pulseAnim.setValue(1);
      shake.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleDismiss = () => {
    handleClose();
  };

  const dummyData = {
    type: 'Structure Fire',
    distance: '0.8 km',
    direction: 'Northeast',
    address: 'Rizal Avenue, Barangay 456',
    evacuationZone: 'YES - Within 500m',
    windSpeed: '12 km/h',
    windDirection: 'NE',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      {/* Dimmed Backdrop */}
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={handleDismiss}
        />
      </View>

      {/* Sliding Alert Modal */}
      <Animated.View
        style={[
          styles.alertContainer,
          {
            transform: [
              { translateY: slideAnim },
              { translateX: shake },
            ],
          },
        ]}
      >
        {/* Alert Header */}
        <View style={styles.alertHeader}>
          <Animated.View
            style={[
              styles.alertIconBox,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Ionicons name="alert-circle" size={40} color={COLORS.white} />
          </Animated.View>
          <View>
            <Text style={styles.alertTitle}>Fire Nearby!</Text>
            <Text style={styles.alertSubtitle}>Active emergency within proximity</Text>
          </View>
        </View>

        {/* Alert Content */}
        <View style={styles.contentCard}>
          {/* Distance & Direction */}
          <View style={styles.prominentInfo}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.prominentValue}>{dummyData.distance}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Direction</Text>
              <View style={styles.directionContainer}>
                <Text style={styles.prominentValue}>{dummyData.direction}</Text>
                <Ionicons 
                  name="arrow-up" 
                  size={24} 
                  color={COLORS.fireRed}
                  style={{ transform: [{ rotate: '45deg' }] }}
                />
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={[styles.detailIcon, { backgroundColor: COLORS.fireRed + '20' }]}>
                  <Ionicons name="flame" size={18} color={COLORS.fireRed} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Incident Type</Text>
                  <Text style={styles.detailValue}>{dummyData.type}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={[styles.detailIcon, { backgroundColor: COLORS.medicalBlue + '20' }]}>
                  <Ionicons name="location" size={18} color={COLORS.medicalBlue} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{dummyData.address}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={[styles.detailIcon, { backgroundColor: COLORS.warning + '20' }]}>
                  <Ionicons name="shield-checkmark" size={18} color={COLORS.warning} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Evacuation Zone</Text>
                  <Text style={[styles.detailValue, { color: COLORS.fireRed, fontWeight: '700' }]}>
                    {dummyData.evacuationZone}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={[styles.detailIcon, { backgroundColor: COLORS.slate300 + '40' }]}>
                  <Ionicons name="wind" size={18} color={COLORS.slate600} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Wind Condition</Text>
                  <Text style={styles.detailValue}>
                    {dummyData.windSpeed} {dummyData.windDirection}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={18} color={COLORS.fireRed} />
            <Text style={styles.warningText}>
              Evacuate if instructed by authorities. Stay updated with CURA.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleDismiss}
          >
            <Text style={styles.secondaryButtonText}>Dismiss</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleDismiss}
          >
            <Ionicons name="navigate" size={18} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>View on Map</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },

  // Alert Container
  alertContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.lg,
    maxHeight: '85%',
    ...SHADOWS.large,
  },

  // Alert Header
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  alertIconBox: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.fireRed,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  alertTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.slate900,
    letterSpacing: 0.5,
  },
  alertSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate500,
    fontWeight: '500',
    marginTop: 2,
  },

  // Content Card
  contentCard: {
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.fireRed + '30',
  },

  // Prominent Info
  prominentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  infoColumn: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.slate600,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  prominentValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.fireRed,
  },
  infoDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.slate200,
  },
  directionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Details Section
  detailsSection: {
    gap: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.slate600,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.slate900,
    marginTop: 2,
  },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.fireRed + '15',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.fireRed,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.fireRed,
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.small,
  },
  primaryButton: {
    backgroundColor: COLORS.fireRed,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: COLORS.slate200,
    borderWidth: 1,
    borderColor: COLORS.slate300,
  },
  secondaryButtonText: {
    color: COLORS.slate700,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
