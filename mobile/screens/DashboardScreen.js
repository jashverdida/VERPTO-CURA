import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import FireOutModal from '../components/FireOutModal';
import ProximityAlertModal from '../components/ProximityAlertModal';
import { MOCK_INCIDENTS, TABS } from '../constants/mockData';
import { supabase } from '../lib/supabase';

function formatRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

// ── Convert a Supabase incidents row → incident shape for IncidentCard + IncidentModal ──
function fireToIncident(row) {
  const TYPE_LABELS = { FIRE: 'Fire', VEHICLE: 'Vehicle', HAZMAT: 'HAZMAT', MEDICAL: 'Medical', SEARCH_RESCUE: 'Search & Rescue' };
  const statusLabel =
    row.status === 'active' ? 'Active' :
    row.status === 'resolved' ? 'Resolved' : 'In Progress';
  const typeLabel = TYPE_LABELS[row.type] ?? row.type ?? 'Emergency';

  let imageUrl = null;
  if (row.image_path) {
    const { data } = supabase.storage.from('camera-reports').getPublicUrl(row.image_path);
    imageUrl = data?.publicUrl ?? null;
  }

  return {
    id: row.id,
    type: typeLabel,
    title: `${typeLabel} Emergency`,
    location: row.address || 'Unknown location',
    distance: '—',
    time: formatRelativeTime(row.created_at),
    status: statusLabel,
    category: 'Own Emergency',
    priority: row.severity === 'high' ? 'Critical' : 'Medium',
    address: row.address || 'Unknown location',
    reportedAt: formatRelativeTime(row.created_at),
    description: row.description || 'Emergency reported by citizen.',
    severity: row.severity ?? 'medium',
    imageUrl,
    aiAnalysis: null,
  };
}

export default function DashboardScreen({ navigation }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fireOutModalVisible, setFireOutModalVisible] = useState(false);
  const [proximityAlertVisible, setProximityAlertVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [fireIncidents, setFireIncidents] = useState([]);

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => setFireIncidents((data ?? []).map(fireToIncident)));

      const channel = supabase
        .channel('dashboard-incidents')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' },
          payload => setFireIncidents(prev => [fireToIncident(payload.new), ...prev]))
        .subscribe();

      return () => supabase.removeChannel(channel);
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

  const openFireOutModal = () => {
    setFireOutModalVisible(true);
  };

  const closeFireOutModal = () => {
    setFireOutModalVisible(false);
  };

  const openProximityAlert = () => {
    setProximityAlertVisible(true);
  };

  const closeProximityAlert = () => {
    setProximityAlertVisible(false);
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
        {/* Demo Buttons */}
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={openProximityAlert}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle" size={16} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fireOutButton}
            onPress={openFireOutModal}
            activeOpacity={0.7}
          >
            <Ionicons name="flame" size={16} color={COLORS.white} />
          </TouchableOpacity>
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

      {/* Fire Out Modal */}
      <FireOutModal
        visible={fireOutModalVisible}
        incident={selectedIncident}
        onClose={closeFireOutModal}
      />

      {/* Proximity Alert Modal */}
      <ProximityAlertModal
        visible={proximityAlertVisible}
        onClose={closeProximityAlert}
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
  headerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  fireOutButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.fireRed,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
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
