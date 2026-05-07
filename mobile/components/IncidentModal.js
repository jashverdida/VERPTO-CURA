import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/theme';

const { height } = Dimensions.get('window');

const getStatusColor = (status) => {
  switch (status) {
    case 'Verification Pending': return COLORS.warning;
    case 'Units Responding': return COLORS.medicalBlue;
    case 'Assessment': return COLORS.accidentOrange;
    case 'In Progress': return COLORS.emerald;
    default: return COLORS.slate500;
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'Critical': return COLORS.fireRed;
    case 'High': return COLORS.accidentOrange;
    case 'Medium': return COLORS.warning;
    case 'Low': return COLORS.emerald;
    default: return COLORS.slate500;
  }
};

const getTypeIcon = (title) => {
  if (title.includes('Fire')) return 'flame';
  if (title.includes('Medical')) return 'medkit';
  if (title.includes('Vehicle') || title.includes('Collision')) return 'car';
  if (title.includes('Rescue') || title.includes('Water')) return 'boat';
  return 'alert-circle';
};

const getTypeColor = (title) => {
  if (title.includes('Fire')) return COLORS.fireRed;
  if (title.includes('Medical')) return COLORS.medicalBlue;
  if (title.includes('Vehicle') || title.includes('Collision')) return COLORS.accidentOrange;
  if (title.includes('Rescue') || title.includes('Water')) return COLORS.rescueYellow;
  return COLORS.emerald;
};

export default function IncidentModal({ visible, incident, onClose }) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!incident) return null;

  const typeColor = getTypeColor(incident.title);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropOpacity },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: typeColor + '15' }]}>
              <Ionicons
                name={getTypeIcon(incident.title)}
                size={24}
                color={typeColor}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{incident.title}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(incident.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(incident.status) }]}>
                    {incident.status}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.slate500} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Image / Placeholder */}
            <View style={styles.imageContainer}>
              {incident.imageUrl ? (
                <Image
                  source={{ uri: incident.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Ionicons
                    name={getTypeIcon(incident.title)}
                    size={48}
                    color={typeColor}
                  />
                  <Text style={styles.placeholderText}>Incident Scene</Text>
                </View>
              )}
              <View style={styles.imageOverlay}>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(incident.severity) }]}>
                  <Text style={styles.severityText}>{incident.severity} Priority</Text>
                </View>
              </View>
            </View>

            {/* Details */}
            <View style={styles.details}>
              {/* Location */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="location" size={18} color={COLORS.emerald} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{incident.address}</Text>
                </View>
              </View>

              {/* Time */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="time" size={18} color={COLORS.emerald} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Reported</Text>
                  <Text style={styles.detailValue}>{incident.reportedAt}</Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Incident Details</Text>
                <Text style={styles.descriptionText}>{incident.description}</Text>
              </View>

              {/* AI Analysis — shown for fire/citizen reports */}
              {!!incident.aiAnalysis && (
                <View style={[styles.descriptionContainer, styles.aiAnalysisContainer]}>
                  <View style={styles.aiAnalysisLabelRow}>
                    <Ionicons name="shield-checkmark" size={13} color={COLORS.emerald} />
                    <Text style={[styles.descriptionLabel, { color: COLORS.emerald }]}>AI Analysis</Text>
                  </View>
                  <Text style={styles.descriptionText}>{incident.aiAnalysis}</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="navigate" size={18} color={COLORS.emerald} />
                <Text style={styles.secondaryButtonText}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton}>
                <Ionicons name="call" size={18} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>Contact Dispatch</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: height * 0.85,
    ...SHADOWS.large,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.slate300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.slate900,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  imageContainer: {
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.slate500,
  },
  imageOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  details: {
    marginTop: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.emerald + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.slate500,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate800,
  },
  descriptionContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate600,
    marginBottom: SPACING.xs,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.slate700,
  },
  aiAnalysisContainer: {
    marginTop: SPACING.sm,
    borderColor: COLORS.emerald + '30',
    backgroundColor: COLORS.emerald + '08',
  },
  aiAnalysisLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: Platform.OS === 'ios' ? SPACING.xxl : SPACING.lg,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.emerald,
    gap: SPACING.xs,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.emerald,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.emerald,
    gap: SPACING.xs,
    ...SHADOWS.emerald,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
