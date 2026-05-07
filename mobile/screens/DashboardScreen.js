import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import IncidentModal from '../components/IncidentModal';
import IncidentCard from '../components/IncidentCard';
import { MOCK_INCIDENTS, TABS } from '../constants/mockData';
import { getFireReports, subscribeFireReports } from '../constants/SharedState';

// ── Convert a fire report → incident shape consumed by IncidentCard + IncidentModal ──
function fireToIncident(report) {
  const statusLabel =
    report.status === 'ongoing' ? 'Active' :
    report.status === 'under_control' ? 'In Progress' : 'Resolved';

  return {
    // IncidentCard fields
    id: report.id,
    type: 'Fire',
    title: 'Fire Emergency',
    location: report.address,
    distance: '—',
    time: report.reportedAt,
    status: statusLabel,
    category: 'Own Emergency',
    priority: 'Critical',
    // IncidentModal fields
    address: report.address,
    reportedAt: report.reportedAt,
    description: report.description || 'Fire emergency reported by citizen.',
    severity: 'Critical',
    imageUrl: report.photoUri || null,
    aiAnalysis: report.aiAnalysis || null,
  };
}

export default function DashboardScreen({ navigation }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [fireIncidents, setFireIncidents] = useState(() =>
    getFireReports().map(fireToIncident)
  );

  // Keep fire incidents in sync whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      setFireIncidents(getFireReports().map(fireToIncident));
      const unsub = subscribeFireReports((reports) => {
        setFireIncidents(reports.map(fireToIncident));
      });
      return unsub;
    }, [])
  );

  const handleIncidentPress = (incident) => {
    setSelectedIncident(incident);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedIncident(null);
  };

  // Merge mock incidents with live fire reports
  const allIncidents = useMemo(() => [...fireIncidents, ...MOCK_INCIDENTS], [fireIncidents]);

  const filteredIncidents = useMemo(() => {
    if (activeTab === 'All') return allIncidents;
    return allIncidents.filter(inc => inc.category === activeTab);
  }, [activeTab, allIncidents]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../assets/cura-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>CURA</Text>
            <Text style={styles.headerSubtitle}>Incident Status</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
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
  logoImage: {
    width: 42,
    height: 42,
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
