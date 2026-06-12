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
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import { useStyledAlert } from '../utils/useStyledAlert';
import { pickNationalIDImage, validateImageData } from '../utils/nationalIdPicker';

export default function RegistrationScreen({ navigation }) {
  const { showAlert, AlertComponent } = useStyledAlert();
  const nextScale = useRef(new Animated.Value(1)).current;
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    gender: '',
    bloodType: '',
    maritalStatus: '',
    placeOfBirth: '',
  });
  
  const [nationalIdImages, setNationalIdImages] = useState({
    front: null,
    back: null,
  });
  const [modalVisible, setModalVisible] = useState(null);
  const [nationalIdModalVisible, setNationalIdModalVisible] = useState(null);
  
  const genderOptions = ['Male', 'Female', 'Other'];
  const bloodTypeOptions = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'];
  const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];

  const getModalIcon = (modalKey) => {
    switch (modalKey) {
      case 'gender':
        return 'person';
      case 'bloodType':
        return 'water';
      case 'maritalStatus':
        return 'heart';
      default:
        return 'help-circle';
    }
  };

  const getModalGradient = (modalKey) => {
    switch (modalKey) {
      case 'gender':
        return ['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.05)'];
      case 'bloodType':
        return ['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.05)'];
      case 'maritalStatus':
        return ['rgba(236,72,153,0.15)', 'rgba(236,72,153,0.05)'];
      default:
        return ['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.05)'];
    }
  };

  const renderSelectModal = (modalKey, options, currentValue, onSelect) => (
    <Modal animationType="fade" transparent={true} visible={modalVisible === modalKey} onRequestClose={() => setModalVisible(null)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(null)}>
        <View style={styles.modalContent}>
          <View style={[styles.modalHeader, { backgroundColor: `rgba(16,185,129,0.1)` }]}>
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalIconWrapper}>
                <Ionicons name={getModalIcon(modalKey)} size={24} color={COLORS.emerald} />
              </View>
              <Text style={styles.modalTitle}>Select {modalKey.charAt(0).toUpperCase() + modalKey.slice(1)}</Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(null)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <FlatList 
            data={options} 
            keyExtractor={(item) => item} 
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={[styles.modalOption, currentValue === item && styles.modalOptionSelected]}
                onPress={() => { onSelect(item); setModalVisible(null); }}
              >
                <View style={styles.modalOptionLeft}>
                  <View style={[styles.modalOptionIndicator, currentValue === item && styles.modalOptionIndicatorActive]}>
                    {currentValue === item && <Ionicons name="checkmark" size={14} color={COLORS.emerald} />}
                  </View>
                  <Text style={[styles.modalOptionText, currentValue === item && styles.modalOptionTextSelected]}>{item}</Text>
                </View>
                {currentValue === item && <Ionicons name="checkmark-done" size={18} color={COLORS.emerald} />}
              </TouchableOpacity>
            )} 
            scrollEnabled={options.length > 6}
            nestedScrollEnabled={true}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const handleNextPressIn = () => {
    Animated.spring(nextScale, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handleNextPressOut = () => {
    Animated.spring(nextScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const isFormValid = () => {
    const { firstName, lastName, email, phone, dateOfBirth, address } = formData;
    const hasRequiredFields = firstName.trim() && lastName.trim() && email.trim() && email.includes('@') && phone.trim() && phone.length >= 10 && dateOfBirth.trim() && address.trim();
    const hasGenderOrId = formData.gender || (nationalIdImages.front && nationalIdImages.back);
    return hasRequiredFields && hasGenderOrId;
  };

  const validateFirstStep = () => {
    const { firstName, lastName, email, phone, dateOfBirth, address } = formData;
    if (!firstName.trim()) { showAlert('Validation Error', 'Please enter your first name.', 'person', '#EF4444'); return false; }
    if (!lastName.trim()) { showAlert('Validation Error', 'Please enter your last name.', 'person', '#EF4444'); return false; }
    if (!email.trim() || !email.includes('@')) { showAlert('Validation Error', 'Please enter a valid email address.', 'mail', '#EF4444'); return false; }
    if (!phone.trim() || phone.length < 10) { showAlert('Validation Error', 'Please enter a valid phone number.', 'call', '#EF4444'); return false; }
    if (!dateOfBirth.trim()) { showAlert('Validation Error', 'Please enter your date of birth (MM/DD/YYYY).', 'calendar', '#EF4444'); return false; }
    if (!address.trim()) { showAlert('Validation Error', 'Please enter your address.', 'location', '#EF4444'); return false; }
    if (!formData.gender && !(nationalIdImages.front && nationalIdImages.back)) { showAlert('Validation Error', 'Please select your gender or attach both National ID images.', 'alert-circle', '#EF4444'); return false; }
    return true;
  };

  const handleNext = () => {
    if (!isFormValid() || !validateFirstStep()) return;
    navigation.navigate('PasswordVerification', { formData, nationalIdImages });
  };

  const handlePickNationalIDImage = async (side) => {
    try {
      const imageData = await pickNationalIDImage(side);
      if (imageData) {
        setNationalIdImages(prev => ({
          ...prev,
          [side]: imageData,
        }));
      }
    } catch (error) {
      showAlert('Error', `Failed to pick ${side} image. Please try again.`, 'alert-circle', '#EF4444');
    }
  };

  const handleRemoveNationalIDImage = (side) => {
    setNationalIdImages(prev => ({
      ...prev,
      [side]: null,
    }));
  };

  const handleAttachNationalID = () => {
    setNationalIdModalVisible('idSides');
  };

  const renderNationalIdModal = () => (
    <Modal animationType="fade" transparent={true} visible={nationalIdModalVisible === 'idSides'} onRequestClose={() => setNationalIdModalVisible(null)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setNationalIdModalVisible(null)}>
        <View style={styles.modalContent}>
          <View style={[styles.modalHeader, { backgroundColor: `rgba(16,185,129,0.1)` }]}>
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalIconWrapper}>
                <Ionicons name="document-attach-outline" size={24} color={COLORS.emerald} />
              </View>
              <Text style={styles.modalTitle}>Attach National ID</Text>
            </View>
            <TouchableOpacity onPress={() => setNationalIdModalVisible(null)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={['Front', 'Back']}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalOption]}
                onPress={() => {
                  handlePickNationalIDImage(item.toLowerCase());
                  setNationalIdModalVisible(null);
                }}
              >
                <View style={styles.modalOptionLeft}>
                  <Ionicons name="images-outline" size={18} color={COLORS.emerald} style={{ marginRight: SPACING.md }} />
                  <Text style={styles.modalOptionText}>
                    {nationalIdImages[item.toLowerCase()] ? `Replace ${item} Image` : `Add ${item} Image`}
                  </Text>
                </View>
                {nationalIdImages[item.toLowerCase()] && <Ionicons name="checkmark" size={18} color={COLORS.emerald} />}
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <AlertComponent />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <View style={styles.orbTopRight} />
        <View style={styles.orbBottomLeft} />
        <View style={styles.orbCenter} />
        
        <View style={styles.header}>
          <Image source={require('../assets/cura-logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Create Account</Text>
          <View style={styles.accentLine} />
          <Text style={styles.subtitle}>Step 1 of 2: Your Information</Text>
        </View>

        <View style={styles.formContainer}>
          {/* First Name Row */}
          <View style={styles.row}>
            <View style={[styles.column, styles.fullWidth]}>
              <Text style={styles.label}>First Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="First name" placeholderTextColor="rgba(255,255,255,0.25)" value={formData.firstName} onChangeText={(text) => setFormData({ ...formData, firstName: text })} />
              </View>
            </View>
          </View>

          {/* Middle & Last Name Row */}
          <View style={styles.row}>
            <View style={[styles.column, styles.halfWidth]}>
              <Text style={styles.label}>Middle Name (Opt.)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Middle name" placeholderTextColor="rgba(255,255,255,0.25)" value={formData.middleName} onChangeText={(text) => setFormData({ ...formData, middleName: text })} />
              </View>
            </View>
            <View style={[styles.column, styles.halfWidth]}>
              <Text style={styles.label}>Last Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Last name" placeholderTextColor="rgba(255,255,255,0.25)" value={formData.lastName} onChangeText={(text) => setFormData({ ...formData, lastName: text })} />
              </View>
            </View>
          </View>

          {/* Email Row */}
          <View style={styles.row}>
            <View style={[styles.column, styles.fullWidth]}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="your@email.com" placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="email-address" autoCapitalize="none" value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} />
              </View>
            </View>
          </View>

          {/* Phone Row */}
          <View style={styles.row}>
            <View style={[styles.column, styles.fullWidth]}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="+63 9XX XXXX XXX" placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="phone-pad" value={formData.phone} onChangeText={(text) => setFormData({ ...formData, phone: text })} />
              </View>
            </View>
          </View>

          {/* Date of Birth Row */}
          <View style={styles.row}>
            <View style={[styles.column, styles.fullWidth]}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="MM/DD/YYYY" placeholderTextColor="rgba(255,255,255,0.25)" value={formData.dateOfBirth} onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })} />
              </View>
            </View>
          </View>

          {/* Address Row */}
          <View style={styles.row}>
            <View style={[styles.column, styles.fullWidth]}>
              <Text style={styles.label}>Address</Text>
              <View style={[styles.inputContainer, styles.multiLineContainer]}>
                <Ionicons name="location-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput style={[styles.input, styles.multiLineInput]} placeholder="Complete address" placeholderTextColor="rgba(255,255,255,0.25)" multiline numberOfLines={3} value={formData.address} onChangeText={(text) => setFormData({ ...formData, address: text })} />
              </View>
            </View>
          </View>

          {/* Gender, Blood Type Row */}
          <View style={styles.row}>
            <View style={[styles.column, styles.halfWidth]}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible('gender')}>
                <Ionicons name="person-outline" size={16} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <Text style={[styles.selectButtonText, !formData.gender && styles.selectButtonPlaceholder]}>{formData.gender || 'Select'}</Text>
                <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
              {renderSelectModal('gender', genderOptions, formData.gender, (value) => setFormData({ ...formData, gender: value }))}
            </View>
            <View style={[styles.column, styles.halfWidth]}>
              <Text style={styles.label}>Blood Type (Opt.)</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible('bloodType')}>
                <Ionicons name="water-outline" size={16} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <Text style={[styles.selectButtonText, !formData.bloodType && styles.selectButtonPlaceholder]}>{formData.bloodType || 'Select'}</Text>
                <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
              {renderSelectModal('bloodType', bloodTypeOptions, formData.bloodType, (value) => setFormData({ ...formData, bloodType: value }))}
            </View>
          </View>

          {/* Marital Status & Place of Birth Row */}
          <View style={styles.row}>
            <View style={[styles.column, styles.halfWidth]}>
              <Text style={styles.label}>Marital Status (Opt.)</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible('maritalStatus')}>
                <Ionicons name="heart-outline" size={16} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <Text style={[styles.selectButtonText, !formData.maritalStatus && styles.selectButtonPlaceholder]}>{formData.maritalStatus || 'Select'}</Text>
                <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
              {renderSelectModal('maritalStatus', maritalStatusOptions, formData.maritalStatus, (value) => setFormData({ ...formData, maritalStatus: value }))}
            </View>
            <View style={[styles.column, styles.halfWidth]}>
              <Text style={styles.label}>Place of Birth (Opt.)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="City/Province" placeholderTextColor="rgba(255,255,255,0.25)" value={formData.placeOfBirth} onChangeText={(text) => setFormData({ ...formData, placeOfBirth: text })} />
              </View>
            </View>
          </View>

          {/* National ID Box */}
          <View style={[styles.nationalIdBox, (nationalIdImages.front || nationalIdImages.back) && styles.nationalIdBoxAttached]}>
            <View style={styles.nationalIdContent}>
              <Text style={styles.nationalIdText}>Philippine National ID</Text>
              <Text style={styles.nationalIdSubText}>Pick or capture ID (front & back)</Text>

              {/* Image Previews */}
              {(nationalIdImages.front || nationalIdImages.back) && (
                <View style={styles.idPreviewContainer}>
                  {/* Front Image */}
                  <View style={styles.idPreviewItem}>
                    {nationalIdImages.front ? (
                      <>
                        <Image source={{ uri: nationalIdImages.front.uri }} style={styles.idPreviewImage} />
                        <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveNationalIDImage('front')}>
                          <Ionicons name="close-circle" size={20} color={COLORS.emerald} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={[styles.idPreviewImage, styles.idPreviewPlaceholder]}>
                        <Ionicons name="document-outline" size={32} color="rgba(255,255,255,0.3)" />
                      </View>
                    )}
                    <Text style={styles.idSideLabel}>Front</Text>
                  </View>

                  {/* Back Image */}
                  <TouchableOpacity style={styles.idPreviewItem} onPress={() => !nationalIdImages.back && handlePickNationalIDImage('back')}>
                    {nationalIdImages.back ? (
                      <>
                        <Image source={{ uri: nationalIdImages.back.uri }} style={styles.idPreviewImage} />
                        <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveNationalIDImage('back')}>
                          <Ionicons name="close-circle" size={20} color={COLORS.emerald} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={[styles.idPreviewImage, styles.idPreviewPlaceholder]}>
                        <Ionicons name="document-outline" size={32} color="rgba(255,255,255,0.3)" />
                      </View>
                    )}
                    <Text style={styles.idSideLabel}>Back</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              <TouchableOpacity style={styles.uploadButton} onPress={handleAttachNationalID}>
                <Ionicons name="cloud-upload-outline" size={18} color={COLORS.white} />
                <Text style={styles.uploadButtonText}>{nationalIdImages.front && nationalIdImages.back ? 'Replace Images' : 'Add Images'}</Text>
              </TouchableOpacity>

              {/* Status Indicator */}
              {nationalIdImages.front && nationalIdImages.back && (
                <View style={styles.statusIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.emerald} />
                  <Text style={styles.statusText}>Both images attached</Text>
                </View>
              )}
            </View>
          </View>

          {renderNationalIdModal()}

          {/* Next Button */}
          <Animated.View style={[{ transform: [{ scale: nextScale }] }, styles.buttonWrapper]}>
            <TouchableOpacity 
              style={[styles.nextButton, !isFormValid() && styles.nextButtonDisabled]} 
              onPressIn={isFormValid() ? handleNextPressIn : undefined}
              onPressOut={isFormValid() ? handleNextPressOut : undefined}
              onPress={handleNext} 
              disabled={!isFormValid()}
              activeOpacity={1}
            >
              <Text style={[styles.nextButtonText, !isFormValid() && styles.nextButtonTextDisabled]}>Next: Set Password</Text>
              <Ionicons name="arrow-forward" size={20} color={isFormValid() ? COLORS.white : 'rgba(16,185,129,0.5)'} />
            </TouchableOpacity>
          </Animated.View>

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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

  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  logo: {
    width: 70,
    height: 70,
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
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.3,
  },

  formContainer: {
    paddingHorizontal: SPACING.lg,
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
  halfWidth: {
    flex: 1,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  multiLineContainer: {
    height: 90,
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
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
  multiLineInput: {
    height: '100%',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },

  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  selectButtonText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    marginHorizontal: SPACING.sm,
  },
  selectButtonPlaceholder: {
    color: 'rgba(255,255,255,0.25)',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: BORDER_RADIUS.xxxl,
    borderTopRightRadius: BORDER_RADIUS.xxxl,
    maxHeight: '70%',
    paddingBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16,185,129,0.2)',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(16,185,129,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'transparent',
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalOptionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionIndicatorActive: {
    borderColor: COLORS.emerald,
    backgroundColor: 'rgba(16,185,129,0.2)',
  },
  modalOptionText: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.65)',
  },
  modalOptionTextSelected: {
    color: COLORS.emerald,
    fontWeight: '600',
  },

  nationalIdBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nationalIdBoxAttached: {
    borderStyle: 'solid',
    borderColor: COLORS.emerald,
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  nationalIdContent: {
    width: '100%',
    alignItems: 'center',
  },
  nationalIdText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  nationalIdSubText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.4)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  idPreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.lg,
    width: '100%',
  },
  idPreviewItem: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  idPreviewImage: {
    width: 140,
    height: 88,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    overflow: 'hidden',
  },
  idPreviewPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 20,
    padding: 2,
  },
  idSideLabel: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderWidth: 1,
    borderColor: COLORS.emerald,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  uploadButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.emerald,
    fontWeight: '500',
  },

  buttonWrapper: {
    marginVertical: SPACING.lg,
  },
  nextButton: {
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
  nextButtonDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.emerald,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: SPACING.sm,
  },
  nextButtonTextDisabled: {
    color: COLORS.white,
    opacity: 0.6,
  },

  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  loginLinkText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.55)',
  },
  loginLink: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.emerald,
  },
});
