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

const ICON_BY_TYPE = { critical: 'flame', warning: 'warning', info: 'information-circle' };

function formatRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

function rowToAlert(row) {
  return {
    id:   row.id,
    type: row.type,
    icon: ICON_BY_TYPE[row.type] ?? 'information-circle',
    title: row.title,
    body:  row.body ?? '',
    time:  formatRelativeTime(row.created_at),
    read:  row.read ?? false,
  };
}

const TYPE_CONFIG = {
  critical: {
    bg: '#FEF2F2',
    iconBg: '#FEE2E2',
    iconColor: '#EF4444',
    dot: '#EF4444',
    label: 'Critical',
    labelColor: '#EF4444',
    labelBg: '#FEE2E2',
  },
  warning: {
    bg: '#FFFBEB',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    dot: '#F59E0B',
    label: 'Warning',
    labelColor: '#D97706',
    labelBg: '#FEF3C7',
  },
  info: {
    bg: COLORS.white,
    iconBg: '#F0FDF4',
    iconColor: COLORS.emerald,
    dot: COLORS.emerald,
    label: 'Info',
    labelColor: COLORS.emeraldDark,
    labelBg: '#D1FAE5',
  },
};

const FILTERS = ['All', 'Critical', 'Warning', 'Info'];

export default function AlertsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [alerts, setAlerts] = useState([]);

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

  const renderAlert = ({ item }) => {
    const cfg = TYPE_CONFIG[item.type];
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cfg.bg }, item.read && styles.cardRead]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.75}
      >
        {/* Unread dot */}
        {!item.read && <View style={[styles.unreadDot, { backgroundColor: cfg.dot }]} />}

        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: cfg.iconBg }]}>
          <Ionicons name={item.icon} size={20} color={cfg.iconColor} />
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardTitle, item.read && styles.cardTitleRead]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </View>
          <Text style={styles.cardText} numberOfLines={2}>{item.body}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.labelBg }]}>
            <Text style={[styles.badgeText, { color: cfg.labelColor }]}>{cfg.label}</Text>
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

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={44} color={COLORS.slate300} />
            <Text style={styles.emptyText}>No alerts in this category</Text>
          </View>
        }
      />
    </View>
  );
}

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
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.slate100,
  },
  markAllText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.slate600,
  },

  // Summary bar
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
    gap: 8,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.emerald,
  },
  summaryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.emeraldDark,
  },

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
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.slate100,
  },
  filterActive: {
    backgroundColor: COLORS.emerald,
  },
  filterText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.slate600,
  },
  filterTextActive: {
    color: COLORS.white,
  },

  // List
  list: {
    padding: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  // Alert card
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    position: 'relative',
    ...SHADOWS.small,
  },
  cardRead: {
    opacity: 0.72,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    left: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginLeft: 8,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.slate900,
    flex: 1,
    marginRight: 8,
  },
  cardTitleRead: {
    fontWeight: '600',
    color: COLORS.slate600,
  },
  cardTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate400,
    fontWeight: '500',
    flexShrink: 0,
  },
  cardText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate500,
    lineHeight: 17,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Empty
  empty: {
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
