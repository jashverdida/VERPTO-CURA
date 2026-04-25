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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const loginScale = useRef(new Animated.Value(1)).current;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPressIn = () => {
    Animated.spring(loginScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleLoginPressOut = () => {
    Animated.spring(loginScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = () => {
    const email = identifier.toLowerCase().trim();
    if (email === 'responders@gmail.com' && password === 'responder123') {
      navigation.replace('ResponderTabs');
    } else if (email === 'citizen@gmail.com' && password === 'citizen123') {
      navigation.replace('MainTabs');
    } else {
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="shield-checkmark" size={40} color={COLORS.white} />
        </View>
        <Text style={styles.title}>Project CURA</Text>
        <Text style={styles.subtitle}>Emergency Command Center</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone / Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.slate400} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your phone or email"
              placeholderTextColor={COLORS.slate400}
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
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.slate400} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.slate400}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: loginScale }], marginTop: SPACING.lg }}>
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
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Secure Operator Access Only</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 100 : 80,
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.emerald,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.slate900,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.slate500,
    marginTop: SPACING.xs,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.slate700,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.slate900,
    height: '100%',
  },
  loginButton: {
    backgroundColor: COLORS.slate900,
    flexDirection: 'row',
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  loginButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.slate400,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
