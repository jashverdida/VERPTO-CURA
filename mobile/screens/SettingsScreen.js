import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

export default function SettingsScreen({ navigation }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleTheme = () => setIsDarkMode(previousState => !previousState);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: () => navigation.replace('Login'),
          style: 'destructive'
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, value, onValueChange, type = 'toggle', onPress, color = COLORS.slate700 }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={type === 'toggle'}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: type === 'danger' ? COLORS.fireRed + '15' : COLORS.slate100 }]}>
          <Ionicons name={icon} size={22} color={type === 'danger' ? COLORS.fireRed : COLORS.slate600} />
        </View>
        <Text style={[styles.settingTitle, type === 'danger' && { color: COLORS.fireRed }]}>{title}</Text>
      </View>
      {type === 'toggle' ? (
        <Switch
          trackColor={{ false: COLORS.slate200, true: COLORS.emerald }}
          thumbColor={Platform.OS === 'ios' ? undefined : COLORS.white}
          ios_backgroundColor={COLORS.slate200}
          onValueChange={onValueChange}
          value={value}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={COLORS.slate400} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.textWhite]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.sectionCard}>
            <SettingItem 
              icon={isDarkMode ? "moon" : "sunny-outline"} 
              title="Night Mode" 
              value={isDarkMode} 
              onValueChange={toggleTheme}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionCard}>
            <SettingItem 
              icon="notifications-outline" 
              title="Push Notifications" 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
            <SettingItem 
              icon="person-outline" 
              title="Profile Settings" 
              type="link"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem 
              icon="shield-outline" 
              title="Privacy & Security" 
              type="link"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <SettingItem 
              icon="log-out-outline" 
              title="Logout" 
              type="danger"
              onPress={handleLogout}
            />
          </View>
        </View>

        <Text style={styles.versionText}>CURA v1.0.4 - Production</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  headerDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  textWhite: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.slate500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.slate800,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.slate100,
    marginLeft: 68,
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.slate400,
    fontSize: 12,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
