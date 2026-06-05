import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

/* ── Dummy assignment notifications ── */
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'assignment',
    title: 'You have been assigned',
    body: 'FR-001 dispatched to VECO Substation B — Transformer Fire, Escario Street. Code 3. Lights and sirens.',
    time: '09:30',
    read: false,
    severity: 'critical',
    icon: 'flame',
    iconColor: '#EF4444',
    iconBg: 'rgba(239,68,68,0.18)',
  },
  {
    id: 2,
    type: 'dispatch',
    title: 'Route Confirmed',
    body: 'Dispatch confirmed for FR-001. Active route via Escario Street. ETA 4 minutes to VECO Substation B.',
    time: '09:31',
    read: false,
    severity: 'high',
    icon: 'navigate',
    iconColor: '#3B82F6',
    iconBg: 'rgba(59,130,246,0.18)',
  },
  {
    id: 3,
    type: 'backup',
    title: 'Backup Request — BFP Station 7',
    body: 'Command Center requesting FR-001 acknowledgment for BFP Station 7 secondary positioning at Jakosalem St.',
    time: '09:32',
    read: false,
    severity: 'high',
    icon: 'people',
    iconColor: '#F59E0B',
    iconBg: 'rgba(245,158,11,0.18)',
  },
  {
    id: 4,
    type: 'alert',
    title: 'Casualty Update',
    body: 'Ambulance Alpha (AMB-02 & AMB-05) are en route to your location. 2 burn casualties reported.',
    time: '09:35',
    read: true,
    severity: 'medium',
    icon: 'medkit',
    iconColor: '#10B981',
    iconBg: 'rgba(16,185,129,0.18)',
  },
  {
    id: 5,
    type: 'ai',
    title: 'CURA AI Escalation Alert',
    body: 'AI detected structural breach risk at 89% probability. Auto-dispatch sequence initiated. Manual override available.',
    time: '09:41',
    read: false,
    severity: 'critical',
    icon: 'flash',
    iconColor: '#EF4444',
    iconBg: 'rgba(239,68,68,0.18)',
    isAI: true,
  },
  {
    id: 6,
    type: 'info',
    title: 'Shift Reminder',
    body: 'Your shift ends at 18:00. Ensure incident report FR-001/2026-B is filed with station commander.',
    time: '08:00',
    read: true,
    severity: 'low',
    icon: 'time',
    iconColor: '#94A3B8',
    iconBg: 'rgba(148,163,184,0.18)',
  },
];

const SEVERITY_BORDER = {
  critical: 'rgba(239,68,68,0.4)',
  high:     'rgba(245,158,11,0.35)',
  medium:   'rgba(16,185,129,0.3)',
  low:      'rgba(255,255,255,0.1)',
};

export default function ResponderAlertsScreen() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const renderItem = ({ item }) => {
    const borderColor = SEVERITY_BORDER[item.severity] ?? SEVERITY_BORDER.low;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { borderLeftColor: item.read ? 'transparent' : borderColor },
          !item.read && styles.cardUnread,
          item.isAI && styles.cardAI,
        ]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.85}
      >
        <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
          <Ionicons name={item.icon} size={20} color={item.iconColor} />
          {item.isAI && (
            <View style={styles.aiTag}>
              <Text style={styles.aiTagText}>AI</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
              {item.title}
            </Text>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: item.iconColor }]} />}
          </View>
          <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardTime}>{item.time}</Text>
            {!item.read && (
              <TouchableOpacity
                onPress={() => markRead(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.markReadText}>Mark read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0C0518" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CURA</Text>
          <Text style={styles.headerSubtitle}>Notifications</Text>
        </View>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{unreadCount}</Text>
            </View>
          )}
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead} activeOpacity={0.8}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Section label */}
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>TODAY — {notifications.length} NOTIFICATIONS</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={56} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0518' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle:    { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  headerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  headerRight:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },

  unreadCountBadge: {
    minWidth: 26, height: 26, borderRadius: 13, paddingHorizontal: 6,
    backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4,
  },
  unreadCountText: { fontSize: 12, fontWeight: '900', color: '#fff' },
  markAllBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  markAllText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },

  sectionLabel: {
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm,
  },
  sectionLabelText: {
    fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5,
  },

  listContent: { paddingHorizontal: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.xl },

  card: {
    flexDirection: 'row', gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderLeftWidth: 3,
  },
  cardUnread: {
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  cardAI: {
    backgroundColor: 'rgba(127,29,29,0.35)',
    borderColor: 'rgba(239,68,68,0.3)',
    borderLeftColor: '#EF4444',
  },

  iconWrap: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    position: 'relative',
  },
  aiTag: {
    position: 'absolute', top: -4, right: -4,
    paddingHorizontal: 4, paddingVertical: 1,
    backgroundColor: '#EF4444', borderRadius: BORDER_RADIUS.sm,
  },
  aiTagText: { fontSize: 8, fontWeight: '900', color: '#fff' },

  cardContent: { flex: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  cardTitle: {
    fontSize: FONT_SIZES.md, fontWeight: '600', color: 'rgba(255,255,255,0.65)', flex: 1, lineHeight: 18,
  },
  cardTitleUnread: { fontWeight: '800', color: '#fff' },
  unreadDot:  { width: 8, height: 8, borderRadius: 4, marginLeft: SPACING.xs, flexShrink: 0 },

  cardBody: {
    fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.5)',
    lineHeight: 18, marginBottom: SPACING.sm,
  },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTime:   { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.28)', fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  markReadText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.emerald },

  emptyState: { alignItems: 'center', paddingTop: 80, gap: SPACING.sm },
  emptyText:  { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
});
