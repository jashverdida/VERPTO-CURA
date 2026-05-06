import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';

export default function AdminDashboardScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.badge}>
        <Ionicons name="shield" size={32} color={COLORS.emerald} />
      </View>
      <Text style={styles.role}>Command Center</Text>
      <Text style={styles.label}>Admin Dashboard</Text>
      <Text style={styles.hint}>Routed successfully ✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  orb2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  role: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.emerald,
    marginBottom: SPACING.xl,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.5,
  },
});
