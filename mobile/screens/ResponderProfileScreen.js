import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

/* ── Static responder profile (dummy data) ── */
const RESPONDER = {
  firstName:    'Marcus',
  lastName:     'Reyes',
  middleName:   'D.',
  role:         'Senior Fire Officer I',
  badgeNumber:  'SFO-2847',
  rank:         'SFO1',
  yearsService: 8,
  email:        'responder@email.com',
  phone:        '+63 917 423 8821',
  address:      'Lahug District, Cebu City, Philippines',
  bloodType:    'O+',
  dateOfBirth:  'March 14, 1988',
};

const STATION = {
  name:        'BFP Lahug Fire Station',
  code:        'BFP-LHG-001',
  address:     'Gen. Maxilom Ave., Lahug, Cebu City 6000',
  district:    'Lahug / Banilad / Capitol Site',
  commander:   'Fire Chief Eduardo Santos',
  deputy:      'SFO3 Roberto Dela Cruz',
  activeUnits: 'FR-001, FR-002',
  standbyUnit: 'FR-003 (maintenance)',
  contact:     '(032) 232-8765',
  established: '1975',
  personnel:   24,
  type:        'Bureau of Fire Protection — District Station',
};

const getInitials = (first, last) =>
  `${(first || 'R')[0]}${(last || 'R')[0]}`.toUpperCase();

/* ── Reusable sub-components ── */
const SectionStripe = ({ color }) => <View style={[sc.stripe, { backgroundColor: color }]} />;

