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
  Image,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import ViewShot from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const STATE_CAMERA = 'camera';
const STATE_PROCESSING = 'processing';
const STATE_RESULTS = 'results';
const STATE_SUCCESS = 'success';

// ── Roboflow config ──
const ROBOFLOW_MODEL_ID       = 'cura-6kotu';
const ROBOFLOW_VERSION        = '1';
const ROBOFLOW_API_KEY        = 'HGdgmNOsXRO2ryF7dPpZ';
const CONFIDENCE_THRESHOLD    = 10;
const ALLOWED_CLASSES = {
  fire:    ['fire', 'smoke'],
  vehicle: ['car', 'car-accident'],
};

function buildEndpoint(emergencyType) {
  const classes = ALLOWED_CLASSES[emergencyType]?.join('%2C') ?? '';
  return `https://detect.roboflow.com/${ROBOFLOW_MODEL_ID}/${ROBOFLOW_VERSION}`
    + `?api_key=${ROBOFLOW_API_KEY}&confidence=${CONFIDENCE_THRESHOLD}&overlap=30`
    + (classes ? `&classes=${classes}` : '');
}

// ── Pure helpers ──
function rfLog(...args) {
  const ts = new Date().toLocaleString('en-PH', {
    month: '2-digit', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
  console.log(`[Roboflow ${ts}]`, ...args);
}

const MODEL_SIZE = 640;

function exifOrientationToRotation(orientation) {
  switch (orientation) {
    case 3: return 180;
    case 6: return 90;
    case 8: return 270;
    default: return 0;
  }
}

async function detectWithRoboflow(base64Image, emergencyType) {
  const cleanBase64 = base64Image.replace(/^data:[^;]+;base64,/, '');
  const response = await fetch(buildEndpoint(emergencyType), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: cleanBase64,
  });
  if (!response.ok) throw new Error(`Roboflow API error: ${response.status}`);
  return response.json();
}

function scaleBox(prediction, displaySize, nativeSize) {
  const scale   = Math.min(displaySize.width / nativeSize.width, displaySize.height / nativeSize.height);
  const offsetX = (displaySize.width  - nativeSize.width  * scale) / 2;
  const offsetY = (displaySize.height - nativeSize.height * scale) / 2;
  return {
    left:   (prediction.x - prediction.width  / 2) * scale + offsetX,
    top:    (prediction.y - prediction.height / 2) * scale + offsetY,
    width:  prediction.width  * scale,
    height: prediction.height * scale,
  };
}

function getClassColor(className) {
  const key = className?.toLowerCase();
  const map = {
    fire:           '#EF4444',
    smoke:          '#9CA3AF',
    'car-accident': '#EF4444',
    car:            '#22C55E',
  };
  return map[key] ?? COLORS.emerald;
}

export default function CameraScreen({ navigation, route }) {
  const emergencyType = route.params?.emergencyType ?? 'fire';

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [screenState, setScreenState] = useState(STATE_CAMERA);
  const [processingText, setProcessingText] = useState('');

  // Detection state
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: 0, height: 0 });
  const [imageNativeSize, setImageNativeSize]   = useState({ width: 640, height: 480 });
  const [detections, setDetections]             = useState([]);
  const [detectionError, setDetectionError]     = useState(null);
  const [apiStatus, setApiStatus]               = useState(null);
  // apiStatus shape: { predictionCount, topConfidence, responseTime } | null

  const cameraRef      = useRef(null);
  const phaseTimers    = useRef([]);
  const letterboxRef   = useRef(null);
  const [lbSource, setLbSource] = useState(null);

  const createLetterboxedImage = useCallback((uri, fitW, fitH) => {
    return new Promise(resolve => setLbSource({ uri, fitW, fitH, resolve }));
  }, []);

  const prepareImageForRoboflow = useCallback(async (uri, exif, origWidth, origHeight) => {
    const rotation = exifOrientationToRotation(exif?.Orientation);
    const [effW, effH] = rotation % 180 === 0
      ? [origWidth, origHeight]
      : [origHeight, origWidth];

    const scale = Math.min(MODEL_SIZE / effW, MODEL_SIZE / effH);
    const fitW  = Math.round(effW * scale);
    const fitH  = Math.round(effH * scale);

    const actions = [];
    if (rotation !== 0) actions.push({ rotate: rotation });
    actions.push({ resize: { width: fitW, height: fitH } });

    const resized = await ImageManipulator.manipulateAsync(
      uri, actions,
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );

    return createLetterboxedImage(resized.uri, fitW, fitH);
  }, [createLetterboxedImage]);

  // ── Animations ──
  const flashAnim    = useRef(new Animated.Value(0)).current;
  const captureScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide   = useRef(new Animated.Value(0)).current;
  const spinAnim     = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const dotOpacity1  = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2  = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3  = useRef(new Animated.Value(0.3)).current;

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

  const clearPhaseTimers = () => {
    phaseTimers.current.forEach(t => clearTimeout(t));
    phaseTimers.current = [];
  };

  // ── Shared: start processing overlay animations ──
  const startProcessingUI = (dotLoop) => {
    setScreenState(STATE_PROCESSING);
    setProcessingText('Uploading image to AI');

    clearPhaseTimers();
    phaseTimers.current.push(setTimeout(() => setProcessingText('Running object detection'), 1000));
    phaseTimers.current.push(setTimeout(() => setProcessingText('Analyzing predictions'), 2000));

    overlayOpacity.setValue(0);
    Animated.timing(overlayOpacity, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start();

    contentSlide.setValue(40);
    Animated.spring(contentSlide, {
      toValue: 0, friction: 8, tension: 60, useNativeDriver: true,
    }).start();

    spinAnim.setValue(0);
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true,
      })
    ).start();

    dotLoop.current = animateDots();
  };

  // ── Shared: call Roboflow and transition to results ──
  const runDetection = async (uri, base64, dotLoop) => {
    rfLog('Sending image...');
    rfLog('Base64 start:', base64.substring(0, 60));
    const t0 = Date.now();
    try {
      const result = await detectWithRoboflow(base64, emergencyType);
      const responseTime  = Date.now() - t0;
      rfLog('Raw predictions:', JSON.stringify(result.predictions ?? []));
      const allowed     = ALLOWED_CLASSES[emergencyType] ?? [];
      const predictions = (result.predictions ?? []).filter(p =>
        allowed.some(c => c.toLowerCase() === p.class?.toLowerCase())
      );
      const topConfidence = predictions.length
        ? Math.round(Math.max(...predictions.map(p => p.confidence)) * 100)
        : null;

      rfLog(`Full response (${responseTime}ms):`, JSON.stringify(result, null, 2));
      rfLog(`${predictions.length} prediction(s) found. Top confidence: ${topConfidence ?? '—'}%`);

      clearPhaseTimers();
      dotLoop.current && dotLoop.current.stop();
      spinAnim.stopAnimation();
      setCapturedImageUri(`data:image/jpeg;base64,${base64}`);
      setImageNativeSize({ width: result.image?.width ?? 640, height: result.image?.height ?? 480 });
      setDetections(predictions);
      setDetectionError(null);
      setApiStatus({ predictionCount: predictions.length, topConfidence, responseTime });
    } catch (e) {
      const responseTime = Date.now() - t0;
      rfLog(`ERROR (${responseTime}ms):`, e.message);

      clearPhaseTimers();
      dotLoop.current && dotLoop.current.stop();
      spinAnim.stopAnimation();
      setCapturedImageUri(uri);
      setDetections([]);
      setDetectionError('Could not reach detection service. You can still confirm manually.');
      setApiStatus({ predictionCount: 0, topConfidence: null, responseTime, error: e.message });
    }
    setScreenState(STATE_RESULTS);
  };

  // ── Actions ──
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleCapture = async () => {
    if (screenState !== STATE_CAMERA) return;

    // Tactile press animation
    Animated.sequence([
      Animated.timing(captureScale, { toValue: 0.82, duration: 80, useNativeDriver: true }),
      Animated.timing(captureScale, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();

    // Flash
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 50,  useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    let photo;
    try {
      photo = await cameraRef.current.takePictureAsync({ quality: 1, exif: true });
    } catch (e) {
      Alert.alert('Capture Failed', 'Could not take photo. Please try again.');
      return;
    }

    const dotLoop = { current: null };
    startProcessingUI(dotLoop);
    const preparedBase64 = await prepareImageForRoboflow(photo.uri, photo.exif, photo.width, photo.height);
    await runDetection(photo.uri, preparedBase64, dotLoop);
  };

  const handleGallery = async () => {
    if (screenState !== STATE_CAMERA) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'CURA needs access to your photo library to select incident images.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      exif: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    rfLog('Gallery image:', asset.width, 'x', asset.height, '| mimeType:', asset.mimeType);
    const preparedBase64 = await prepareImageForRoboflow(asset.uri, asset.exif, asset.width, asset.height);
    rfLog('Converted to JPEG 640px (EXIF corrected). Base64 start:', preparedBase64.substring(0, 60));
    const dotLoop = { current: null };
    startProcessingUI(dotLoop);
    await runDetection(asset.uri, preparedBase64, dotLoop);
  };

  const handleRetake = () => {
    clearPhaseTimers();
    setCapturedImageUri(null);
    setDetections([]);
    setDetectionError(null);
    setApiStatus(null);
    setImageDisplaySize({ width: 0, height: 0 });
    setImageNativeSize({ width: 640, height: 480 });
    overlayOpacity.setValue(0);
    spinAnim.setValue(0);
    setScreenState(STATE_CAMERA);
  };

  const handleConfirm = () => {
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
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // ── Render ──
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera as background layer */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      {/* Flash Overlay */}
      <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} pointerEvents="none" />

      {/* ── Camera State ── */}
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
              <View style={styles.pill}>
                <Ionicons name="wifi" size={16} color={COLORS.warning} />
                <Text style={styles.pillText}>Strong internet required</Text>
              </View>
            </View>

            {/* Capture Row */}
            <View style={styles.captureRow}>
              <TouchableOpacity style={styles.sideButton} onPress={handleGallery}>
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

            <Text style={styles.captureLabel}>Tap to Capture · Gallery</Text>
          </View>
        </View>
      )}

      {/* ── Processing Overlay ── */}
      {screenState === STATE_PROCESSING && (
        <Animated.View style={[styles.stateOverlay, { opacity: overlayOpacity }]}>
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
              Sending to Roboflow detection API
            </Text>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {/* ── Results State ── */}
      {screenState === STATE_RESULTS && (
        <View style={styles.resultsOverlay}>
          {/* Top bar */}
          <View style={styles.resultsTopBar}>
            <TouchableOpacity style={styles.topButton} onPress={handleRetake}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.resultsTitleText}>Detection Results</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Image + bounding boxes */}
          <View
            style={styles.imageContainer}
            onLayout={(e) => {
              const { width: w, height: h } = e.nativeEvent.layout;
              setImageDisplaySize({ width: w, height: h });
            }}
          >
            {capturedImageUri && (
              <Image
                source={{ uri: capturedImageUri }}
                style={styles.capturedImage}
                resizeMode="contain"
              />
            )}

            {imageDisplaySize.width > 0 && detections.map((det, index) => {
              const box = scaleBox(det, imageDisplaySize, imageNativeSize);
              const color = getClassColor(det.class);
              return (
                <View
                  key={index}
                  style={[styles.boundingBox, {
                    left: box.left, top: box.top,
                    width: box.width, height: box.height,
                    borderColor: color,
                  }]}
                />
              );
            })}
          </View>

          {/* AI Status Card */}
          {(() => {
            const statusDotColor = detectionError
              ? COLORS.fireRed
              : apiStatus?.predictionCount > 0 ? COLORS.emerald : COLORS.warning;
            const statusLabel = detectionError ? 'Error' : 'Completed';
            return (
              <View style={styles.aiStatusCard}>
                <View style={styles.aiStatusHeader}>
                  <Ionicons name="analytics" size={15} color={COLORS.emerald} />
                  <Text style={styles.aiStatusTitle}>AI Detection Report</Text>
                </View>
                <View style={styles.aiStatusDivider} />

                <View style={styles.aiStatusRow}>
                  <Text style={styles.aiStatusLabel}>Status</Text>
                  <View style={styles.aiStatusValueRow}>
                    <View style={[styles.statusDot, { backgroundColor: statusDotColor }]} />
                    <Text style={[styles.aiStatusValue, { color: statusDotColor }]}>{statusLabel}</Text>
                  </View>
                </View>
                <View style={styles.aiStatusRow}>
                  <Text style={styles.aiStatusLabel}>Predictions</Text>
                  <Text style={styles.aiStatusValue}>
                    {detectionError ? '—' : `${apiStatus?.predictionCount ?? 0} found`}
                  </Text>
                </View>
                <View style={styles.aiStatusRow}>
                  <Text style={styles.aiStatusLabel}>Top confidence</Text>
                  <Text style={styles.aiStatusValue}>
                    {apiStatus?.topConfidence != null ? `${apiStatus.topConfidence}%` : '—'}
                  </Text>
                </View>
                <View style={styles.aiStatusRow}>
                  <Text style={styles.aiStatusLabel}>Response time</Text>
                  <Text style={styles.aiStatusValue}>
                    {apiStatus?.responseTime != null ? `${apiStatus.responseTime}ms` : '—'}
                  </Text>
                </View>
                <View style={styles.aiStatusRow}>
                  <Text style={styles.aiStatusLabel}>Threshold</Text>
                  <Text style={styles.aiStatusValue}>≥{CONFIDENCE_THRESHOLD}% confidence</Text>
                </View>

                {(detectionError || (!detectionError && detections.length === 0)) && (
                  <View style={styles.aiStatusNote}>
                    <Ionicons
                      name={detectionError ? 'warning-outline' : 'search-outline'}
                      size={13}
                      color={detectionError ? COLORS.warning : COLORS.slate400}
                    />
                    <Text style={styles.aiStatusNoteText}>
                      {detectionError
                        ?? 'No hazards detected above 30% confidence. Try a clearer, closer photo.'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })()}

          {/* Top detection per class */}
          {detections.length > 0 && (() => {
            const byClass = detections.reduce((acc, det) => {
              const key = det.class?.toLowerCase();
              if (!acc[key] || det.confidence > acc[key].confidence) acc[key] = det;
              return acc;
            }, {});
            return (
              <View style={[styles.detectionSummary, { justifyContent: 'center' }]}>
                {Object.values(byClass).map((det, i) => {
                  const color = getClassColor(det.class);
                  return (
                    <View key={i} style={[styles.detectionPill, { borderColor: color }]}>
                      <View style={[styles.pillDot, { backgroundColor: color }]} />
                      <Text style={styles.detPillLabel}>{det.class.toUpperCase()}</Text>
                      <Text style={styles.detPillConfidence}>{Math.round(det.confidence * 100)}%</Text>
                    </View>
                  );
                })}
              </View>
            );
          })()}

          {/* Confirm button */}
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
            <Text style={styles.confirmButtonText}>Confirm Report</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Success State ── */}
      {screenState === STATE_SUCCESS && (
        <Animated.View style={[styles.stateOverlay, { opacity: overlayOpacity }]}>
          <Animated.View style={[styles.stateContent, { transform: [{ scale: successScale }] }]}>
            {/* Pulse ring + checkmark */}
            <View style={styles.successIconWrap}>
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
              <Ionicons name="checkmark-circle" size={72} color={COLORS.emerald} />
            </View>

            <Text style={styles.successTitle}>Payload Transmitted</Text>
            <Text style={styles.successSubtitle}>to Commel</Text>

            <View style={styles.successDetails}>
              {(() => {
                const HAZARD_CLASSES = ['fire', 'smoke', 'car-accident'];
                const hazards = [...new Set(
                  detections
                    .filter(d => HAZARD_CLASSES.includes(d.class?.toLowerCase()))
                    .map(d => d.class?.toUpperCase())
                )];
                return (
                  <>
                    <View style={styles.detailRow}>
                      <Ionicons name="shield-checkmark" size={16} color={COLORS.emerald} />
                      <Text style={styles.detailText}>
                        {hazards.length > 0
                          ? `AI Verified · ${hazards.length} Hazard(s) Found`
                          : 'AI Verified · Manual Confirmation'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="scan" size={16} color={COLORS.emerald} />
                      <Text style={styles.detailText}>
                        {hazards.length > 0 ? hazards.join(', ') : 'No hazards detected'}
                      </Text>
                    </View>
                  </>
                );
              })()}
              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.emerald} />
                <Text style={styles.detailText}>Report Confirmed</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.returnButton} onPress={handleGoBack}>
              <Ionicons name="map" size={20} color={COLORS.white} />
              <Text style={styles.returnButtonText}>Return to Map</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {/* ── Hidden letterbox canvas for 640×640 preprocessing ── */}
      <ViewShot
        ref={letterboxRef}
        style={{ position: 'absolute', top: -1280, left: -1280, width: 640, height: 640 }}
        options={{ format: 'jpg', quality: 0.9, result: 'base64' }}
      >
        <View style={{ width: 640, height: 640, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
          {lbSource && (
            <Image
              source={{ uri: lbSource.uri }}
              style={{ width: lbSource.fitW, height: lbSource.fitH }}
              onLoad={() => {
                letterboxRef.current.capture().then(b64 => {
                  lbSource.resolve(b64);
                  setLbSource(null);
                });
              }}
            />
          )}
        </View>
      </ViewShot>
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
    gap: SPACING.sm, marginBottom: SPACING.lg,
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

  // ── Results State ──
  resultsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0F19',
    zIndex: 900,
  },
  resultsTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  resultsTitleText: {
    fontSize: 16, fontWeight: '700', color: COLORS.white, letterSpacing: 0.3,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
  },
  boxLabel: {
    position: 'absolute',
    top: -22,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  boxLabelText: {
    fontSize: 11, fontWeight: '700', color: COLORS.white, textTransform: 'capitalize',
  },
  // AI Status Card
  aiStatusCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  aiStatusHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  aiStatusTitle: { fontSize: 13, fontWeight: '700', color: COLORS.emerald, letterSpacing: 0.3 },
  aiStatusDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: SPACING.sm },
  aiStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  aiStatusLabel: { fontSize: 12, color: COLORS.slate400, fontWeight: '500' },
  aiStatusValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiStatusValue: { fontSize: 12, color: COLORS.white, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  aiStatusNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginTop: SPACING.sm, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  aiStatusNoteText: { fontSize: 11, color: COLORS.slate400, fontWeight: '500', flex: 1, lineHeight: 16 },
  detectionSummary: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  detectionPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 5,
    borderWidth: 1, gap: 5,
  },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  detPillLabel: {
    fontSize: 12, fontWeight: '700', color: COLORS.white, textTransform: 'capitalize',
  },
  detPillConfidence: {
    fontSize: 11, fontWeight: '600', color: COLORS.slate400,
  },
  confirmButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.emerald,
    marginHorizontal: SPACING.md,
    marginBottom: Platform.OS === 'ios' ? 50 : 30,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.full,
    gap: 10,
    ...SHADOWS.emerald,
  },
  confirmButtonText: {
    fontSize: 16, fontWeight: '700', color: COLORS.white, letterSpacing: 0.3,
  },
});
