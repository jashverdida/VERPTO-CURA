import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
  ongoing: {
    label: 'Ongoing',
    color: '#EF4444',
    bg: '#FEF2F2',
    pulse: true,
  },
  under_control: {
    label: 'Under Control',
    color: '#F97316',
    bg: '#FFF7ED',
    pulse: false,
  },
  fire_out: {
    label: 'Fire Out',
    color: '#22C55E',
    bg: '#F0FDF4',
    pulse: false,
  },
};

export default function FireMarkerModal({ visible, marker, onClose }) {
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();

      if (marker?.status === 'ongoing') {
        pulseLoopRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.6, duration: 750, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
          ])
        );
        pulseLoopRef.current.start();
      }
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.88, duration: 160, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
      if (pulseLoopRef.current) pulseLoopRef.current.stop();
      pulseAnim.setValue(1);
    }
  }, [visible, marker]);

  if (!marker) return null;

  const status = STATUS_CONFIG[marker.status] || STATUS_CONFIG.ongoing;
  const hasPhoto = !!marker.photoUri;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Dim backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Centered card */}
      <View style={styles.centeredView} pointerEvents="box-none">
        <Animated.View style={[styles.card, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>

          {/* ── Photo ── */}
          {hasPhoto ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: marker.photoUri }} style={styles.photo} resizeMode="cover" />
              {/* gradient tint at bottom for readability */}
              <View style={styles.photoGradient} />
              {/* close button over photo */}
              <TouchableOpacity style={styles.photoCLoseBtn} onPress={onClose}>
                <Ionicons name="close" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.photoContainer, styles.photoPlaceholder]}>
              <Text style={styles.placeholderEmoji}>🔥</Text>
              <TouchableOpacity style={styles.photoCLoseBtn} onPress={onClose}>
                <Ionicons name="close" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Card header ── */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.fireIconWrap}>
                <Text style={styles.fireEmoji}>🔥</Text>
              </View>
              <View style={styles.headerTextBlock}>
                <Text style={styles.cardTitle}>Fire Emergency</Text>
                <Text style={styles.cardAddress} numberOfLines={1}>{marker.address}</Text>
              </View>
            </View>
            {/* close button only shown when no photo (photo has its own close) */}
            {!hasPhoto && (
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={16} color={COLORS.slate500} />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Status + time row ── */}
          <View style={[styles.statusRow, { backgroundColor: status.bg }]}>
            <View style={styles.statusLeft}>
              {status.pulse ? (
                <View style={styles.pulseWrap}>
                  <Animated.View
                    style={[
                      styles.pulseRing,
                      {
                        backgroundColor: status.color,
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseAnim.interpolate({ inputRange: [1, 1.6], outputRange: [0.4, 0] }),
                      },
                    ]}
                  />
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                </View>
              ) : (
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              )}
              <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
            </View>
            <View style={styles.statusDivider} />
            <Ionicons name="time-outline" size={13} color={COLORS.slate500} />
            <Text style={styles.timeText}>{marker.reportedAt}</Text>
          </View>

          {/* ── AI Analysis ── */}
          <View style={styles.analysisSection}>
            <View style={styles.aiBadge}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.emerald} />
              <Text style={styles.aiBadgeText}>AI Analysis</Text>
            </View>
            <ScrollView style={styles.analysisScroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
              <Text style={styles.analysisText}>{marker.aiAnalysis}</Text>
            </ScrollView>
          </View>

          {/* ── Reporter note ── */}
          {!!marker.description && (
            <View style={styles.noteSection}>
              <Text style={styles.noteLabel}>REPORTER'S NOTE</Text>
              <Text style={styles.noteText} numberOfLines={2}>{marker.description}</Text>
            </View>
          )}

          {/* ── Dismiss ── */}
          <TouchableOpacity style={styles.dismissBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    ...SHADOWS.large,
  },

  // Photo
  photoContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    backgroundColor: '#1A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 54,
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  photoCLoseBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  fireIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireEmoji: {
    fontSize: 24,
  },
  headerTextBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  cardAddress: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate500,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },

  // Status row
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: 6,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseWrap: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.slate200,
    marginHorizontal: 2,
  },
  timeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.slate500,
    fontWeight: '500',
  },

  // AI Analysis
  analysisSection: {
    padding: SPACING.md,
    paddingTop: 12,
    paddingBottom: 8,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.emerald + '18',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
    letterSpacing: 0.3,
  },
  analysisScroll: {
    maxHeight: 78,
  },
  analysisText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.slate700,
    lineHeight: 19,
    fontWeight: '500',
  },

  // Reporter note
  noteSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: 10,
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.slate400,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  noteText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.slate700,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Dismiss
  dismissBtn: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    paddingVertical: 13,
    backgroundColor: COLORS.slate100,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.slate600,
    letterSpacing: 0.2,
  },
});