function InfoRow({ icon, label, value, accent = COLORS.emerald }) {
  return (
    <View style={sc.infoRow}>
      <View style={[sc.infoIconBg, { backgroundColor: accent + '22' }]}>
        <Ionicons name={icon} size={15} color={accent} />
      </View>
      <View style={sc.infoBody}>
        <Text style={sc.infoLabel}>{label}</Text>
        <Text style={sc.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

function Section({ title, icon, accent = COLORS.emerald, children }) {
  return (
    <View style={sc.section}>
      <SectionStripe color={accent} />
      <View style={sc.sectionInner}>
        <View style={sc.sectionHeader}>
          <View style={[sc.sectionIconBg, { backgroundColor: accent + '28' }]}>
            <Ionicons name={icon} size={17} color={accent} />
          </View>
          <Text style={sc.sectionTitle}>{title}</Text>
        </View>
        <View style={sc.sectionBody}>{children}</View>
      </View>
    </View>
  );
}

const Divider = () => <View style={sc.divider} />;

/* ══════════════════════════════════════════════════════════════════ */

export default function ResponderProfileScreen({ navigation }) {
  const logoutScale = useRef(new Animated.Value(1)).current;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout', style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('currentUserId');
              navigation.replace('Login');
            } catch (err) {
              console.error('logout:', err);
            }
          },
        },
      ]
    );
  };

  const initials = getInitials(RESPONDER.firstName, RESPONDER.lastName);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── COVER ── */}
        <View style={styles.cover}>
          <View style={styles.coverTint} />
          {/* Decorative orbs */}
          <View style={[styles.coverOrb, { top: -50, right: -40, width: 200, height: 200, borderRadius: 100, opacity: 0.22 }]} />
          <View style={[styles.coverOrb, { bottom: -60, left: -30, width: 200, height: 200, borderRadius: 100, opacity: 0.13 }]} />
          <View style={[styles.coverOrb, { top: 55, left: '38%', width: 110, height: 110, borderRadius: 55, opacity: 0.08 }]} />

          <View style={styles.coverTopRow}>
            <View style={styles.coverBrand}>
              <Ionicons name="leaf" size={13} color="rgba(52,211,153,0.8)" />
              <Text style={styles.coverBrandText}>CURA</Text>
            </View>
            <View style={styles.coverRoleBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#F59E0B" />
              <Text style={styles.coverRoleText}>RESPONDER</Text>
            </View>
          </View>

          {/* Station name in cover */}
          <View style={styles.coverStation}>
            <Ionicons name="business-outline" size={13} color="rgba(255,255,255,0.55)" />
            <Text style={styles.coverStationText}>{STATION.name}</Text>
          </View>
        </View>

        {/* ── AVATAR ── */}
        <View style={styles.avatarZone}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </View>
          {/* Online indicator */}
          <View style={styles.onlineDot} />
        </View>

        {/* ── IDENTITY ── */}
        <View style={styles.identity}>
          <Text style={styles.fullName}>
            {[RESPONDER.firstName, RESPONDER.middleName, RESPONDER.lastName].filter(Boolean).join(' ')}
          </Text>
          <Text style={styles.roleText}>{RESPONDER.role}</Text>
          <View style={styles.badgePill}>
            <Ionicons name="shield-half-outline" size={12} color="#F59E0B" />
            <Text style={styles.badgePillText}>Badge #{RESPONDER.badgeNumber}</Text>
          </View>
        </View>

        {/* ── ACTION BAR ── */}
        <View style={styles.actionBar}>
          <View style={styles.serviceChip}>
            <Ionicons name="time-outline" size={14} color={COLORS.emerald} />
            <Text style={styles.serviceChipText}>{RESPONDER.yearsService} Years of Service</Text>
          </View>
          <View style={styles.unitChip}>
            <Ionicons name="car-outline" size={14} color="#3B82F6" />
            <Text style={styles.unitChipText}>{STATION.activeUnits}</Text>
          </View>
          <Animated.View style={{ transform: [{ scale: logoutScale }] }}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              onPressIn={() => Animated.spring(logoutScale, { toValue: 0.95, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(logoutScale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
              activeOpacity={1}
            >
              <Ionicons name="log-out-outline" size={18} color={COLORS.fireRed} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ── CARDS ── */}
        <View style={styles.cards}>

          {/* Station Info card */}
          <View style={styles.stationCard}>
            <View style={styles.stationCardHeader}>
              <View style={styles.stationCardIconBg}>
                <Ionicons name="business" size={20} color={COLORS.emerald} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stationCardName}>{STATION.name}</Text>
                <Text style={styles.stationCardCode}>{STATION.code}</Text>
              </View>
              <View style={styles.stationOnlinePill}>
                <View style={styles.stationOnlineDot} />
                <Text style={styles.stationOnlineText}>Active</Text>
              </View>
            </View>

            <View style={styles.stationDivider} />

            <View style={styles.stationGrid}>
              <View style={styles.stationGridItem}>
                <Text style={styles.stationGridLabel}>Commander</Text>
                <Text style={styles.stationGridValue}>{STATION.commander}</Text>
              </View>
              <View style={styles.stationGridItem}>
                <Text style={styles.stationGridLabel}>District</Text>
                <Text style={styles.stationGridValue}>{STATION.district}</Text>
              </View>
              <View style={styles.stationGridItem}>
                <Text style={styles.stationGridLabel}>Active Units</Text>
                <Text style={styles.stationGridValue}>{STATION.activeUnits}</Text>
              </View>
              <View style={styles.stationGridItem}>
                <Text style={styles.stationGridLabel}>Personnel</Text>
                <Text style={styles.stationGridValue}>{STATION.personnel} officers</Text>
              </View>
            </View>

            <View style={styles.stationDivider} />

            <View style={styles.stationFooter}>
              <View style={styles.stationFooterRow}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.4)" />
                <Text style={styles.stationFooterText}>{STATION.address}</Text>
              </View>
              <View style={styles.stationFooterRow}>
                <Ionicons name="call-outline" size={13} color="rgba(255,255,255,0.4)" />
                <Text style={styles.stationFooterText}>{STATION.contact}</Text>
              </View>
              <View style={styles.stationFooterRow}>
                <Ionicons name="information-circle-outline" size={13} color="rgba(255,255,255,0.4)" />
                <Text style={styles.stationFooterText}>{STATION.type}</Text>
              </View>
            </View>
          </View>

          {/* Personal Info */}
          <Section title="Personal Info" accent={COLORS.emerald} icon="person">
            <InfoRow icon="person-outline"  label="First Name"   value={RESPONDER.firstName}  accent={COLORS.emerald} />
            <Divider />
            <InfoRow icon="person-outline"  label="Middle Name"  value={RESPONDER.middleName} accent={COLORS.emerald} />
            <Divider />
            <InfoRow icon="person-outline"  label="Last Name"    value={RESPONDER.lastName}   accent={COLORS.emerald} />
            <Divider />
            <InfoRow icon="mail-outline"    label="Email"        value={RESPONDER.email}      accent="#3B82F6" />
          </Section>

          {/* Assignment Info */}
          <Section title="Assignment Info" accent="#F59E0B" icon="shield-half">
            <InfoRow icon="ribbon-outline"         label="Rank"          value={RESPONDER.rank}        accent="#F59E0B" />
            <Divider />
            <InfoRow icon="shield-checkmark-outline" label="Badge Number"  value={RESPONDER.badgeNumber} accent="#F59E0B" />
            <Divider />
            <InfoRow icon="time-outline"           label="Years of Service" value={`${RESPONDER.yearsService} years`} accent="#F59E0B" />
            <Divider />
            <InfoRow icon="car-outline"            label="Assigned Unit"  value={STATION.activeUnits}   accent="#F59E0B" />
          </Section>

          {/* Contact Info */}
          <Section title="Contact Info" accent="#3B82F6" icon="call">
            <InfoRow icon="call-outline"     label="Phone Number"   value={RESPONDER.phone}   accent="#3B82F6" />
            <Divider />
            <InfoRow icon="location-outline" label="Home Address"   value={RESPONDER.address} accent="#3B82F6" />
          </Section>

          {/* Medical Info */}
          <Section title="Medical Info" accent={COLORS.fireRed} icon="medical">
            <InfoRow icon="water-outline"    label="Blood Type"     value={RESPONDER.bloodType}   accent={COLORS.fireRed} />
            <Divider />
            <InfoRow icon="calendar-outline" label="Date of Birth"  value={RESPONDER.dateOfBirth} accent={COLORS.fireRed} />
          </Section>

        </View>

        {/* ── LOGOUT BUTTON (bottom) ── */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutFullBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.fireRed} />
            <Text style={styles.logoutFullBtnText}>Logout from CURA</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ── Shared sub-component styles ── */
const sc = StyleSheet.create({
  section: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  stripe:       { width: 4 },
  sectionInner: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm + 2,
    paddingTop: SPACING.md, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sectionIconBg: {
    width: 34, height: 34, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
  sectionBody:  { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },

  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: SPACING.sm + 2, paddingVertical: SPACING.sm,
  },
  infoIconBg: {
    width: 30, height: 30, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  infoBody:  { flex: 1 },
  infoLabel: {
    fontSize: FONT_SIZES.xs, fontWeight: '700', color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3,
  },
  infoValue: { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.88)', fontWeight: '500', lineHeight: 20 },
  divider:   { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
});

/* ── Screen styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  scroll:    { paddingBottom: SPACING.xl },

  /* Cover */
  cover: { height: 220, backgroundColor: '#0D4A35', overflow: 'hidden' },
  coverTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(16,185,129,0.13)' },
  coverOrb:  { position: 'absolute', backgroundColor: '#10B981' },
  coverTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop:  Platform.OS === 'android' ? SPACING.xl + SPACING.sm : SPACING.xl + SPACING.md,
    paddingHorizontal: SPACING.lg, zIndex: 2,
  },
  coverBrand:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  coverBrandText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: 'rgba(52,211,153,0.85)', letterSpacing: 3 },
  coverRoleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 1,
    backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.4)',
  },
  coverRoleText: { fontSize: 10, fontWeight: '900', color: '#F59E0B', letterSpacing: 2 },
  coverStation: {
    position: 'absolute', bottom: SPACING.lg, left: SPACING.lg, right: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
  },
  coverStationText: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },

  /* Avatar */
  avatarZone: {
    alignItems: 'center', marginTop: -(60 + 6), zIndex: 10, marginBottom: SPACING.md,
  },
  avatarRing: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: '#0A1628', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 14,
  },
  avatarCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 2 },
  onlineDot: {
    position: 'absolute', bottom: 6, right: '42%',
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.emerald, borderWidth: 3, borderColor: '#0A1628',
  },

  /* Identity */
  identity:  { alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  fullName:  { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: SPACING.xs, letterSpacing: 0.3 },
  roleText:  { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.55)', marginBottom: SPACING.sm, fontWeight: '500' },
  badgePill: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
  },
  badgePillText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: '#F59E0B', letterSpacing: 0.5 },

  /* Action bar */
  actionBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg,
  },
  serviceChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs,
    backgroundColor: `${COLORS.emerald}18`,
    paddingVertical: SPACING.sm + 2, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderColor: `${COLORS.emerald}35`,
  },
  serviceChipText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.emerald },
  unitChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs,
    backgroundColor: 'rgba(59,130,246,0.15)',
    paddingVertical: SPACING.sm + 2, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
  },
  unitChipText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#60A5FA' },
  logoutBtn: {
    width: 46, height: 46, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: `${COLORS.fireRed}18`,
    borderWidth: 1.5, borderColor: `${COLORS.fireRed}40`,
    justifyContent: 'center', alignItems: 'center',
  },

  /* Cards */
  cards: { paddingHorizontal: SPACING.md, gap: SPACING.md - 4, marginBottom: SPACING.md },

  /* Station card */
  stationCard: {
    backgroundColor: 'rgba(16,185,129,0.07)',
    borderRadius: BORDER_RADIUS.xl, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.25)',
  },
  stationCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    padding: SPACING.md,
  },
  stationCardIconBg: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(16,185,129,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  stationCardName: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#fff', marginBottom: 2 },
  stationCardCode: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  stationOnlinePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    backgroundColor: `${COLORS.emerald}18`, borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: `${COLORS.emerald}35`,
  },
  stationOnlineDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.emerald },
  stationOnlineText: { fontSize: 10, fontWeight: '700', color: COLORS.emerald },

  stationDivider: { height: 1, backgroundColor: 'rgba(16,185,129,0.15)' },

  stationGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: SPACING.md, gap: SPACING.md,
  },
  stationGridItem: { width: '46%' },
  stationGridLabel: {
    fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3,
  },
  stationGridValue: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

  stationFooter: {
    padding: SPACING.md, gap: SPACING.xs + 2,
  },
  stationFooterRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  stationFooterText: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.5)', fontWeight: '500', flex: 1 },

  /* Logout section */
  logoutSection: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  logoutFullBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: `${COLORS.fireRed}18`,
    borderWidth: 1.5, borderColor: `${COLORS.fireRed}35`,
  },
  logoutFullBtnText: {
    fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.fireRed,
  },
});
