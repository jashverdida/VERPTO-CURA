import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  StatusBar,
  Alert,
  Animated,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useStyledAlert } from '../utils/useStyledAlert';

const { width: SCREEN_W } = Dimensions.get('window');
const AVATAR_SIZE  = 120;
const COVER_HEIGHT = 220;
const CARD_W       = SCREEN_W * 0.88;
const CARD_H       = CARD_W / 1.586; // standard CR-80 ID card ratio

// Local ID assets — used for demo; Supabase storage wiring can be added later
const ID_FRONT = require('../assets/NatIDFront.png');
const ID_BACK  = require('../assets/NatIDBack.png');

const getInitials = (firstName, lastName) =>
  `${(firstName || 'U')[0]}${(lastName || 'S')[0]}`.toUpperCase();

const getBadge = (status) => {
  switch (status) {
    case 'verified':  return { bg: COLORS.success,  icon: 'checkmark-circle' };
    case 'pending':   return { bg: COLORS.warning,   icon: 'time'             };
    case 'rejected':  return { bg: COLORS.fireRed,   icon: 'close-circle'     };
    default:          return { bg: COLORS.slate500,  icon: 'help-circle'      };
  }
};

/* ── IdFace: local-asset version — no network request, no loading state needed ── */
const IdFace = ({ source }) => (
  <Image source={source} style={styles.idFaceImage} resizeMode="contain" />
);

