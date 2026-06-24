import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import { supabase } from '../lib/supabase';
import ProximityAlertModal from '../components/ProximityAlertModal';
import FireOutModal from '../components/FireOutModal';
import UnderControlModal from '../components/UnderControlModal';
import AmbulanceAlertModal from '../components/AmbulanceAlertModal';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ICON_BY_TYPE = { critical: 'flame', warning: 'warning', info: 'information-circle' };

function formatRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

function rowToAlert(row) {
  return {
    id:   row.id,
    type: row.type,
    icon: ICON_BY_TYPE[row.type] ?? 'information-circle',
    title:   row.title,
    body:    row.body ?? '',
    time:    formatRelativeTime(row.created_at),
    read:    row.read ?? false,
    subtype: row.subtype ?? null,
  };
}

// ── Theme config ─────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  critical: {
    bg: '#FFF5F5', iconBg: '#FEE2E2', iconColor: '#EF4444',
    dot: '#EF4444', label: 'Critical', labelColor: '#EF4444', labelBg: '#FEE2E2',
    border: '#FECACA',
  },
  warning: {
    bg: '#FFFBEB', iconBg: '#FEF3C7', iconColor: '#F59E0B',
    dot: '#F59E0B', label: 'Warning', labelColor: '#D97706', labelBg: '#FEF3C7',
    border: '#FDE68A',
  },
  info: {
    bg: COLORS.white, iconBg: '#F0FDF4', iconColor: COLORS.emerald,
    dot: COLORS.emerald, label: 'Info', labelColor: COLORS.emeraldDark, labelBg: '#D1FAE5',
    border: COLORS.slate200,
  },
  resolved: {
    bg: '#F0FDF4', iconBg: '#D1FAE5', iconColor: COLORS.emerald,
    dot: COLORS.emerald, label: 'Resolved', labelColor: COLORS.emeraldDark, labelBg: '#D1FAE5',
    border: '#A7F3D0',
  },
  contained: {
    bg: '#FFFBEB', iconBg: '#FEF3C7', iconColor: '#D97706',
    dot: '#D97706', label: 'Under Control', labelColor: '#92400E', labelBg: '#FDE68A',
    border: '#FDE68A',
  },
  ambulance: {
    bg: '#EFF6FF', iconBg: '#DBEAFE', iconColor: '#3B82F6',
    dot: '#EF4444', label: 'Ambulance', labelColor: '#1D4ED8', labelBg: '#DBEAFE',
    border: '#BFDBFE',
  },
};

const FILTERS = ['All', 'Critical', 'Warning', 'Info'];

// ── Featured fire cards (always shown at top) ────────────────────────────────

