import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
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
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import { Asset } from 'expo-asset';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { NitroModules } from 'react-native-nitro-modules';
import Reanimated, { useSharedValue, useAnimatedStyle, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { decodeDetections } from '../ml/detectFrame';

const { width, height } = Dimensions.get('window');

const STATE_CAMERA = 'camera';
const STATE_PROCESSING = 'processing';
const STATE_RESULTS = 'results';

// ── AI Backend config ──
const AI_BACKEND_URL       = 'http://192.168.1.6:8000/detect';
const CONFIDENCE_THRESHOLD = 10;
const ALLOWED_CLASSES = {
  fire:    ['FIRE', 'SMOKE'],
  vehicle: ['CAR', 'CAR-ACCIDENT', 'MOTORCYCLE-ACCIDENT'],
};
const HAZARD_CLASSES = ['CAR-ACCIDENT', 'MOTORCYCLE-ACCIDENT', 'FIRE', 'SMOKE'];

// ── Pure helpers ──
function rfLog(...args) {
  const ts = new Date().toLocaleString('en-PH', {
    month: '2-digit', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
  console.log(`[AI Backend ${ts}]`, ...args);
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

// Maps vision-camera's string Orientation to the same numeric EXIF codes
// exifOrientationToRotation already understands, so prepareImage() can stay
// unchanged for both the live-camera and gallery-picker call sites.
function vcOrientationToExif(orientation) {
  switch (orientation) {
    case 'landscape-left': return 6;
    case 'portrait-upside-down': return 3;
    case 'landscape-right': return 8;
    default: return 1;
  }
}

async function detectWithBackend(base64Image, emergencyType) {
  const cleanBase64 = base64Image.replace(/^data:[^;]+;base64,/, '');
  const response = await fetch(
    `${AI_BACKEND_URL}?confidence=${CONFIDENCE_THRESHOLD / 100}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: cleanBase64 }),
    }
  );
  if (!response.ok) throw new Error(`AI backend error: ${response.status}`);
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

// Worklet-safe copy of getClassColor (runs on the UI thread inside the
// animated style); hex literals only so nothing external needs capturing.
function liveColorFor(className) {
  'worklet';
  const key = className ? className.toLowerCase() : '';
  if (key === 'fire' || key === 'car-accident' || key === 'motorcycle-accident') return '#EF4444';
  if (key === 'smoke') return '#9CA3AF';
  if (key === 'car') return '#22C55E';
  return '#10B981';
}

// Max simultaneous live boxes. Rules of hooks require a fixed pool, so we
// render this many and hide the unused ones via opacity.
const MAX_LIVE_BOXES = 10;

// One animated bounding box, driven entirely from the liveDetections shared
// value on the UI thread (no React re-render per frame).
function LiveBox({ index, liveDetections, previewW, previewH }) {
  const animatedStyle = useAnimatedStyle(() => {
    const det = liveDetections.value[index];
    if (det == null) return { opacity: 0, width: 0, height: 0 };
    // The model sees a centre-crop square (MODEL_SIZE x MODEL_SIZE) of the
    // camera frame. For a portrait cover-fill preview, map that square to a
    // centred square spanning the full preview width. The exact crop +
    // sensor-rotation mapping needs on-device calibration — the emulator
    // camera is synthetic, so boxes are approximate until tested on hardware.
    const scale = previewW / MODEL_SIZE;
    const offsetY = (previewH - previewW) / 2;
    return {
      opacity: 1,
      left:   (det.x - det.width  / 2) * scale,
      top:    (det.y - det.height / 2) * scale + offsetY,
      width:  det.width  * scale,
      height: det.height * scale,
      borderColor: liveColorFor(det.class),
    };
  });
  return <Reanimated.View pointerEvents="none" style={[styles.boundingBox, animatedStyle]} />;
}

// Continuous overlay shown while aiming. Boxes update every frame on the UI
// thread; the text legend is throttled to ~3x/sec via a shared timestamp so
// it doesn't drive a React re-render on every frame.
function LiveDetectionOverlay({ liveDetections, previewW, previewH }) {
  const [legend, setLegend] = useState([]);
  const lastLegendAt = useSharedValue(0);

  useAnimatedReaction(
    () => liveDetections.value,
    (dets) => {
      const now = Date.now();
      if (now - lastLegendAt.value < 300) return;
      lastLegendAt.value = now;
      // Highest-confidence entry per class, built without Object.values/keys
      // since those builtins aren't guaranteed in the worklet runtime.
      const seen = {};
      const result = [];
      for (let i = 0; i < dets.length; i++) {
        const d = dets[i];
        const k = d.class;
        if (seen[k] === undefined) {
          seen[k] = result.length;
          result.push({ class: d.class, confidence: d.confidence });
        } else if (d.confidence > result[seen[k]].confidence) {
          result[seen[k]] = { class: d.class, confidence: d.confidence };
        }
      }
      runOnJS(setLegend)(result);
    },
    []
  );

  const boxes = [];
  for (let i = 0; i < MAX_LIVE_BOXES; i++) {
    boxes.push(
      <LiveBox key={i} index={i} liveDetections={liveDetections} previewW={previewW} previewH={previewH} />
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {boxes}
      {legend.length > 0 && (
        <View style={styles.liveLegend}>
          {legend.map((det, i) => {
            const color = getClassColor(det.class);
            return (
              <View key={i} style={[styles.detectionPill, { borderColor: color, backgroundColor: 'rgba(0,0,0,0.55)' }]}>
                <View style={[styles.pillDot, { backgroundColor: color }]} />
                <Text style={styles.detPillLabel}>{det.class.toUpperCase()}</Text>
                <Text style={styles.detPillConfidence}>{Math.round(det.confidence * 100)}%</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function CameraScreen({ navigation, route }) {
  const emergencyType = route.params?.emergencyType ?? 'fire';

  const [facing, setFacing] = useState('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(facing);
  const [screenState, setScreenState] = useState(STATE_CAMERA);
  const [processingText, setProcessingText] = useState('');
  const [torchOn, setTorchOn] = useState(false);

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

  // ── Live on-device detection (Edge AI) ──
  // Load from a local file URI (via expo-asset) rather than passing require()
  // straight to fast-tflite: the 36 MB model otherwise streams over Metro's
  // dev HTTP server on every launch, which is slow and drops mid-transfer on
  // flaky networks ("unexpected end of stream"). expo-asset downloads it to
  // disk once and caches it; in a production build localUri is already local.
  const [model, setModel] = useState(undefined);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const asset = Asset.fromModule(require('../assets/models/cura_yolo11s.tflite'));
        if (!asset.localUri) await asset.downloadAsync();
        const loaded = await loadTensorflowModel({ url: asset.localUri ?? asset.uri });
        if (!cancelled) setModel(loaded);
      } catch (e) {
        rfLog('On-device model load failed:', e?.message ?? String(e));
      }
    })();
    return () => { cancelled = true; };
  }, []);
  // TfliteModel is a Nitro HybridObject; vision-camera v4's worklet runtime
  // can't access it directly, so it's boxed here and unboxed inside the
  // frame processor — see fast-tflite's VisionCamera integration docs.
  const boxedModel = useMemo(() => (model != null ? NitroModules.box(model) : undefined), [model]);
  const { resize } = useResizePlugin();
  const liveDetections = useSharedValue([]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (boxedModel == null) return;
    const tflite = boxedModel.unbox();

    const resized = resize(frame, {
      scale: { width: MODEL_SIZE, height: MODEL_SIZE },
      pixelFormat: 'rgb',
      dataType: 'float32',
    });
    const inputBuffer = resized.buffer.slice(resized.byteOffset, resized.byteOffset + resized.byteLength);

    const outputs = tflite.runSync([inputBuffer]);
    const output = new Float32Array(outputs[0]);
    liveDetections.value = decodeDetections(output, CONFIDENCE_THRESHOLD / 100);
  }, [boxedModel]);

  const prepareImage = useCallback(async (uri, exif, origWidth, origHeight) => {
    const rotation = exifOrientationToRotation(exif?.Orientation);

    // Send raw image — only correct EXIF rotation, no resizing
    // YOLO11 handles letterboxing internally on the server
    const actions = [];
    if (rotation !== 0) actions.push({ rotate: rotation });

    const resized = await ImageManipulator.manipulateAsync(
      uri, actions,
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    return resized.base64;
  }, []);

  // ── Animations ──
  const flashAnim    = useRef(new Animated.Value(0)).current;
  const captureScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide   = useRef(new Animated.Value(0)).current;
  const spinAnim     = useRef(new Animated.Value(0)).current;
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

  // ── Permission screen ──
  if (!hasPermission) {
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
  const runDetection = async (displayUri, base64, dotLoop) => {
    const uri = displayUri;
    rfLog('Sending image...');
    rfLog('Base64 start:', base64.substring(0, 60));
    const t0 = Date.now();
    try {
      const result = await detectWithBackend(base64, emergencyType);
      const responseTime  = Date.now() - t0;
      rfLog('Raw predictions:', JSON.stringify(result.predictions ?? []));
      const allowed     = ALLOWED_CLASSES[emergencyType] ?? [];
      const predictions = (result.predictions ?? []).filter(p =>
        p.class && p.class !== 'null' &&
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
      setCapturedImageUri(uri);
      setImageNativeSize({ width: result.image?.width ?? 640, height: result.image?.height ?? 480 });
      setDetections(predictions);
      setDetectionError(null);
      setApiStatus({ predictionCount: predictions.length, topConfidence, responseTime });
    } catch (e) {
      const responseTime = Date.now() - t0;
      rfLog(`Backend unreachable (${responseTime}ms):`, e.message, '— falling back to on-device Edge AI');

      // Hybrid fallback: when the API can't be reached (e.g. zero
      // connectivity), use the on-device detections already computed live
      // from the camera frames. Detection still works fully offline.
      // These boxes are in the model's 640x640 centre-crop reference frame,
      // so alignment over the full captured photo is approximate.
      const allowed = ALLOWED_CLASSES[emergencyType] ?? [];
      const live = (liveDetections.value ?? []).filter(p =>
        p.class && allowed.some(c => c.toLowerCase() === p.class?.toLowerCase())
      );
      const topConfidence = live.length
        ? Math.round(Math.max(...live.map(p => p.confidence)) * 100)
        : null;
      rfLog(`On-device fallback: ${live.length} detection(s). Top: ${topConfidence ?? '—'}%`);

      clearPhaseTimers();
      dotLoop.current && dotLoop.current.stop();
      spinAnim.stopAnimation();
      setCapturedImageUri(uri);
      setImageNativeSize({ width: MODEL_SIZE, height: MODEL_SIZE });
      setDetections(live);
      setDetectionError(
        live.length ? null : 'Could not reach detection service. You can still confirm manually.'
      );
      setApiStatus({ predictionCount: live.length, topConfidence, responseTime, onDevice: true, error: e.message });
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
      photo = await cameraRef.current.takePhoto();
    } catch (e) {
      Alert.alert('Capture Failed', 'Could not take photo. Please try again.');
      return;
    }

    const photoUri = `file://${photo.path}`;
    const exif = { Orientation: vcOrientationToExif(photo.orientation) };

    const dotLoop = { current: null };
    startProcessingUI(dotLoop);
    const preparedBase64 = await prepareImage(photoUri, exif, photo.width, photo.height);
    await runDetection(photoUri, preparedBase64, dotLoop);
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
    const preparedBase64 = await prepareImage(asset.uri, asset.exif, asset.width, asset.height);
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
    navigation.navigate('LocationPicker', {
      mode:             'camera',
      emergencyType,
      capturedImageUri,
      detections,
      apiStatus,
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // ── Render ──
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera fills container; vision-camera doesn't accept children, so the
          UI overlay below is a sibling instead of nested inside it */}
      {device != null && (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={screenState === STATE_CAMERA}
          photo={true}
          torch={torchOn ? 'on' : 'off'}
          frameProcessor={frameProcessor}
        />
      )}

      {/* Live on-device detection overlay (boxes + legend) */}
      {screenState === STATE_CAMERA && (
        <LiveDetectionOverlay liveDetections={liveDetections} previewW={width} previewH={height} />
      )}

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

              <TouchableOpacity style={styles.sideButton} onPress={() => setTorchOn(prev => !prev)}>
                <Ionicons name={torchOn ? "flash" : "flash-off"} size={24} color={torchOn ? COLORS.warning : COLORS.white} />
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

            {imageDisplaySize.width > 0 && detections.map((det, i) => {
              const box = scaleBox(det, imageDisplaySize, imageNativeSize);
              const color = getClassColor(det.class);
              return (
                <View
                  key={i}
                  style={[styles.boundingBox, {
                    left: box.left, top: box.top,
                    width: box.width, height: box.height,
                    borderColor: color,
                  }]}
                />
              );
            })}
          </View>

          {/* Error notice only — AI Status Card removed */}
          {detectionError && (
            <View style={styles.aiStatusCard}>
              <View style={styles.aiStatusNote}>
                <Ionicons name="warning-outline" size={13} color={COLORS.warning} />
                <Text style={styles.aiStatusNoteText}>{detectionError}</Text>
              </View>
            </View>
          )}

          {/* Detection legend / no detection message */}
          {(() => {
            const hasHazard = detections.some(d =>
              HAZARD_CLASSES.includes(d.class?.toUpperCase())
            );
            const byClass = detections.reduce((acc, det) => {
              const key = det.class?.toLowerCase();
              if (!acc[key] || det.confidence > acc[key].confidence) acc[key] = det;
              return acc;
            }, {});

            // No detections at all
            if (detections.length === 0) {
              const label = emergencyType === 'fire'
                ? 'No fire or smoke detected'
                : 'No accident detected';
              return (
                <View style={[styles.detectionSummary, { justifyContent: 'center' }]}>
                  <View style={[styles.detectionPill, { borderColor: COLORS.slate400 }]}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.slate400} />
                    <Text style={[styles.detPillLabel, { color: COLORS.slate400, marginLeft: 4 }]}>
                      {label}
                    </Text>
                  </View>
                </View>
              );
            }

            // Only CAR detected — no actual accident
            if (emergencyType === 'vehicle' && !hasHazard) {
              return (
                <View style={[styles.detectionSummary, { justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 6 }]}>
                  <View style={[styles.detectionPill, { borderColor: COLORS.slate400 }]}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.slate400} />
                    <Text style={[styles.detPillLabel, { color: COLORS.slate400, marginLeft: 4 }]}>
                      No accident detected
                    </Text>
                  </View>
                  <View style={[styles.detectionPill, { borderColor: getClassColor('car') }]}>
                    <View style={[styles.pillDot, { backgroundColor: getClassColor('car') }]} />
                    <Text style={styles.detPillLabel}>CAR</Text>
                    <Text style={styles.detPillConfidence}>{Math.round(byClass['car'].confidence * 100)}%</Text>
                  </View>
                </View>
              );
            }

            // Hazard detected — show all class pills with highest confidence
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


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F19',
  },

  camera: {
    flex: 1,
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
    justifyContent: 'center', alignItems: 'center',
    width: '100%',
  },
  liveLegend: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 96,
    left: 0, right: 0,
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
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
