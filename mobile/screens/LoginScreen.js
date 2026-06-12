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
  Image,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useStyledAlert } from '../utils/useStyledAlert';

export default function LoginScreen({ navigation }) {
  const { showAlert, AlertComponent } = useStyledAlert();
  const loginScale = useRef(new Animated.Value(1)).current;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const handleLoginPressIn = () => {
    Animated.spring(loginScale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handleLoginPressOut = () => {
    Animated.spring(loginScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const handleLogin = async () => {
    const email = identifier.toLowerCase().trim();
    
    // Validate email format
    if (!email) {
      showAlert('Validation Error', 'Please enter your email address.', 'alert-circle', '#EF4444');
      return;
    }

    if (!email.includes('@')) {
      showAlert('Login Failed', 'Please enter a valid email address.', 'mail', '#EF4444');
      return;
    }

    if (!password || password.length === 0) {
      showAlert('Validation Error', 'Please enter your password.', 'alert-circle', '#EF4444');
      return;
    }

    setIsLoading(true);

    try {
      // Hardcoded demo credentials (for testing)
      if (email === 'admin@email.com' && password === 'admin123') { 
        navigation.replace('AdminTabs'); 
        setIsLoading(false);
        return; 
      }
      if (email === 'station@email.com' && password === 'station123') { 
        navigation.replace('StationTabs'); 
        setIsLoading(false);
        return; 
      }
      if (email === 'responder@email.com' && password === '123123') {
        navigation.replace('ResponderTabs');
        setIsLoading(false);
        return;
      }

      // Query citizens table for registered users
      const { data, error } = await supabase
        .from('citizens')
        .select('id, email, password_hash, first_name, last_name')
        .eq('email', email)
        .single();

      if (error || !data) {
        showAlert('Login Failed', 'Email not found. Please register or check your email.', 'alert-circle', '#EF4444');
        setIsLoading(false);
        return;
      }

      // Password validation (note: in production, should use bcrypt for hashing)
      if (data.password_hash !== password) {
        showAlert('Login Failed', 'Incorrect password. Please try again.', 'lock-closed', '#EF4444');
        setIsLoading(false);
        return;
      }

      // Save user ID to AsyncStorage
      await AsyncStorage.setItem('currentUserId', data.id);

      // Login successful
      console.log('User logged in:', data.email);
      navigation.replace('MainTabs');
      setIsLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      showAlert('Login Error', 'An unexpected error occurred. Please try again.', 'alert-circle', '#EF4444');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Decorative glow orbs — mirrors splash screen */}
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
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                size={18} 
                color="rgba(255,255,255,0.4)" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View style={[{ transform: [{ scale: loginScale }] }, styles.buttonWrapper]}>
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPressIn={handleLoginPressIn}
            onPressOut={handleLoginPressOut}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={1}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
            {!isLoading && <Ionicons name="arrow-forward" size={20} color={COLORS.white} />}
          </TouchableOpacity>
        </Animated.View>

        {/* Registration Link */}
        <View style={styles.registrationLinkContainer}>
          <Text style={styles.registrationLinkText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
            <Text style={styles.registrationLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
      <AlertComponent />

      {/* Profile Image Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.imageModalOverlay} 
          activeOpacity={1} 
          onPress={() => setImageModalVisible(false)}
        >
          <View style={styles.imageModalContent}>
            <TouchableOpacity 
              style={styles.imageModalCloseButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close-circle" size={36} color={COLORS.white} />
            </TouchableOpacity>
            <Image
              source={require('../assets/cura-logo.png')}
              style={styles.imageModalImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: SPACING.lg,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    paddingTop: SPACING.xl,
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
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: SPACING.sm,
  },

  // Registration Link
  registrationLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  registrationLinkText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  registrationLink: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.emerald,
    textDecorationLine: 'underline',
  },

  // Image Modal Styles
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: '85%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: BORDER_RADIUS.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 15,
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    zIndex: 20,
  },
  imageModalImage: {
    width: '80%',
    height: '80%',
  },
});
