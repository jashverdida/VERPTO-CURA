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
import IncidentCard from '../components/IncidentCard';
import { MOCK_INCIDENTS, TABS } from '../constants/mockData';

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
      </View>

      {/* Prominent Tabs */}
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
        renderItem={({ item }) => (
          <IncidentCard item={item} onPress={() => handleIncidentPress(item)} />
        )}
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
    justifyContent: 'flex-start',
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
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: 4,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.slate100,
  },
  activeTab: {
    backgroundColor: COLORS.emerald,
    ...SHADOWS.small,
  },
  tabText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.slate600,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.white,
  },
  listContainer: {
    padding: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
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
