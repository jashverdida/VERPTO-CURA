import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

export default function IncidentCard({ item, onPress }) {
  let iconName = 'alert-circle';
  let iconColor = COLORS.slate500;

  if (item.type === 'Medical') { iconName = 'medical'; iconColor = COLORS.medicalBlue; }
  else if (item.type === 'Fire') { iconName = 'flame'; iconColor = COLORS.fireRed; }
  else if (item.type === 'Accident') { iconName = 'car'; iconColor = COLORS.accidentOrange; }
  else if (item.type === 'Security') { iconName = 'shield-half'; iconColor = COLORS.rescueYellow; }

  const priorityColor =
    item.priority === 'Critical' ? COLORS.fireRed :
    item.priority === 'High' ? COLORS.accidentOrange :
    item.priority === 'Medium' ? COLORS.rescueYellow :
    COLORS.emerald;

  return (
    <TouchableOpacity
      style={styles.incidentCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <View style={styles.incidentInfo}>
        <View style={styles.incidentTitleRow}>
          <Text style={styles.incidentTitle}>{item.title}</Text>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
        </View>
        <Text style={styles.incidentLocation}>
          <Ionicons name="location-outline" size={12} color={COLORS.slate400} /> {item.location} · {item.distance}
        </Text>
      </View>
      <View style={styles.incidentMeta}>
        <Text style={styles.incidentTime}>{item.time}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'Active' ? COLORS.fireRed + '18' : item.status === 'Assigned' ? COLORS.accidentOrange + '18' : COLORS.emerald + '18' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'Active' ? COLORS.fireRed : item.status === 'Assigned' ? COLORS.accidentOrange : COLORS.emerald }
          ]}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  incidentCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  incidentInfo: {
    flex: 1,
  },
  incidentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  incidentTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.slate900,
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  incidentLocation: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate500,
    fontWeight: '500',
  },
  incidentMeta: {
    alignItems: 'flex-end',
  },
  incidentTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate400,
    fontWeight: '500',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
});
