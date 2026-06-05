import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import { supabase } from '../lib/supabase';

/* ── Filter tabs ── */
const FILTER_TABS = ['All', 'Fire', 'Medical', 'Vehicle', 'HAZMAT', 'Rescue'];

/* ── Type config ── */
const TYPE_CFG = {
  FIRE:          { color: '#EF4444', bg: 'rgba(239,68,68,0.18)',  icon: 'flame',   label: 'Fire'    },
  VEHICLE:       { color: '#F97316', bg: 'rgba(249,115,22,0.18)', icon: 'car',     label: 'Vehicle' },
  MEDICAL:       { color: '#3B82F6', bg: 'rgba(59,130,246,0.18)', icon: 'medkit',  label: 'Medical' },
  HAZMAT:        { color: '#8B5CF6', bg: 'rgba(139,92,246,0.18)', icon: 'flask',   label: 'HAZMAT'  },
  SEARCH_RESCUE: { color: '#14B8A6', bg: 'rgba(20,184,166,0.18)', icon: 'search',  label: 'Rescue'  },
};

/* ── Status config ── */
const STATUS_CFG = {
  'On-Going':      { bg: 'rgba(245,158,11,0.15)',  text: '#F59E0B', border: 'rgba(245,158,11,0.35)',  dot: '#F59E0B' },
  'Under Control': { bg: 'rgba(59,130,246,0.15)',  text: '#60A5FA', border: 'rgba(59,130,246,0.35)',  dot: '#3B82F6' },
  'Resolved':      { bg: 'rgba(34,197,94,0.15)',   text: '#4ADE80', border: 'rgba(34,197,94,0.35)',   dot: '#22C55E' },
};

