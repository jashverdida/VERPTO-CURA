import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
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

export default function DashboardScreen({ navigation }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const reportScale = useRef(new Animated.Value(1)).current;

  const handleReportPressIn = () => {
    Animated.spring(reportScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handleReportPressOut = () => {
    Animated.spring(reportScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleReportPress = () => {
    navigation.navigate('Camera');
  };

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
          <Text style={styles.incidentTitle}>{item.title}</Text>
          <Text style={styles.incidentLocation}>
            <Ionicons name="location-outline" size={12} color={COLORS.slate400} /> {item.location} • {item.distance}
          </Text>
        </View>
        <View style={styles.incidentMeta}>
          <Text style={styles.incidentTime}>{item.time}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'Active' ? COLORS.fireRed + '20' : COLORS.emerald + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'Active' ? COLORS.fireRed : COLORS.emerald }
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
            <Ionicons name="shield-checkmark" size={24} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>CURA</Text>
            <Text style={styles.headerSubtitle}>Command Center</Text>
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

      {/* Hero Button */}
      <View style={styles.heroContainer}>
        <Animated.View style={{ transform: [{ scale: reportScale }] }}>
          <TouchableOpacity
            style={styles.heroButton}
            onPressIn={handleReportPressIn}
            onPressOut={handleReportPressOut}
            onPress={handleReportPress}
            activeOpacity={1}
          >
            <View style={styles.heroButtonInner}>
              <Ionicons name="warning" size={32} color={COLORS.white} style={styles.heroIcon} />
              <View>
                <Text style={styles.heroTitle}>REPORT EMERGENCY</Text>
                <Text style={styles.heroSubtitle}>Tap to open camera and broadcast</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 20,
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
  heroContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  heroButton: {
    backgroundColor: COLORS.fireRed,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
    shadowColor: COLORS.fireRed,
  },
  heroButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    marginRight: SPACING.md,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
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
  incidentTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.slate900,
    marginBottom: 4,
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