export default function UserProfileScreen({ navigation }) {
  const { showAlert, AlertComponent } = useStyledAlert();

  const [userData,    setUserData]    = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isEditing,   setIsEditing]   = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [avatarModal, setAvatarModal] = useState(false);
  const [idModal,     setIdModal]     = useState(false);
  const [isFlipped,   setIsFlipped]   = useState(false);

  const saveScale = useRef(new Animated.Value(1)).current;
  const flipAnim  = useRef(new Animated.Value(0)).current;

  const [editData, setEditData] = useState({
    first_name: '', middle_name: '', last_name: '',
    phone_number: '', address: '', date_of_birth: '',
    gender: '', blood_type: '', marital_status: '', place_of_birth: '',
  });

  /* ── Flip helpers ── */
  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8, tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(f => !f);
  };

  const resetFlip = () => { flipAnim.setValue(0); setIsFlipped(false); };

  const frontRotateY  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '180deg'] });
  const backRotateY   = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  // Mid-point opacity switch — handles Android's unreliable backfaceVisibility
  const frontOpacity  = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5001, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity   = flipAnim.interpolate({ inputRange: [0, 0.4999, 0.5, 1], outputRange: [0, 0, 1, 1] });

  /* ── Data ── */
  useFocusEffect(React.useCallback(() => { fetchUserData(); }, []));

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('currentUserId');
      if (!userId) {
        showAlert('Error', 'No user session found. Please login again.', 'alert-circle', COLORS.fireRed);
        navigation.replace('Login');
        return;
      }
      const { data, error } = await supabase.from('citizens').select('*').eq('id', userId).single();
      if (error || !data) {
        showAlert('Error', 'Failed to load profile data.', 'alert-circle', COLORS.fireRed);
        return;
      }
      setUserData(data);
      setEditData({
        first_name:     data.first_name     || '',
        middle_name:    data.middle_name    || '',
        last_name:      data.last_name      || '',
        phone_number:   data.phone_number   || '',
        address:        data.address        || '',
        date_of_birth:  data.date_of_birth  || '',
        gender:         data.gender         || '',
        blood_type:     data.blood_type     || '',
        marital_status: data.marital_status || '',
        place_of_birth: data.place_of_birth || '',
      });
    } catch (err) {
      console.error('fetchUserData:', err);
      showAlert('Error', 'An unexpected error occurred.', 'alert-circle', COLORS.fireRed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData.first_name.trim() || !editData.last_name.trim()) {
      showAlert('Validation Error', 'First name and last name are required.', 'alert-circle', COLORS.fireRed);
      return;
    }
    try {
      setIsSaving(true);
      const userId = await AsyncStorage.getItem('currentUserId');
      const { error } = await supabase.from('citizens').update({
        first_name:     editData.first_name.trim(),
        middle_name:    editData.middle_name.trim(),
        last_name:      editData.last_name.trim(),
        phone_number:   editData.phone_number.trim(),
        address:        editData.address.trim(),
        date_of_birth:  editData.date_of_birth.trim(),
        gender:         editData.gender.trim(),
        blood_type:     editData.blood_type.trim(),
        marital_status: editData.marital_status.trim(),
        place_of_birth: editData.place_of_birth.trim(),
      }).eq('id', userId);
      if (error) {
        showAlert('Update Failed', 'Failed to update profile. Please try again.', 'alert-circle', COLORS.fireRed);
        return;
      }
      setUserData({ ...userData, ...editData });
      setIsEditing(false);
      showAlert('Success', 'Profile updated successfully!', 'checkmark-circle', COLORS.success);
    } catch (err) {
      console.error('handleSave:', err);
      showAlert('Error', 'An unexpected error occurred.', 'alert-circle', COLORS.fireRed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      first_name:     userData.first_name     || '',
      middle_name:    userData.middle_name    || '',
      last_name:      userData.last_name      || '',
      phone_number:   userData.phone_number   || '',
      address:        userData.address        || '',
      date_of_birth:  userData.date_of_birth  || '',
      gender:         userData.gender         || '',
      blood_type:     userData.blood_type     || '',
      marital_status: userData.marital_status || '',
      place_of_birth: userData.place_of_birth || '',
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          try { await AsyncStorage.removeItem('currentUserId'); navigation.replace('Login'); }
          catch (err) { console.error('logout:', err); }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.emerald} />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }
  if (!userData) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={64} color={COLORS.fireRed} />
        <Text style={styles.errorText}>Unable to load profile</Text>
      </View>
    );
  }

  const status = userData.verification_status || 'unverified';
  const badge  = getBadge(status);

  /* ── Sub-components (don't define Image-bearing components here — use top-level IdFace) ── */
  const InfoRow = ({
    icon, label, value, editable, onChangeText,
    keyboardType = 'default', placeholder, accent = COLORS.emerald,
  }) => (
    <View style={styles.infoRow}>
      <View style={[styles.infoRowIconBg, { backgroundColor: accent + '22' }]}>
        <Ionicons name={icon} size={15} color={accent} />
      </View>
      <View style={styles.infoRowBody}>
        <Text style={styles.infoRowLabel}>{label}</Text>
        {isEditing && editable ? (
          <TextInput
            style={styles.infoRowInput}
            placeholder={placeholder || label}
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            editable={!isSaving}
          />
        ) : (
          <Text style={styles.infoRowValue}>{value || '—'}</Text>
        )}
      </View>
    </View>
  );

  const Section = ({ title, accent, icon, children }) => (
    <View style={styles.section}>
      <View style={[styles.sectionStripe, { backgroundColor: accent }]} />
      <View style={styles.sectionInner}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBg, { backgroundColor: accent + '28' }]}>
            <Ionicons name={icon} size={17} color={accent} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionBody}>{children}</View>
      </View>
    </View>
  );

  const D = () => <View style={styles.divider} />;

  /* ═══════════════════════════════════════════════════════════ RENDER */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ─── COVER ─── */}
        <View style={styles.cover}>
          <View style={styles.coverTint} />
          <View style={[styles.coverOrb, { top: -50, right: -40, width: 200, height: 200, borderRadius: 100, opacity: 0.22 }]} />
          <View style={[styles.coverOrb, { bottom: -60, left: -30, width: 200, height: 200, borderRadius: 100, opacity: 0.13 }]} />
          <View style={[styles.coverOrb, { top: 55, left: '38%', width: 110, height: 110, borderRadius: 55, opacity: 0.08 }]} />
          <View style={styles.coverTopRow}>
            <View style={styles.coverBrand}>
              <Ionicons name="leaf" size={13} color="rgba(52,211,153,0.8)" />
              <Text style={styles.coverBrandText}>CURA</Text>
            </View>
            {!isEditing && (
              <TouchableOpacity style={styles.coverEditBtn} onPress={() => setIsEditing(true)} activeOpacity={0.8}>
                <Ionicons name="pencil" size={15} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ─── AVATAR ─── */}
        <View style={styles.avatarZone}>
          <TouchableOpacity onPress={() => setAvatarModal(true)} activeOpacity={0.85} style={styles.avatarTouch}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {getInitials(userData.first_name, userData.last_name)}
                </Text>
              </View>
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={11} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── IDENTITY ─── */}
        <View style={styles.identity}>
          <Text style={styles.fullName}>
            {[userData.first_name, userData.middle_name, userData.last_name].filter(Boolean).join(' ')}
          </Text>
          <Text style={styles.emailText}>{userData.email}</Text>
          <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.icon} size={12} color="#fff" />
            <Text style={styles.statusPillText}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>

        {/* ─── ACTION BAR ─── */}
        {!isEditing ? (
          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.editProfileBtn} onPress={() => setIsEditing(true)} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={16} color={COLORS.white} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.fireRed} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editBanner}>
            <View style={styles.editBannerDot} />
            <Text style={styles.editBannerText}>Editing — changes not yet saved</Text>
          </View>
        )}

        {/* ─── CARDS ─── */}
        <View style={styles.cards}>

          {/* National ID preview card */}
          <TouchableOpacity style={styles.idPreviewCard} onPress={() => setIdModal(true)} activeOpacity={0.8}>
            <View style={styles.idPreviewStripe} />
            <View style={styles.idPreviewBody}>
              <View style={styles.idPreviewLeft}>
                <View style={styles.idPreviewIconBg}>
                  <Ionicons name="card" size={20} color={COLORS.emerald} />
                </View>
                <View>
                  <Text style={styles.idPreviewTitle}>National ID</Text>
                  <Text style={styles.idPreviewSub}>Tap to view in 3D</Text>
                </View>
              </View>
              <View style={styles.idPreviewRight}>
                <View style={styles.idPreview3DBadge}>
                  <Ionicons name="cube-outline" size={12} color={COLORS.emerald} />
                  <Text style={styles.idPreview3DText}>3D</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
              </View>
            </View>

            {/* Thumbnail strip */}
            <View style={styles.idThumbnailRow}>
              <View style={styles.idThumb}>
                <Image source={ID_FRONT} style={styles.idThumbImage} resizeMode="cover" />
                <Text style={styles.idThumbLabel}>Front</Text>
              </View>
              <View style={styles.idThumbDivider} />
              <View style={styles.idThumb}>
                <Image source={ID_BACK} style={styles.idThumbImage} resizeMode="cover" />
                <Text style={styles.idThumbLabel}>Back</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Personal Info */}
          <Section title="Personal Info" accent={COLORS.emerald} icon="person">
            <InfoRow icon="person-outline"  label="First Name"    value={editData.first_name}  editable accent={COLORS.emerald}
                     onChangeText={t => setEditData({ ...editData, first_name: t })}  placeholder="First name" />
            <D />
            <InfoRow icon="person-outline"  label="Middle Name"   value={editData.middle_name} editable accent={COLORS.emerald}
                     onChangeText={t => setEditData({ ...editData, middle_name: t })} placeholder="Middle name" />
            <D />
            <InfoRow icon="person-outline"  label="Last Name"     value={editData.last_name}   editable accent={COLORS.emerald}
                     onChangeText={t => setEditData({ ...editData, last_name: t })}   placeholder="Last name" />
            <D />
            <InfoRow icon="mail-outline"    label="Email Address" value={userData.email} editable={false} accent="#3B82F6" />
          </Section>

          <Section title="Contact Info" accent="#3B82F6" icon="call">
            <InfoRow icon="call-outline"     label="Phone Number"   value={editData.phone_number}   editable keyboardType="phone-pad" accent="#3B82F6"
                     onChangeText={t => setEditData({ ...editData, phone_number: t })}   placeholder="Phone number" />
            <D />
            <InfoRow icon="location-outline" label="Address"        value={editData.address}        editable accent="#3B82F6"
                     onChangeText={t => setEditData({ ...editData, address: t })}        placeholder="Home address" />
            <D />
            <InfoRow icon="home-outline"     label="Place of Birth" value={editData.place_of_birth} editable accent="#3B82F6"
                     onChangeText={t => setEditData({ ...editData, place_of_birth: t })} placeholder="Place of birth" />
          </Section>

          <Section title="Medical Info" accent={COLORS.fireRed} icon="medical">
            <InfoRow icon="water-outline"    label="Blood Type"    value={editData.blood_type}    editable accent={COLORS.fireRed}
                     onChangeText={t => setEditData({ ...editData, blood_type: t })}    placeholder="e.g. O+, AB-" />
            <D />
            <InfoRow icon="calendar-outline" label="Date of Birth" value={editData.date_of_birth} editable accent={COLORS.fireRed}
                     onChangeText={t => setEditData({ ...editData, date_of_birth: t })} placeholder="MM/DD/YYYY" />
          </Section>

          <Section title="Additional Info" accent="#8B5CF6" icon="information-circle">
            <InfoRow icon="person-circle-outline" label="Gender"         value={editData.gender}         editable accent="#8B5CF6"
                     onChangeText={t => setEditData({ ...editData, gender: t })}         placeholder="Male / Female / Other" />
            <D />
            <InfoRow icon="heart-outline"         label="Marital Status" value={editData.marital_status} editable accent="#8B5CF6"
                     onChangeText={t => setEditData({ ...editData, marital_status: t })} placeholder="Single / Married" />
          </Section>

        </View>

        {/* ─── SAVE / CANCEL ─── */}
        {isEditing && (
          <View style={styles.editActions}>
            <Animated.View style={{ transform: [{ scale: saveScale }] }}>
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.btnDisabled]}
                onPress={handleSave}
                onPressIn={() => Animated.spring(saveScale, { toValue: 0.97, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(saveScale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving
                  ? <ActivityIndicator size="small" color={COLORS.white} />
                  : <Ionicons name="checkmark-done" size={18} color={COLORS.white} />
                }
                <Text style={styles.saveBtnText}>{isSaving ? 'Saving…' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity style={[styles.cancelBtn, isSaving && styles.btnDisabled]} onPress={handleCancel} disabled={isSaving} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══════════════════════════════════════ AVATAR MODAL */}
      <Modal animationType="fade" transparent visible={avatarModal} onRequestClose={() => setAvatarModal(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setAvatarModal(false)}>
          <View style={styles.modalAvatar}>
            <Text style={styles.modalAvatarText}>{getInitials(userData.first_name, userData.last_name)}</Text>
          </View>
          <TouchableOpacity style={{ marginTop: SPACING.lg }} onPress={() => setAvatarModal(false)}>
            <Ionicons name="close-circle" size={36} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ══════════════════════════════════════ NATIONAL ID FLIP MODAL */}
      <Modal
        animationType="fade"
        transparent
        visible={idModal}
        onRequestClose={() => { setIdModal(false); resetFlip(); }}
      >
        <View style={styles.idModalBg}>

          {/* Header */}
          <View style={styles.idModalHeader}>
            <View style={styles.idModalBrand}>
              <Ionicons name="leaf" size={13} color={COLORS.emerald} />
              <Text style={styles.idModalBrandText}>CURA</Text>
            </View>
            <TouchableOpacity
              style={styles.idModalCloseBtn}
              onPress={() => { setIdModal(false); resetFlip(); }}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.idModalHeading}>National ID</Text>
          <Text style={styles.idModalSub}>{isFlipped ? 'Back side' : 'Front side'}</Text>

          {/* ── 3D FLIP CARD ──
              Android bug: backfaceVisibility:'hidden' and overflow:'hidden' on the SAME
              Animated.View causes images to not render. Fix: separate them onto
              different nested views — backfaceVisibility on the outer Animated.View,
              overflow:'hidden' + borderRadius on an inner non-animated View.       */}
          <TouchableOpacity onPress={flipCard} activeOpacity={0.95} style={styles.idFlipContainer}>

            {/* FRONT */}
            <Animated.View
              style={[
                styles.idCardFaceOuter,
                { transform: [{ perspective: 1400 }, { rotateY: frontRotateY }], opacity: frontOpacity },
              ]}
            >
              <View style={styles.idCardFaceInner}>
                <IdFace source={ID_FRONT} />
              </View>
            </Animated.View>

            {/* BACK */}
            <Animated.View
              style={[
                styles.idCardFaceOuter,
                { transform: [{ perspective: 1400 }, { rotateY: backRotateY }], opacity: backOpacity },
              ]}
            >
              <View style={styles.idCardFaceInner}>
                <IdFace source={ID_BACK} />
              </View>
            </Animated.View>

          </TouchableOpacity>

          {/* Hint */}
          <View style={styles.idFlipHint}>
            <Ionicons name="sync-outline" size={14} color={COLORS.emerald} />
            <Text style={styles.idFlipHintText}>Tap the card to flip</Text>
          </View>

        </View>
      </Modal>

      <AlertComponent />
    </View>
  );
}