const FEATURED = [
  {
    id: 'demo-fire-nearby',
    type: 'critical',
    icon: 'flame',
    title: 'Fire Nearby – Structure Fire',
    body: 'Active structure fire at Rizal Avenue, Barangay 456 — 0.8 km NE of your location.',
    time: 'Just now',
    read: false,
    modal: 'proximity',
    hasImage: true,
    imageSource: 'fire',
  },
  {
    id: 'demo-under-control',
    type: 'contained',
    icon: 'shield-checkmark',
    title: 'Fire Under Control',
    body: 'Perimeter established. 6 units on scene at Rizal Avenue — residents advised to stay clear.',
    time: '45 min ago',
    read: false,
    modal: 'under-control',
    hasImage: true,
    imageSource: 'fire',
  },
  {
    id: 'demo-ambulance',
    type: 'ambulance',
    icon: 'medical',
    title: 'Ambulance Incoming!',
    body: 'Emergency vehicle approaching southbound on your street. Please clear all lanes immediately.',
    time: '3 min ago',
    read: false,
    modal: 'ambulance',
    hasImage: true,
    imageSource: 'vehicle',
  },
  {
    id: 'demo-fire-out',
    type: 'resolved',
    icon: 'checkmark-circle',
    title: 'Fire Out — Incident Resolved',
    body: 'Structure fire at 456 Elm St, District 3 successfully extinguished after 1 hr 15 min.',
    time: '2 hr ago',
    read: false,
    modal: 'fire-out',
    hasImage: true,
    imageSource: 'fire',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AlertsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [alerts, setAlerts]             = useState([]);
  const [showProximity,     setShowProximity]     = useState(false);
  const [showFireOut,       setShowFireOut]       = useState(false);
  const [showUnderControl,  setShowUnderControl]  = useState(false);
  const [showAmbulance,     setShowAmbulance]     = useState(false);

  useEffect(() => {
    supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setAlerts((data ?? []).map(rowToAlert)));

    const channel = supabase
      .channel('alerts-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' },
        payload => setAlerts(prev => [rowToAlert(payload.new), ...prev]))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const filtered = alerts.filter((a) => {
    if (activeFilter === 'All') return true;
    return a.type === activeFilter.toLowerCase();
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    supabase.from('alerts').update({ read: true }).eq('read', false).then(() => {});
  };

  const markRead = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    supabase.from('alerts').update({ read: true }).eq('id', id).then(() => {});
  };

  const handleCardPress = (item) => {
    if (item.modal === 'proximity')    { setShowProximity(true);    return; }
    if (item.modal === 'fire-out')     { setShowFireOut(true);      return; }
    if (item.modal === 'under-control'){ setShowUnderControl(true); return; }
    if (item.modal === 'ambulance')    { setShowAmbulance(true);    return; }
    // DB alerts — best-effort modal routing by type/keywords
    if (item.type === 'critical' && /fire/i.test(item.title + item.body)) {
      setShowProximity(true);
    } else if (/ambulance/i.test(item.title + item.body)) {
      setShowAmbulance(true);
    }
    if (item.id) markRead(item.id);
  };

  const renderCard = ({ item, index }) => {
    const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.info;
    const isFeatured = item.id?.toString().startsWith('demo-');

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: cfg.bg, borderColor: cfg.border },
          item.read && !isFeatured && styles.cardRead,
          isFeatured && styles.cardFeatured,
        ]}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.75}
      >
        {/* Unread dot */}
        {!item.read && <View style={[styles.unreadDot, { backgroundColor: cfg.dot }]} />}

        {/* Thumbnail for featured cards */}
        {item.hasImage ? (
          <View style={[styles.thumbWrap, { backgroundColor: cfg.iconBg }]}>
            <Image
              source={
                item.imageSource === 'vehicle'
                  ? require('../assets/vehicular-accident.png')
                  : require('../assets/fire-incident.png')
              }
              style={styles.thumbImage}
              resizeMode="cover"
            />
            {item.type === 'resolved' && (
              <View style={styles.thumbCheckOverlay}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.emerald} />
              </View>
            )}
            {item.type === 'contained' && (
              <View style={[styles.thumbCheckOverlay, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="shield-checkmark" size={16} color="#D97706" />
              </View>
            )}
            {item.type === 'ambulance' && (
              <View style={[styles.thumbCheckOverlay, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="medical" size={15} color="#3B82F6" />
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.iconWrap, { backgroundColor: cfg.iconBg }, item.read && { marginLeft: 8 }]}>
            <Ionicons name={item.icon} size={20} color={cfg.iconColor} />
          </View>
        )}

        {/* Content */}
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text
              style={[styles.cardTitle, item.read && !isFeatured && styles.cardTitleRead]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
          <Text style={styles.cardText} numberOfLines={2}>{item.body}</Text>
          <View style={styles.cardFooter}>
            <View style={[styles.badge, { backgroundColor: cfg.labelBg }]}>
              <Text style={[styles.badgeText, { color: cfg.labelColor }]}>{cfg.label}</Text>
            </View>
            {isFeatured && (
              <View style={styles.tapHint}>
                <Ionicons name="chevron-forward" size={13} color={cfg.iconColor} />
                <Text style={[styles.tapHintText, { color: cfg.iconColor }]}>Tap to view</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const listData = activeFilter === 'All' ? [...FEATURED, ...filtered] : filtered;

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
            <Text style={styles.headerSubtitle}>Alerts Feed</Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread summary */}
      {unreadCount > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryDot} />
          <Text style={styles.summaryText}>
            {unreadCount} unread alert{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filter, active && styles.filterActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Alert list */}
      <FlatList
        data={listData}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={44} color={COLORS.slate300} />
            <Text style={styles.emptyText}>No alerts in this category</Text>
          </View>
        }
      />

      {/* ── Modals ── */}
      <ProximityAlertModal
        visible={showProximity}
        onClose={() => setShowProximity(false)}
        onViewMap={() => setShowProximity(false)}
      />
      <FireOutModal
        visible={showFireOut}
        onClose={() => setShowFireOut(false)}
      />
      <UnderControlModal
        visible={showUnderControl}
        onClose={() => setShowUnderControl(false)}
      />
      <AmbulanceAlertModal
        visible={showAmbulance}
        onClose={() => setShowAmbulance(false)}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },

  // Header
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
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 42, height: 42, marginRight: SPACING.sm },
  headerTitle: {
    fontSize: 18, fontWeight: '800', color: COLORS.slate900, letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 11, fontWeight: '500', color: COLORS.slate500, marginTop: -2,
  },
  markAllBtn: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.slate100,
  },
  markAllText: {
    fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.slate600,
  },

  // Summary bar
  summaryBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: 10,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1, borderBottomColor: '#D1FAE5',
    gap: 8,
  },
  summaryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.emerald },
  summaryText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.emeraldDark },

  // Filters
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  filter: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.slate100,
  },
  filterActive: { backgroundColor: COLORS.emerald },
  filterText:   { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.slate600 },
  filterTextActive: { color: COLORS.white },

  // List
  list: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.xl },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    position: 'relative',
    ...SHADOWS.small,
  },
  cardFeatured: {
    borderWidth: 1.5,
    ...SHADOWS.medium,
  },
  cardRead: { opacity: 0.72 },

  unreadDot: {
    position: 'absolute',
    top: 14, left: 10,
    width: 7, height: 7, borderRadius: 4,
  },

  // Icon / thumbnail
  iconWrap: {
    width: 44, height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.sm, marginLeft: 8,
    flexShrink: 0,
  },
  thumbWrap: {
    width: 54, height: 54,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm, marginLeft: 8,
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbCheckOverlay: {
    position: 'absolute',
    bottom: 2, right: 2,
    backgroundColor: COLORS.white,
    borderRadius: 9,
    width: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  // Card body
  cardBody: { flex: 1 },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 3,
  },
  cardTitle: {
    fontSize: FONT_SIZES.sm, fontWeight: '700',
    color: COLORS.slate900, flex: 1, marginRight: 8,
  },
  cardTitleRead: { fontWeight: '600', color: COLORS.slate600 },
  cardTime: {
    fontSize: FONT_SIZES.xs, color: COLORS.slate400,
    fontWeight: '500', flexShrink: 0,
  },
  cardText: {
    fontSize: FONT_SIZES.xs, color: COLORS.slate500,
    lineHeight: 17, marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 2, paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  tapHint: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
  },
  tapHintText: {
    fontSize: 10, fontWeight: '600',
  },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.slate400, fontWeight: '500' },
});
