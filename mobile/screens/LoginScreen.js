import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import { supabase } from '../lib/supabase';

export default function LoginScreen({ navigation }) {
  const loginScale = useRef(new Animated.Value(1)).current;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPressIn = () => {
    Animated.spring(loginScale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handleLoginPressOut = () => {
    Animated.spring(loginScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const navigateByRole = (role) => {
    if (role === 'admin')     navigation.replace('AdminTabs');
    else if (role === 'station')    navigation.replace('StationTabs');
    else if (role === 'responder')  navigation.replace('ResponderTabs');
    else                            navigation.replace('MainTabs');
  };

  const handleLogin = async () => {
    const email = identifier.toLowerCase().trim();
    if (!email.includes('@')) {
      Alert.alert('Login Failed', 'Please enter a valid email address.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data?.user) {
      const role = data.user.user_metadata?.role ?? 'citizen';
      navigateByRole(role);
      return;
    }

    // Fallback: legacy hardcoded navigation (dev convenience)
    if (email === 'admin@email.com')     { navigation.replace('AdminTabs'); return; }
    if (email === 'station@email.com')   { navigation.replace('StationTabs'); return; }
    if (email === 'responder@email.com') { navigation.replace('ResponderTabs'); return; }

    Alert.alert('Login Failed', error?.message ?? 'Invalid credentials.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Decorative glow orbs — mirrors web landing blobs */}
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />
      <View style={styles.orbCenter} />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/cura-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Project CURA</Text>
        <View style={styles.accentLine} />
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      {/* Glass Card */}
      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone / Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={18}
              color="rgba(255,255,255,0.4)"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your phone or email"
              placeholderTextColor="rgba(255,255,255,0.25)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={identifier}
              onChangeText={setIdentifier}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="rgba(255,255,255,0.4)"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="rgba(255,255,255,0.25)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <Animated.View style={[{ transform: [{ scale: loginScale }] }, styles.buttonWrapper]}>
          <TouchableOpacity
            style={styles.loginButton}
            onPressIn={handleLoginPressIn}
            onPressOut={handleLoginPressOut}
            onPress={handleLogin}
            activeOpacity={1}
          >
            <Text style={styles.loginButtonText}>Login</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },

  // Glow orbs
  orbTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(16,185,129,0.10)',
  },
  orbCenter: {
    position: 'absolute',
    top: '35%',
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(52,211,153,0.07)',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  accentLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.emerald,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.3,
  },

  // Glass card
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 54,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    height: '100%',
  },

  // Button
  buttonWrapper: {
    marginTop: SPACING.sm,
  },
  loginButton: {
    backgroundColor: COLORS.emerald,
    flexDirection: 'row',
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  loginButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
});
