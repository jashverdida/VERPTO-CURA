import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import IncidentModal from '../components/IncidentModal';

const MOCK_INCIDENTS = [
  { id: '1', type: 'Medical', title: 'Cardiac Arrest', location: '123 Main St', time: '2 min ago', distance: '0.2 mi', status: 'Active', category: 'Nearby', priority: 'High' },
  { id: '2', type: 'Fire', title: 'Building Fire', location: '456 Elm St', time: '5 min ago', distance: '1.5 mi', status: 'Active', category: 'All', priority: 'Critical' },
  { id: '3', type: 'Accident', title: 'Vehicle Collision', location: '789 Oak Ave', time: '10 min ago', distance: '0.0 mi', status: 'Assigned', category: 'Own Emergency', priority: 'High' },
  { id: '4', type: 'Security', title: 'Intrusion Alarm', location: '101 Pine Rd', time: '1 hr ago', distance: '3.2 mi', status: 'Resolved', category: 'All', priority: 'Low' },
  { id: '5', type: 'Medical', title: 'Fall Injury', location: '202 Maple Dr', time: '15 min ago', distance: '0.5 mi', status: 'Active', category: 'Nearby', priority: 'Medium' },
];

const TABS = ['Own Emergency', 'Nearby', 'All'];

const SUMMARY_STATS = [
  { label: 'Active', count: 3, color: COLORS.fireRed, icon: 'warning' },
  { label: 'Assigned', count: 1, color: COLORS.accidentOrange, icon: 'person' },
  { label: 'Resolved', count: 1, color: COLORS.emerald, icon: 'checkmark-circle' },
];

export default function DashboardScreen({ navigation }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const handleIncidentPress = (incident) => {
    setSelectedIncident(incident);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedIncident(null);
  };

  const filteredIncidents = useMemo(() => {
    if (activeTab === 'All') return MOCK_INCIDENTS;
    return MOCK_INCIDENTS.filter(inc => inc.category === activeTab);
  }, [activeTab]);

  const renderIncident = ({ item }) => {
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
        onPress={() => handleIncidentPress(item)}
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
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={22} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>CURA</Text>
            <Text style={styles.headerSubtitle}>Incident Status</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.slate700} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="person-circle-outline" size={26} color={COLORS.slate700} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Stats Row */}
      <View style={styles.statsRow}>
        {SUMMARY_STATS.map((stat) => (
          <View key={stat.label} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <Ionicons name={stat.icon} size={18} color={stat.color} style={{ marginBottom: 4 }} />
            <Text style={[styles.statCount, { color: stat.color }]}>{stat.count}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Sticky Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Incident List */}
      <FlatList
        data={filteredIncidents}
        keyExtractor={(item) => item.id}
        renderItem={renderIncident}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.slate300} />
            <Text style={styles.emptyText}>No incidents in this category</Text>
          </View>
        }
      />

      {/* Incident Modal */}
      <IncidentModal
        visible={modalVisible}
        incident={selectedIncident}
        onClose={closeModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 44,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.slate900,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.slate500,
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.slate50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.fireRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    padding: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statCount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.slate500,
    marginTop: 1,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  tab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.slate100,
  },
  activeTab: {
    backgroundColor: COLORS.emerald,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.slate600,
  },
  activeTabText: {
    color: COLORS.white,
  },
  listContainer: {
    padding: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
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
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.slate400,
    fontWeight: '500',
  },
});