/* ── Helpers ── */
function formatTime(iso) {
  if (!iso) return 'Just now';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getResponderStatus(row) {
  if (row.status === 'resolved')                           return 'Resolved';
  if (row.status === 'in_progress' || row.status === 'assigned') return 'Under Control';
  return 'On-Going';
}

const REPORTERS = [
  'Maria Santos', 'Juan dela Cruz', 'Ana Reyes', 'Carlos Bautista',
  'Rosa Villanueva', 'Jose Mendoza', 'Elena Guerrero', 'Roberto Cruz',
];

function getReporter(id) {
  const hash = typeof id === 'string'
    ? id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % REPORTERS.length
    : (Number(id) || 0) % REPORTERS.length;
  return REPORTERS[hash];
}

/* ── Mock incidents so the list is never empty ── */
const MOCK = [
  {
    id: 'mock-fire-1', type: 'FIRE', status: 'active',
    address: 'Taft Avenue, Ermita, Manila',
    description: 'Residential building fire on 3rd floor. Occupants evacuating. Fire spreading to adjacent unit.',
    severity: 'high', created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'mock-med-1', type: 'MEDICAL', status: 'in_progress',
    address: 'P. Burgos St., Malate, Manila',
    description: 'Elderly patient collapsed. Bystanders performing CPR. Suspected cardiac arrest.',
    severity: 'high', created_at: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 'mock-veh-1', type: 'VEHICLE', status: 'resolved',
    address: 'EDSA-Magallanes Interchange, Makati',
    description: '3-vehicle collision. 2 with minor injuries. Road partially blocked on northbound lane.',
    severity: 'medium', created_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'mock-haz-1', type: 'HAZMAT', status: 'active',
    address: 'Port Area Industrial Zone, Manila',
    description: 'Chemical drum leaking near warehouse. LPG smell reported. Workers evacuated.',
    severity: 'critical', created_at: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    id: 'mock-rsc-1', type: 'SEARCH_RESCUE', status: 'in_progress',
    address: 'Intramuros, Manila',
    description: 'Person trapped under collapsed scaffolding. 1 confirmed trapped, responsive.',
    severity: 'high', created_at: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'mock-fire-2', type: 'FIRE', status: 'active',
    address: 'VECO Substation B, Escario Street, Manila',
    description: 'Transformer fire — secondary containment breached. 2 personnel with minor burns. HIGH RISK.',
    severity: 'critical', created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
];

/* ══════════════════════════════════════════════════════════════════ */

export default function ResponderStatusScreen() {
  const [incidents,        setIncidents]        = useState([]);
  const [activeFilter,     setActiveFilter]     = useState('All');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalVisible,     setModalVisible]     = useState(false);

  useFocusEffect(useCallback(() => {
    supabase.from('incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setIncidents([...(data ?? []), ...MOCK]));

    const ch = supabase.channel('responder-status-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' },
        (p) => setIncidents(prev => [p.new, ...prev]))
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, []));

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return incidents;
    const keyMap = {
      Fire: 'FIRE', Medical: 'MEDICAL', Vehicle: 'VEHICLE',
      HAZMAT: 'HAZMAT', Rescue: 'SEARCH_RESCUE',
    };
    const key = keyMap[activeFilter] ?? activeFilter.toUpperCase();
    return incidents.filter(inc => (inc.type ?? '').toUpperCase() === key);
  }, [incidents, activeFilter]);

  const openDetail = (inc) => { setSelectedIncident(inc); setModalVisible(true); };

  /* ── Incident Card ── */
  const renderItem = ({ item }) => {
    const key       = (item.type ?? '').toUpperCase();
    const cfg       = TYPE_CFG[key] ?? { color: '#6B7280', bg: 'rgba(107,114,128,0.18)', icon: 'alert-circle', label: 'Unknown' };
    const status    = getResponderStatus(item);
    const statusCfg = STATUS_CFG[status];
    const isFire    = key === 'FIRE';

    return (
      <TouchableOpacity style={styles.card} onPress={() => openDetail(item)} activeOpacity={0.85}>
        <View style={[styles.cardStripe, { backgroundColor: cfg.color }]} />
        <View style={styles.cardBody}>

          {/* Top row: type icon + label + status pill */}
          <View style={styles.cardTopRow}>
            <View style={[styles.typeIconBg, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={16} color={cfg.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.typeLabel, { color: cfg.color }]}>{cfg.label} Emergency</Text>
              <Text style={styles.cardAddr} numberOfLines={1}>{item.address || 'Unknown location'}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
              <View style={[styles.statusDot, { backgroundColor: statusCfg.dot }]} />
              <Text style={[styles.statusText, { color: statusCfg.text }]}>{status}</Text>
            </View>
          </View>

          {/* Description */}
          {!!item.description && (
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          )}

          {/* Bottom row: reporter + fire alarm + time */}
          <View style={styles.cardBottomRow}>
            <View style={styles.reporterRow}>
              <Ionicons name="person-outline" size={12} color="rgba(255,255,255,0.4)" />
              <Text style={styles.reporterText}>Reported by {getReporter(item.id)}</Text>
            </View>
            <View style={styles.metaRight}>
              {isFire && (
                <View style={styles.alarmBadge}>
                  <Ionicons name="warning-outline" size={10} color="#EF4444" />
                  <Text style={styles.alarmBadgeText}>Level 1</Text>
                </View>
              )}
              <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
            </View>
          </View>

        </View>
      </TouchableOpacity>
    );
  };

  /* ── Detail Bottom Sheet Modal ── */
  const renderModal = () => {
    if (!selectedIncident) return null;
    const key       = (selectedIncident.type ?? '').toUpperCase();
    const cfg       = TYPE_CFG[key] ?? { color: '#6B7280', bg: 'rgba(107,114,128,0.18)', icon: 'alert-circle', label: 'Unknown' };
    const status    = getResponderStatus(selectedIncident);
    const statusCfg = STATUS_CFG[status];
    const isFire    = key === 'FIRE';
    const reporter  = getReporter(selectedIncident.id);

    return (
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: cfg.color + '35' }]}>
              <View style={[styles.modalTypeIcon, { backgroundColor: cfg.color }]}>
                <Ionicons name={cfg.icon} size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTypeName, { color: cfg.color }]}>{cfg.label} Emergency</Text>
                <Text style={styles.modalAddr}>{selectedIncident.address || 'Unknown location'}</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>

              {/* Status + Fire Alarm row */}
              <View style={styles.modalBadgeRow}>
                <View style={[styles.modalStatusPill, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusCfg.dot }]} />
                  <Text style={[styles.modalStatusText, { color: statusCfg.text }]}>{status}</Text>
                </View>
                {isFire && (
                  <View style={styles.modalAlarmBadge}>
                    <Ionicons name="flame" size={12} color="#EF4444" />
                    <Text style={styles.modalAlarmText}>Fire Alarm Level 1</Text>
                    <Text style={styles.modalAlarmNote}>— Command Center escalates</Text>
                  </View>
                )}
              </View>

              {/* Description */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>INCIDENT DESCRIPTION</Text>
                <Text style={styles.modalSectionText}>
                  {selectedIncident.description || 'Emergency reported by citizen. No additional description provided.'}
                </Text>
              </View>

              {/* Reporter */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>REPORTED BY</Text>
                <View style={styles.reporterCard}>
                  <View style={styles.reporterAvatar}>
                    <Text style={styles.reporterAvatarText}>{reporter.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.reporterName}>{reporter}</Text>
                    <Text style={styles.reporterRole}>Registered Citizen · CURA</Text>
                  </View>
                </View>
              </View>

              {/* Details */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionLabel}>INCIDENT DETAILS</Text>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.45)" />
                  <Text style={styles.detailText}>Reported {formatTime(selectedIncident.created_at)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="warning-outline" size={14} color="rgba(255,255,255,0.45)" />
                  <Text style={styles.detailText}>
                    Severity: {selectedIncident.severity
                      ? selectedIncident.severity.charAt(0).toUpperCase() + selectedIncident.severity.slice(1)
                      : 'Medium'}
                  </Text>
                </View>
                {(selectedIncident.lat || selectedIncident.latitude) && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.45)" />
                    <Text style={styles.detailText}>
                      {(selectedIncident.lat ?? selectedIncident.latitude)?.toFixed(5)},&nbsp;
                      {(selectedIncident.lng ?? selectedIncident.longitude)?.toFixed(5)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ height: 32 }} />
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  /* ── Render ── */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#031929" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CURA</Text>
          <Text style={styles.headerSubtitle}>Emergency Status</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_TABS.map(tab => {
          const active = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Count banner */}
      <View style={styles.countBanner}>
        <Text style={styles.countText}>
          {filtered.length} incident{filtered.length !== 1 ? 's' : ''} · {activeFilter}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={56} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyText}>No active incidents</Text>
            <Text style={styles.emptySubText}>All clear in this category</Text>
          </View>
        }
      />

      {renderModal()}
    </View>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#031929' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle:    { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  headerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    backgroundColor: `${COLORS.emerald}18`, borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: `${COLORS.emerald}35`,
  },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.emerald },
  liveText: { fontSize: 11, fontWeight: '700', color: COLORS.emerald },

  filterRow:     { marginBottom: SPACING.sm },
  filterContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  filterChip: {
    height: 44,
    paddingHorizontal: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.emerald, borderColor: COLORS.emerald,
    shadowColor: COLORS.emerald, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.45, shadowRadius: 6, elevation: 4,
  },
  filterChipText:       { fontSize: FONT_SIZES.md, fontWeight: '600', color: 'rgba(255,255,255,0.55)', includeFontPadding: false },
  filterChipTextActive: { color: '#fff', fontWeight: '700', includeFontPadding: false },

  countBanner: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  countText:   { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },

  listContent: { paddingHorizontal: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.xl },

  /* Card */
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  cardStripe: { width: 4 },
  cardBody:   { flex: 1, padding: SPACING.md },

  cardTopRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  typeIconBg: {
    width: 36, height: 36, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
  },
  typeLabel: { fontSize: FONT_SIZES.sm, fontWeight: '800', marginBottom: 2 },
  cardAddr:  { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },

  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1,
  },
  statusDot:  { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800' },

  cardDesc: {
    fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.5)',
    lineHeight: 18, marginBottom: SPACING.sm,
  },

  cardBottomRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  reporterRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reporterText: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  metaRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },

  alarmBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2,
    backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  alarmBadgeText: { fontSize: 9, fontWeight: '800', color: '#EF4444' },
  timeText:       { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.3)', fontWeight: '500' },

  /* Empty */
  emptyState: { alignItems: 'center', paddingTop: 80, gap: SPACING.sm },
  emptyText:    { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.35)', fontWeight: '700' },
  emptySubText: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.2)' },

  /* Modal */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(2,14,28,0.88)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0A1E32',
    borderTopLeftRadius: BORDER_RADIUS.xxl, borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: '88%',
    borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center', marginTop: SPACING.md, marginBottom: SPACING.sm,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  modalTypeIcon: {
    width: 46, height: 46, borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  modalTypeName: { fontSize: FONT_SIZES.lg, fontWeight: '800', marginBottom: 2 },
  modalAddr:     { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  modalCloseBtn: {
    width: 34, height: 34, borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center',
  },

  modalBody: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },

  modalBadgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    marginBottom: SPACING.lg, flexWrap: 'wrap',
  },
  modalStatusPill: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1,
  },
  modalStatusText: { fontSize: FONT_SIZES.sm, fontWeight: '800' },
  modalAlarmBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  modalAlarmText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: '#EF4444' },
  modalAlarmNote: { fontSize: 10, color: 'rgba(239,68,68,0.65)', fontWeight: '500' },

  modalSection:      { marginBottom: SPACING.lg },
  modalSectionLabel: {
    fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACING.sm,
  },
  modalSectionText: {
    fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.78)', lineHeight: 22, fontWeight: '400',
  },

  reporterCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  reporterAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.emerald, justifyContent: 'center', alignItems: 'center',
  },
  reporterAvatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  reporterName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  reporterRole: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xs + 2 },
  detailText: { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
});
