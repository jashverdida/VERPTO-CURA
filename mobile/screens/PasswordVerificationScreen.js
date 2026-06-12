import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useStyledAlert } from '../utils/useStyledAlert';
import { uploadNationalIDImages } from '../services/nationalIdUploader';

export default function PasswordVerificationScreen({ navigation, route }) {
  const { formData, nationalIdImages } = route.params;
  const { showAlert, AlertComponent } = useStyledAlert();
  const confirmScale = useRef(new Animated.Value(1)).current;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmPressIn = () => {
    Animated.spring(confirmScale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handleConfirmPressOut = () => {
    Animated.spring(confirmScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };


  const isFormValid = () => {
    return (
      password.length >= 8 &&
      confirmPassword.length >= 8 &&
      password === confirmPassword
    );
  };

  const getErrorMessage = () => {
    if (!password || !confirmPassword) return 'Both password fields are required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (confirmPassword.length < 8) return 'Confirm password must be at least 8 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleRegister = async () => {
    if (!isFormValid()) {
      showAlert('Validation Error', getErrorMessage(), 'alert-circle', '#EF4444');
      return;
    }

    setIsLoading(true);
    try {
      const { firstName, middleName, lastName, email, phone, dateOfBirth, address, gender, bloodType, maritalStatus, placeOfBirth } = formData;

      let nationalIdUrls = {};

      // Upload National ID images if provided
      if (nationalIdImages?.front && nationalIdImages?.back) {
        try {
          nationalIdUrls = await uploadNationalIDImages(nationalIdImages.front, nationalIdImages.back);
        } catch (uploadError) {
          console.error('National ID upload failed:', uploadError);
          // Don't fail registration - allow users to complete registration without images
          showAlert(
            'Upload Note',
            'National ID images could not be uploaded. Your account will be created but marked pending verification. You can add images later.',
            'alert-circle',
            '#FFA500',
            null,
            false
          );
        }
      }

      // Insert citizen user into database
      const citizenData = {
        email: email.toLowerCase().trim(),
        password_hash: password,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        phone_number: phone,
        date_of_birth: dateOfBirth,
        address: address,
        gender: gender,
        blood_type: bloodType,
        marital_status: maritalStatus,
        place_of_birth: placeOfBirth,
        verification_status: 'pending',
        ...(nationalIdUrls.national_id_front_url && { national_id_front_url: nationalIdUrls.national_id_front_url }),
        ...(nationalIdUrls.national_id_back_url && { national_id_back_url: nationalIdUrls.national_id_back_url }),
      };

      const { data, error } = await supabase
        .from('citizens')
        .insert([citizenData])
        .select();

      if (error) {
        if (error.message.includes('duplicate')) {
          showAlert('Registration Failed', 'This email is already registered. Please login or use a different email.', 'alert-circle', '#EF4444');
        } else {
          showAlert('Registration Failed', error.message || 'An error occurred during registration.', 'alert-circle', '#EF4444');
        }
        setIsLoading(false);
        return;
      }

      // Success
      // Save user ID to AsyncStorage for automatic login
      if (data && data.length > 0) {
        await AsyncStorage.setItem('currentUserId', data[0].id);
      }

      showAlert(
        'Registration Successful!',
        'Welcome to Project CURA! Your account has been created.',
        'checkmark-circle',
        COLORS.emerald,
        () => navigation.replace('MainTabs'),
        false
      );

      setIsLoading(false);
    } catch (error) {
      console.error('Registration error:', error);
      showAlert('Error', 'An unexpected error occurred. Please try again.', 'alert-circle', '#EF4444');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <AlertComponent />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <View style={styles.orbTopRight} />
        <View style={styles.orbBottomLeft} />
        <View style={styles.orbCenter} />

        {/* Header with Back Button */}
        <View style={styles.headerWithBack}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Image source={require('../assets/cura-logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Create Account</Text>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>Step 2 of 2: Set Your Password</Text>
          </View>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.formContainer}>
          {/* Info Section */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.emerald} />
            <Text style={styles.infoText}>Account will be registered under</Text>
            <Text style={styles.infoBoldText}>{formData.firstName} {formData.lastName}</Text>
            <Text style={styles.infoSubText}>{formData.email}</Text>
          </View>

          {/* Password Row */}
          <View style={styles.row}>
            <View style={[styles.column, styles.fullWidth]}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password (min 8 characters)"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Confirm Password Row */}
          <View style={styles.row}>
            <View style={[styles.column, styles.fullWidth]}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Validation Status */}
          {password || confirmPassword ? (
            <View style={[styles.validationBox, isFormValid() ? styles.validationBoxSuccess : styles.validationBoxError]}>
              <Ionicons
                name={isFormValid() ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={isFormValid() ? COLORS.emerald : '#EF4444'}
                style={styles.validationIcon}
              />
              <Text style={[styles.validationText, isFormValid() ? styles.validationTextSuccess : styles.validationTextError]}>
                {isFormValid() ? '✓ Passwords match' : getErrorMessage()}
              </Text>
            </View>
          ) : null}

          {/* Confirm Button */}
          <Animated.View style={[{ transform: [{ scale: confirmScale }] }, styles.buttonWrapper]}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !isFormValid() && styles.confirmButtonDisabled,
              ]}
              onPressIn={isFormValid() && !isLoading ? handleConfirmPressIn : undefined}
              onPressOut={isFormValid() && !isLoading ? handleConfirmPressOut : undefined}
              onPress={handleRegister}
              disabled={!isFormValid() || isLoading}
              activeOpacity={1}
            >
              <Text style={[styles.confirmButtonText, !isFormValid() && styles.confirmButtonTextDisabled]}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
              {!isLoading && <Ionicons name={isFormValid() ? "checkmark" : "lock-closed"} size={20} color={isFormValid() ? COLORS.white : 'rgba(16,185,129,0.5)'} />}
            </TouchableOpacity>
          </Animated.View>

          {/* Back to Edit Link */}
          <View style={styles.editLinkContainer}>
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.editLink}>← Back to Edit Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: SPACING.lg,
  },

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

  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backButtonPlaceholder: {
    width: 50,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  accentLine: {
    width: 30,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.emerald,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.3,
  },

  formContainer: {
    paddingHorizontal: SPACING.lg,
  },

  infoCard: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  infoBoldText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.emerald,
    marginTop: SPACING.xs,
  },
  infoSubText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.45)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  row: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  column: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
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

  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  validationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  validationBoxSuccess: {
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  validationBoxError: {
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.05)',
  },
  validationIcon: {
    marginRight: SPACING.md,
  },
  validationText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  validationTextSuccess: {
    color: COLORS.emerald,
  },
  validationTextError: {
    color: '#EF4444',
  },

  buttonWrapper: {
    marginVertical: SPACING.lg,
  },
  confirmButton: {
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
  confirmButtonDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.emerald,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
  confirmButtonTextDisabled: {
    color: COLORS.white,
    opacity: 0.6,
  },

  editLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  editLink: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.emerald,
  },
});
