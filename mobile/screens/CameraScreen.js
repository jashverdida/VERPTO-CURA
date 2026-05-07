import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function CameraScreen({ navigation, route }) {
  const emergencyType = route.params?.emergencyType || 'fire';
  const forHazmat = route.params?.forHazmat || false;

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const flashAnim = useRef(new Animated.Value(0)).current;
  const captureScale = useRef(new Animated.Value(1)).current;

  // ── Permission screens ──
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContent}>
          <Ionicons name="camera" size={48} color={COLORS.slate400} />
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.permissionContent}>
          <View style={styles.permissionIconContainer}>
            <Ionicons name="camera-outline" size={64} color={COLORS.emerald} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDescription}>
            CURA needs camera access to capture emergency incident photos for AI verification and faster response coordination.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Actions ──
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleCapture = async () => {
    // Button press feel
    Animated.sequence([
      Animated.timing(captureScale, { toValue: 0.82, duration: 80, useNativeDriver: true }),
      Animated.timing(captureScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    // Flash
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();

    // Capture photo
    let photoUri = null;
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
        photoUri = photo.uri;
      }
    } catch (e) {}

    // Navigate after flash clears
    setTimeout(() => {
      if (forHazmat) {
        // Return photo to TriageChatScreen (it stays mounted in the stack)
        navigation.navigate('TriageChat', { type: 'hazmat', photoUri });
      } else {
        navigation.navigate('ReportEmergency', { photoUri, emergencyType });
      }
    }, 380);
  };

  // ── Render ──
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera background */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      {/* Flash overlay */}
      <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} pointerEvents="none" />

      {/* UI overlay */}
      <View style={styles.uiOverlay} pointerEvents="box-none">

        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.topButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerBadge}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.emerald} />
            <Text style={styles.headerBadgeText}>AI Verification Mode</Text>
          </View>

          <TouchableOpacity style={styles.topButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Viewfinder */}
        <View style={styles.viewfinderContainer} pointerEvents="none">
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.emerald} />
              <Text style={styles.pillText}>Clear view of scene</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.emerald} />
              <Text style={styles.pillText}>Good lighting</Text>
            </View>
          </View>
          <View style={styles.pillRowCentered}>
            <View style={styles.pill}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.emerald} />
              <Text style={styles.pillText}>Steady hands</Text>
            </View>
          </View>

          <View style={styles.captureRow}>
            <TouchableOpacity style={styles.sideButton}>
              <Ionicons name="images" size={24} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCapture}
              activeOpacity={1}
              onPressIn={() => {
                Animated.timing(captureScale, { toValue: 0.88, duration: 100, useNativeDriver: true }).start();
              }}
              onPressOut={() => {
                Animated.timing(captureScale, { toValue: 1, duration: 100, useNativeDriver: true }).start();
              }}
            >
              <Animated.View style={[styles.captureButton, { transform: [{ scale: captureScale }] }]}>
                <View style={styles.captureInner}>
                  <Ionicons name="camera" size={30} color={COLORS.emerald} />
                </View>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideButton}>
              <Ionicons name="flash" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.captureLabel}>Tap to Capture</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F19',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    zIndex: 1000,
  },
  uiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: 'space-between',
  },

  // Permission
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: { alignItems: 'center' },
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  permissionIconContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.emerald + '15',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  permissionTitle: {
    fontSize: 24, fontWeight: '700',
    color: COLORS.slate900, marginBottom: SPACING.sm, textAlign: 'center',
  },
  permissionText: {
    fontSize: 14, color: COLORS.slate500, marginTop: SPACING.md,
  },
  permissionDescription: {
    fontSize: 15, color: COLORS.slate600, textAlign: 'center',
    lineHeight: 22, marginBottom: SPACING.xl,
  },
  permissionButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.emerald,
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg, gap: SPACING.sm,
    ...SHADOWS.emerald,
  },
  permissionButtonText: {
    fontSize: 16, fontWeight: '600', color: COLORS.white,
  },
  cancelButton: { marginTop: SPACING.md, padding: SPACING.md },
  cancelButtonText: {
    fontSize: 14, fontWeight: '500', color: COLORS.slate500,
  },

  // Top Controls
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  topButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 8, paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full, gap: 6,
  },
  headerBadgeText: {
    fontSize: 13, fontWeight: '700', color: COLORS.white, letterSpacing: 0.3,
  },

  // Viewfinder
  viewfinderContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  viewfinder: {
    width: width * 0.78, height: height * 0.42, position: 'relative',
  },
  corner: {
    position: 'absolute', width: 36, height: 36, borderColor: COLORS.emerald,
  },
  cornerTopLeft: {
    top: 0, left: 0,
    borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10,
  },
  cornerTopRight: {
    top: 0, right: 0,
    borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10,
  },
  cornerBottomLeft: {
    bottom: 0, left: 0,
    borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10,
  },
  cornerBottomRight: {
    bottom: 0, right: 0,
    borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10,
  },

  // Bottom Controls
  bottomControls: {
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
  },
  pillRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  pillRowCentered: {
    flexDirection: 'row', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full, gap: 6,
  },
  pillText: {
    fontSize: 12, fontWeight: '600', color: COLORS.white,
  },
  captureRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 40, marginBottom: SPACING.sm,
  },
  sideButton: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  captureButton: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: COLORS.emerald,
    ...SHADOWS.large,
  },
  captureInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  captureLabel: {
    fontSize: 13, fontWeight: '700', color: COLORS.white, letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
});