/* ════════════════════════════════════════════════════════════ STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },

  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1628' },
  loadingText: { marginTop: SPACING.md, fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  errorText:   { marginTop: SPACING.md, fontSize: FONT_SIZES.lg, color: COLORS.fireRed, fontWeight: '600' },

  scroll: { paddingBottom: SPACING.xl },

  /* Cover */
  cover: { height: COVER_HEIGHT, backgroundColor: '#0D4A35', overflow: 'hidden' },
  coverTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(16,185,129,0.13)' },
  coverOrb:  { position: 'absolute', backgroundColor: '#10B981' },
  coverTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? SPACING.xl + SPACING.sm : SPACING.xl + SPACING.md,
    paddingHorizontal: SPACING.lg, zIndex: 2,
  },
  coverBrand:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  coverBrandText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: 'rgba(52,211,153,0.85)', letterSpacing: 3 },
  coverEditBtn: {
    width: 40, height: 40, borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },

  /* Avatar */
  avatarZone:   { alignItems: 'center', marginTop: -(AVATAR_SIZE / 2 + 6), zIndex: 10, marginBottom: SPACING.md },
  avatarTouch:  { position: 'relative' },
  avatarRing: {
    width: AVATAR_SIZE + 10, height: AVATAR_SIZE + 10, borderRadius: (AVATAR_SIZE + 10) / 2,
    backgroundColor: '#0A1628', justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.emerald, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 14,
  },
  avatarCircle: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.emerald, justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 36, fontWeight: '800', color: COLORS.white, letterSpacing: 2 },
  cameraBadge: {
    position: 'absolute', bottom: 4, right: 4, width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#1E293B', borderWidth: 2, borderColor: '#0A1628',
    justifyContent: 'center', alignItems: 'center',
  },

  /* Identity */
  identity:  { alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  fullName:  { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: SPACING.xs, letterSpacing: 0.3 },
  emailText: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.5)', marginBottom: SPACING.sm, textAlign: 'center' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: BORDER_RADIUS.full,
  },
  statusPillText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#fff', textTransform: 'capitalize' },

  /* Action bar */
  actionBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  editProfileBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.emerald, paddingVertical: SPACING.md - 2, borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.emerald, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  editProfileText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
  logoutBtn: {
    width: 46, height: 46, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.fireRed + '18', borderWidth: 1.5, borderColor: COLORS.fireRed + '40',
    justifyContent: 'center', alignItems: 'center',
  },
  editBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
  },
  editBannerDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.emerald },
  editBannerText: { fontSize: FONT_SIZES.sm, color: COLORS.emerald, fontWeight: '600' },

  /* Cards area */
  cards: { paddingHorizontal: SPACING.md, gap: SPACING.md - 4, marginBottom: SPACING.md },

  /* National ID preview card */
  idPreviewCard: {
    backgroundColor: 'rgba(16,185,129,0.07)',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  idPreviewStripe: { height: 3, backgroundColor: COLORS.emerald, opacity: 0.8 },
  idPreviewBody: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.sm,
  },
  idPreviewLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  idPreviewIconBg: {
    width: 40, height: 40, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(16,185,129,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  idPreviewTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  idPreviewSub:   { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  idPreviewRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  idPreview3DBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
  },
  idPreview3DText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.emerald },
  idThumbnailRow: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.md,
  },
  idThumb:      { flex: 1, alignItems: 'center', gap: 5 },
  idThumbImage: { width: '100%', height: 60, borderRadius: BORDER_RADIUS.md },
  idThumbEmpty: { backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  idThumbDivider: { width: 1, backgroundColor: 'rgba(16,185,129,0.2)' },
  idThumbLabel:   { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },

  /* Info sections */
  section: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionStripe: { width: 4 },
  sectionInner:  { flex: 1 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm + 2,
    paddingTop: SPACING.md, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sectionIconBg: { width: 34, height: 34, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  sectionTitle:  { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white, letterSpacing: 0.2 },
  sectionBody:   { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },

  /* Info row */
  infoRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm + 2, paddingVertical: SPACING.sm },
  infoRowIconBg:{ width: 30, height: 30, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  infoRowBody:  { flex: 1 },
  infoRowLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  infoRowValue: { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.88)', fontWeight: '500', lineHeight: 20 },
  infoRowInput: {
    fontSize: FONT_SIZES.md, color: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm + 2, paddingVertical: SPACING.xs + 2,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  /* Edit actions */
  editActions:   { paddingHorizontal: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.md },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.emerald, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.emerald, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  saveBtnText:   { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
  cancelBtn: {
    alignItems: 'center', paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelBtnText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  btnDisabled:   { opacity: 0.5 },

  /* Avatar modal */
  modalBg: { flex: 1, backgroundColor: 'rgba(10,22,40,0.96)', justifyContent: 'center', alignItems: 'center' },
  modalAvatar: {
    width: 220, height: 220, borderRadius: 110, backgroundColor: COLORS.emerald,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: 'rgba(52,211,153,0.3)',
    shadowColor: COLORS.emerald, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 16,
  },
  modalAvatarText: { fontSize: 80, fontWeight: '800', color: COLORS.white },

  /* National ID flip modal */
  idModalBg: {
    flex: 1, backgroundColor: 'rgba(8,16,30,0.97)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.lg,
  },
  idModalHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? SPACING.xl + SPACING.sm : SPACING.xl + SPACING.md,
    left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  idModalBrand:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  idModalBrandText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.emerald, letterSpacing: 3 },
  idModalCloseBtn: {
    position: 'absolute', right: SPACING.lg,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(16,185,129,0.2)', borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  idModalHeading: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.xs, letterSpacing: 0.3 },
  idModalSub:     { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.45)', marginBottom: SPACING.lg, fontWeight: '500' },

  /* Flip card — MUST have explicit dimensions for 3D perspective to work */
  idFlipContainer: { width: CARD_W, height: CARD_H },

  /* Outer Animated.View: handles backfaceVisibility + 3D transform ONLY.
     No overflow:'hidden' here — that combination breaks image rendering on Android. */
  idCardFaceOuter: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    backfaceVisibility: 'hidden',
  },

  /* Inner View: overflow clipping + border radius. Transparent so PNG
     alpha channels render cleanly against the dark modal background. */
  idCardFaceInner: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },

  /* Image fills the card face exactly */
  idFaceImage: { width: CARD_W, height: CARD_H },

  /* Flip hint pill */
  idFlipHint: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
  },
  idFlipHintText: { fontSize: FONT_SIZES.sm, color: COLORS.emerald, fontWeight: '600' },
});
