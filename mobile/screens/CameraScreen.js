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
  Easing,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const STATE_CAMERA = 'camera';
const STATE_PROCESSING = 'processing';
const STATE_SUCCESS = 'success';

export default function CameraScreen({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [screenState, setScreenState] = useState(STATE_CAMERA);
  const [processingText, setProcessingText] = useState('');
  const cameraRef = useRef(null);

  // ── Animations ──
  const flashAnim = useRef(new Animated.Value(0)).current;
  const captureScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animateDots = useCallback(() => {
    const dotSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(dotOpacity1, { toValue: 0.3, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 0.3, duration: 200, useNativeDriver: true }),
          Animated.timing(dotOpacity3, { toValue: 0.3, duration: 200, useNativeDriver: true }),
        ]),
      ])
    );
    dotSequence.start();
    return dotSequence;
  }, [dotOpacity1, dotOpacity2, dotOpacity3]);

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

  const handleCapture = () => {
    if (screenState !== STATE_CAMERA) return;

    // Tactile press animation
    Animated.sequence([
      Animated.timing(captureScale, { toValue: 0.82, duration: 80, useNativeDriver: true }),
      Animated.timing(captureScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    // Flash
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    // Transition to processing after flash
    setTimeout(() => {
      setScreenState(STATE_PROCESSING);
      setProcessingText('Edge AI Validating Hazard');

      Animated.timing(overlayOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }).start();

      contentSlide.setValue(40);
      Animated.spring(contentSlide, {
        toValue: 0, friction: 8, tension: 60, useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true,
        })
      ).start();

      const dotLoop = animateDots();

      // Phase 2: Compression text
      setTimeout(() => {
        setProcessingText('Compressing to <2KB Payload');
        contentSlide.setValue(20);
        Animated.spring(contentSlide, {
          toValue: 0, friction: 8, tension: 60, useNativeDriver: true,
        }).start();
      }, 1500);

      // Phase 3: Success
      setTimeout(() => {
        dotLoop.stop();
        spinAnim.stopAnimation();
        setScreenState(STATE_SUCCESS);

        successScale.setValue(0);
        Animated.spring(successScale, {
          toValue: 1, friction: 5, tension: 80, useNativeDriver: true,
        }).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.3, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1, duration: 1000, easing: Easing.in(Easing.ease), useNativeDriver: true,
            }),
          ])
        ).start();
      }, 3000);
    }, 350);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // ── Render ──
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera as background layer — NO children */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      {/* All UI overlaid on top with absolute positioning */}

      {/* Flash Overlay */}
      <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} pointerEvents="none" />

      {/* ── Camera Default State ── */}
      {screenState === STATE_CAMERA && (
        <View style={styles.uiOverlay} pointerEvents="box-none">
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.topButton} onPress={handleGoBack}>
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

          {/* Viewfinder Frame */}
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
            {/* AI Status Pills */}
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

            {/* Capture Row */}
            <View style={styles.captureRow}>
              <TouchableOpacity style={styles.sideButton}>
                <Ionicons name="images" size={24} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCapture}
                activeOpacity={1}
                onPressIn={() => {
                  Animated.timing(captureScale, {
                    toValue: 0.88, duration: 100, useNativeDriver: true,
                  }).start();
                }}
                onPressOut={() => {
                  Animated.timing(captureScale, {
                    toValue: 1, duration: 100, useNativeDriver: true,
                  }).start();
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
      )}

      {/* ── Processing / Success Overlay ── */}
      {(screenState === STATE_PROCESSING || screenState === STATE_SUCCESS) && (
        <Animated.View style={[styles.stateOverlay, { opacity: overlayOpacity }]}>
          {screenState === STATE_PROCESSING && (
            <Animated.View style={[styles.stateContent, { transform: [{ translateY: contentSlide }] }]}>
              {/* Spinner */}
              <View style={styles.spinnerContainer}>
                <Animated.View style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]} />
                <View style={styles.spinnerCenter}>
                  <Ionicons name="scan" size={32} color={COLORS.emerald} />
                </View>
              </View>

              {/* Processing text */}
              <View style={styles.processingTextRow}>
                <Text style={styles.processingText}>{processingText}</Text>
                <View style={styles.dotsRow}>
                  <Animated.Text style={[styles.dot, { opacity: dotOpacity1 }]}>.</Animated.Text>
                  <Animated.Text style={[styles.dot, { opacity: dotOpacity2 }]}>.</Animated.Text>
                  <Animated.Text style={[styles.dot, { opacity: dotOpacity3 }]}>.</Animated.Text>
                </View>
              </View>

              <Text style={styles.processingSubtext}>
                Analyzing scene with edge computing
              </Text>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </Animated.View>
          )}

          {screenState === STATE_SUCCESS && (
            <Animated.View style={[styles.stateContent, { transform: [{ scale: successScale }] }]}>
              {/* Pulse ring + checkmark */}
              <View style={styles.successIconWrap}>
                <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
                <Ionicons name="checkmark-circle" size={72} color={COLORS.emerald} />
              </View>

              <Text style={styles.successTitle}>Payload Transmitted</Text>
              <Text style={styles.successSubtitle}>to Commel</Text>

              <View style={styles.successDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.emerald} />
                  <Text style={styles.detailText}>AI Verified · Hazard Confirmed</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="cube" size={16} color={COLORS.emerald} />
                  <Text style={styles.detailText}>Payload: 1.7KB · Compressed</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={16} color={COLORS.emerald} />
                  <Text style={styles.detailText}>Latency: 240ms · Edge Node</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.returnButton} onPress={handleGoBack}>
                <Ionicons name="map" size={20} color={COLORS.white} />
                <Text style={styles.returnButtonText}>Return to Map</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F19',
  },

  // Camera as background — no children
  camera: {
    ...StyleSheet.absoluteFillObject,
  },

  // Flash
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    zIndex: 1000,
  },

  // ── Full-screen UI overlay on top of camera ──
  uiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: 'space-between',
  },

  // ── Permission ──
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

  // ── Top Controls ──
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

  // ── Viewfinder ──
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

  // ── Bottom Controls ──
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

  // ── Processing / Success Overlay ──
  stateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,15,25,0.92)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 900,
  },
  stateContent: {
    alignItems: 'center', paddingHorizontal: SPACING.xl,
  },

  // Processing
  spinnerContainer: {
    width: 100, height: 100,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  spinnerRing: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: 'transparent',
    borderTopColor: COLORS.emerald, borderRightColor: COLORS.emerald + '40',
  },
  spinnerCenter: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  processingTextRow: {
    flexDirection: 'row', alignItems: 'flex-end', marginBottom: 6,
  },
  processingText: {
    fontSize: 18, fontWeight: '700', color: COLORS.white, letterSpacing: 0.2,
  },
  dotsRow: { flexDirection: 'row', marginLeft: 2, marginBottom: 1 },
  dot: { fontSize: 18, fontWeight: '700', color: COLORS.emerald },
  processingSubtext: {
    fontSize: 13, color: COLORS.slate400, fontWeight: '500', marginBottom: SPACING.lg,
  },
  progressTrack: {
    width: 200, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
  },
  progressFill: {
    width: '60%', height: '100%', borderRadius: 2,
    backgroundColor: COLORS.emerald,
  },

  // Success
  successIconWrap: {
    width: 120, height: 120,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  pulseRing: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, borderColor: COLORS.emerald + '30',
  },
  successTitle: {
    fontSize: 24, fontWeight: '800', color: COLORS.white,
    letterSpacing: 0.3, marginBottom: 2,
  },
  successSubtitle: {
    fontSize: 16, fontWeight: '600', color: COLORS.emerald,
    marginBottom: SPACING.xl,
  },
  successDetails: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, gap: 12,
    marginBottom: SPACING.xl, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', width: width * 0.8,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { fontSize: 13, fontWeight: '600', color: COLORS.slate300 },
  returnButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.emerald,
    paddingVertical: 16, paddingHorizontal: 32,
    borderRadius: BORDER_RADIUS.full, gap: 10,
    ...SHADOWS.emerald,
  },
  returnButtonText: {
    fontSize: 16, fontWeight: '700', color: COLORS.white, letterSpacing: 0.3,
  },
});
