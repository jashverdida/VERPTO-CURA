import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Flow definitions
// ─────────────────────────────────────────────────────────────────────────────

const MEDICAL_FLOW = {
  start: {
    bot: "I'll help assess this medical emergency. What best describes the situation?",
    choices: [
      { label: 'Chest Pain / Heart Attack', next: 'conscious', tag: 'Chest Pain / Heart Attack' },
      { label: 'Difficulty Breathing', next: 'conscious', tag: 'Difficulty Breathing' },
      { label: 'Unconscious Person', next: 'breathing', tag: 'Unconscious Person' },
      { label: 'Severe Bleeding', next: 'bleeding', tag: 'Severe Bleeding' },
      { label: 'Stroke Symptoms', next: 'conscious', tag: 'Stroke Symptoms' },
      { label: 'Seizure / Convulsion', next: 'conscious', tag: 'Seizure / Convulsion' },
      { label: 'Trauma / Physical Injury', next: 'conscious', tag: 'Trauma / Physical Injury' },
    ],
  },
  conscious: {
    bot: 'Is the patient currently conscious and responsive?',
    choices: [
      { label: 'Yes, fully awake', next: 'age', tag: 'Conscious — fully awake' },
      { label: 'Partially responsive', next: 'age', tag: 'Partially responsive' },
      { label: 'Unresponsive / unconscious', next: 'breathing', tag: 'Unresponsive' },
    ],
  },
  breathing: {
    bot: 'Is the patient breathing?',
    choices: [
      { label: 'Yes, breathing normally', next: 'age', tag: 'Breathing normally' },
      { label: 'Labored / difficult breathing', next: 'age', tag: 'Labored breathing' },
      { label: 'Not breathing', next: 'age', tag: '⚠ NOT breathing — CPR needed' },
    ],
  },
  bleeding: {
    bot: 'How severe is the bleeding?',
    choices: [
      { label: 'Moderate — controllable', next: 'conscious', tag: 'Moderate bleeding' },
      { label: 'Severe — hard to control', next: 'conscious', tag: 'Severe bleeding' },
      { label: 'Life-threatening / arterial', next: 'conscious', tag: '⚠ Life-threatening bleed' },
    ],
  },
  age: {
    bot: 'Approximate age of the patient?',
    choices: [
      { label: 'Child (0–12 years)', next: 'count', tag: 'Patient: Child (0–12)' },
      { label: 'Teenager (13–17 years)', next: 'count', tag: 'Patient: Teenager (13–17)' },
      { label: 'Adult (18–60 years)', next: 'count', tag: 'Patient: Adult (18–60)' },
      { label: 'Elderly (60+ years)', next: 'count', tag: 'Patient: Elderly (60+)' },
    ],
  },
  count: {
    bot: 'How many patients are involved?',
    choices: [
      { label: '1 patient', next: 'help', tag: '1 patient' },
      { label: '2 to 5 patients', next: 'help', tag: '2–5 patients' },
      { label: 'More than 5', next: 'help', tag: 'More than 5 patients' },
    ],
  },
  help: {
    bot: 'Are trained first aiders or medical personnel currently on scene?',
    choices: [
      { label: 'Yes — medical help is present', next: 'done', tag: 'Medical help on scene' },
      { label: 'No — no medical help nearby', next: 'done', tag: 'No medical help' },
      { label: 'Unknown', next: 'done', tag: 'Unknown' },
    ],
  },
};

const HAZMAT_FLOW = {
  start: {
    bot: 'What type of hazardous material incident are you reporting?',
    choices: [
      { label: 'Chemical Spill', next: 'scale', tag: 'Chemical Spill' },
      { label: 'Gas Leak (LPG / Industrial)', next: 'gas_type', tag: 'Gas Leak' },
      { label: 'Toxic Smoke / Unknown Substance', next: 'area', tag: 'Toxic Smoke / Unknown Substance' },
      { label: 'Downed Electrical Wires', next: 'area', tag: 'Downed Electrical Wires' },
      { label: 'Explosion / Blast Risk', next: 'area', tag: 'Explosion / Blast Risk' },
      { label: 'Dangerous Road Hazard', next: 'road_type', tag: 'Dangerous Road Hazard' },
    ],
  },
  scale: {
    bot: 'What is the scale of the chemical spill?',
    choices: [
      { label: 'Small — contained area', next: 'danger', tag: 'Small spill (contained)' },
      { label: 'Medium — slowly spreading', next: 'danger', tag: 'Medium spill (spreading)' },
      { label: 'Large — uncontrolled spread', next: 'danger', tag: '⚠ Large spill (uncontrolled)' },
    ],
  },
  gas_type: {
    bot: 'What type of gas is leaking?',
    choices: [
      { label: 'LPG / Propane (household)', next: 'danger', tag: 'LPG / Propane leak' },
      { label: 'Industrial / factory gas', next: 'danger', tag: 'Industrial gas leak' },
      { label: 'Natural gas pipeline', next: 'danger', tag: 'Natural gas leak' },
      { label: 'Unknown / unidentified gas', next: 'danger', tag: 'Unknown gas type' },
    ],
  },
  area: {
    bot: 'What type of area is affected?',
    choices: [
      { label: 'Residential neighborhood', next: 'danger', tag: 'Residential area' },
      { label: 'Commercial / business district', next: 'danger', tag: 'Commercial area' },
      { label: 'Industrial zone', next: 'danger', tag: 'Industrial area' },
      { label: 'Open road / highway', next: 'danger', tag: 'Road / Highway' },
    ],
  },
  road_type: {
    bot: 'What type of road hazard?',
    choices: [
      { label: 'Fuel or chemical spill on road', next: 'danger', tag: 'Fuel/chemical spill on road' },
      { label: 'Large debris blocking road', next: 'danger', tag: 'Road debris' },
      { label: 'Sinkhole or road damage', next: 'danger', tag: 'Road structural damage' },
      { label: 'Other dangerous road condition', next: 'danger', tag: 'Other road hazard' },
    ],
  },
  danger: {
    bot: 'Are people currently in immediate danger or already affected?',
    choices: [
      { label: 'Yes — people are injured / affected', next: 'evacuated', tag: '⚠ People injured / affected' },
      { label: 'High risk — no injuries yet', next: 'evacuated', tag: 'High risk, no injuries yet' },
      { label: 'Unclear — I\'m keeping safe distance', next: 'evacuated', tag: 'Unclear — reporter at safe distance' },
    ],
  },
  evacuated: {
    bot: 'Has the immediate area been evacuated?',
    choices: [
      { label: 'Yes — area cleared', next: 'done', tag: 'Area evacuated' },
      { label: 'Partial — some people still nearby', next: 'done', tag: 'Partial evacuation' },
      { label: 'No — people still in the area', next: 'done', tag: '⚠ NOT evacuated' },
      { label: 'I\'m reporting from a safe distance', next: 'done', tag: 'Reporter at safe distance' },
    ],
  },
};

const SAR_FLOW = {
  start: {
    bot: 'What type of search & rescue situation are you reporting?',
    choices: [
      { label: 'Missing Person (wilderness / mountain)', next: 'missing_duration', tag: 'Missing Person' },
      { label: 'Flood Victim / Swept by Current', next: 'current_status', tag: 'Flood Victim' },
      { label: 'Drowning Incident', next: 'current_status', tag: 'Drowning Incident' },
      { label: 'Trapped in Structure / Collapse', next: 'count', tag: 'Trapped in Structure' },
      { label: 'Lost Hiker / Climber', next: 'missing_duration', tag: 'Lost Hiker / Climber' },
      { label: 'Other Rescue Situation', next: 'count', tag: 'Other Rescue' },
    ],
  },
  missing_duration: {
    bot: 'How long have they been missing or unreachable?',
    choices: [
      { label: 'Less than 1 hour', next: 'last_location', tag: 'Missing < 1 hour' },
      { label: '1 to 6 hours', next: 'last_location', tag: 'Missing 1–6 hours' },
      { label: '6 to 24 hours', next: 'last_location', tag: 'Missing 6–24 hours' },
      { label: 'More than 24 hours', next: 'last_location', tag: '⚠ Missing > 24 hours' },
      { label: 'Unknown duration', next: 'last_location', tag: 'Missing duration unknown' },
    ],
  },
  current_status: {
    bot: 'What is their current status?',
    choices: [
      { label: 'Still in water / danger zone', next: 'count', tag: '⚠ Still in danger zone' },
      { label: 'Partially rescued, needs help', next: 'count', tag: 'Partially rescued' },
      { label: 'Out of water but unresponsive', next: 'count', tag: 'Unresponsive (out of water)' },
      { label: 'Conscious but needs assistance', next: 'count', tag: 'Conscious, needs help' },
      { label: 'Unknown', next: 'count', tag: 'Status unknown' },
    ],
  },
  last_location: {
    bot: 'What was their last known location or general area?',
    choices: [
      { label: 'Mountain / hiking trail', next: 'count', tag: 'Last seen: Mountain / Trail' },
      { label: 'River or lake area', next: 'count', tag: 'Last seen: River / Lake' },
      { label: 'Coastal / beach / sea', next: 'count', tag: 'Last seen: Coastal area' },
      { label: 'Flood-affected area', next: 'count', tag: 'Last seen: Flood zone' },
      { label: 'Urban / city area', next: 'count', tag: 'Last seen: Urban area' },
      { label: 'Unknown', next: 'count', tag: 'Last location unknown' },
    ],
  },
  count: {
    bot: 'How many people need to be rescued?',
    choices: [
      { label: '1 person', next: 'vulnerable', tag: '1 person' },
      { label: '2 to 5 people', next: 'vulnerable', tag: '2–5 people' },
      { label: 'More than 5 people', next: 'vulnerable', tag: 'More than 5 people' },
      { label: 'Unknown', next: 'vulnerable', tag: 'Count unknown' },
    ],
  },
  vulnerable: {
    bot: 'Are there children, elderly, or injured among those needing rescue?',
    choices: [
      { label: 'Yes — children are involved', next: 'done', tag: 'Children present' },
      { label: 'Yes — elderly are involved', next: 'done', tag: 'Elderly present' },
      { label: 'Yes — there are injuries', next: 'done', tag: 'Injured persons present' },
      { label: 'No — all able-bodied adults', next: 'done', tag: 'All adults, no injuries' },
      { label: 'Unknown', next: 'done', tag: 'Condition unknown' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Config by type
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  medical: {
    title: 'Medical Triage',
    subtitle: 'CURA Medical Assessment',
    color: '#3B82F6',
    lightBg: '#EFF6FF',
    icon: 'medkit',
    flow: MEDICAL_FLOW,
    summaryTitle: 'Medical Emergency Report',
    hasPhoto: false,
  },
  hazmat: {
    title: 'HAZMAT Assessment',
    subtitle: 'Hazardous Materials Incident',
    color: '#8B5CF6',
    lightBg: '#F5F3FF',
    icon: 'flask',
    flow: HAZMAT_FLOW,
    summaryTitle: 'HAZMAT Incident Report',
    hasPhoto: true,
  },
  search_rescue: {
    title: 'Search & Rescue',
    subtitle: 'CURA S&R Assessment',
    color: '#14B8A6',
    lightBg: '#F0FDFA',
    icon: 'search',
    flow: SAR_FLOW,
    summaryTitle: 'Search & Rescue Report',
    hasPhoto: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Typing indicator dots
// ─────────────────────────────────────────────────────────────────────────────

function TypingIndicator({ color }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.stagger(160, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: -6, duration: 260, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0, duration: 260, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: -6, duration: 260, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 260, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: -6, duration: 260, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 260, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={[typingStyles.bubble, { borderColor: color + '30' }]}>
      {[dot1, dot2, dot3].map((anim, i) => (
        <Animated.View
          key={i}
          style={[typingStyles.dot, { backgroundColor: color, transform: [{ translateY: anim }] }]}
        />
      ))}
    </View>
  );
}

const typingStyles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    gap: 5,
    alignSelf: 'flex-start',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────

export default function TriageChatScreen({ navigation, route }) {
  const { type } = route.params;
  const config = TYPE_CONFIG[type];
  const { flow, color, lightBg, icon, summaryTitle, hasPhoto } = config;

  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('start');
  const [isTyping, setIsTyping] = useState(false);
  const [qaPairs, setQaPairs] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hazmatPhotoUri, setHazmatPhotoUri] = useState(null);

  const scrollRef = useRef(null);
  const animValues = useRef({});
  const submitScale = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.85)).current;

  // When Camera returns a photo for HAZMAT
  useEffect(() => {
    if (route.params?.photoUri) {
      setHazmatPhotoUri(route.params.photoUri);
    }
  }, [route.params?.photoUri]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, []);

  const addMessage = useCallback((msg) => {
    const id = (Date.now() + Math.random()).toString();
    const anim = new Animated.Value(0);
    animValues.current[id] = anim;
    setMessages(prev => [...prev, { ...msg, id }]);
    setTimeout(() => {
      Animated.spring(anim, {
        toValue: 1,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }).start();
    }, 30);
    scrollToBottom();
    return id;
  }, [scrollToBottom]);

  // Seed first bot message
  useEffect(() => {
    setTimeout(() => {
      addMessage({ from: 'bot', text: flow.start.bot });
    }, 400);
  }, []);

  const handleChoice = useCallback((choice) => {
    if (!currentStep) return;

    // Track Q&A
    const botQuestion = flow[currentStep].bot;
    setQaPairs(prev => [...prev, { q: botQuestion, a: choice.tag }]);

    // Show user bubble
    addMessage({ from: 'user', text: choice.label });
    setCurrentStep(null);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      if (choice.next === 'done') {
        setIsDone(true);
        addMessage({
          from: 'bot',
          text: "Assessment complete. Here's a summary ready to send to emergency responders:",
        });
      } else {
        const nextStepData = flow[choice.next];
        addMessage({ from: 'bot', text: nextStepData.bot });
        setCurrentStep(choice.next);
      }
      scrollToBottom();
    }, 900);
  }, [currentStep, flow, addMessage, scrollToBottom]);

  const handleSubmit = () => {
    Animated.sequence([
      Animated.timing(submitScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(submitScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    setIsSubmitted(true);
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Map' } }],
      });
    }, 2200);
  };

  const topPad = Platform.OS === 'ios' ? 54 : 44;
  const currentChoices = currentStep ? flow[currentStep]?.choices || [] : [];
  const totalSteps = Object.keys(flow).length;
  const answeredSteps = qaPairs.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: color }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconRow}>
            <View style={styles.headerIconWrap}>
              <Ionicons name={icon} size={16} color={color} />
            </View>
            <Text style={styles.headerSubtitle}>{config.subtitle}</Text>
          </View>
          <Text style={styles.headerTitle}>{config.title}</Text>
        </View>
        {/* Progress pill */}
        {!isDone && (
          <View style={styles.progressPill}>
            <Text style={styles.progressText}>
              {Math.min(answeredSteps + 1, totalSteps)}/{totalSteps}
            </Text>
          </View>
        )}
        {isDone && (
          <View style={[styles.progressPill, { backgroundColor: 'rgba(34,197,94,0.3)' }]}>
            <Ionicons name="checkmark" size={14} color="#22C55E" />
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarTrack}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: color,
              width: `${Math.min((answeredSteps / totalSteps) * 100, 100)}%`,
            },
          ]}
        />
      </View>

      {/* ── Chat area ── */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => {
          const anim = animValues.current[msg.id] || new Animated.Value(1);
          const isBot = msg.from === 'bot';

          return (
            <Animated.View
              key={msg.id}
              style={[
                styles.messageRow,
                isBot ? styles.botRow : styles.userRow,
                {
                  opacity: anim,
                  transform: [
                    {
                      translateX: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [isBot ? -18 : 18, 0],
                      }),
                    },
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.92, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {isBot && (
                <View style={[styles.botAvatar, { backgroundColor: color }]}>
                  <Ionicons name={icon} size={13} color={COLORS.white} />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  isBot
                    ? [styles.botBubble, { borderColor: color + '25' }]
                    : [styles.userBubble, { backgroundColor: color }],
                ]}
              >
                <Text style={[styles.bubbleText, isBot ? styles.botText : styles.userText]}>
                  {msg.text}
                </Text>
              </View>
            </Animated.View>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <View style={styles.botRow}>
            <View style={[styles.botAvatar, { backgroundColor: color }]}>
              <Ionicons name={icon} size={13} color={COLORS.white} />
            </View>
            <TypingIndicator color={color} />
          </View>
        )}

        {/* ── Summary card (when done) ── */}
        {isDone && (
          <View style={styles.summaryBlock}>
            {/* Summary card */}
            <View style={[styles.summaryCard, { borderColor: color + '30' }]}>
              <View style={[styles.summaryHeader, { backgroundColor: color + '12' }]}>
                <View style={[styles.summaryHeaderIcon, { backgroundColor: color }]}>
                  <Ionicons name={icon} size={16} color={COLORS.white} />
                </View>
                <Text style={[styles.summaryTitle, { color }]}>{summaryTitle}</Text>
              </View>

              {qaPairs.map((pair, i) => (
                <View key={i} style={[styles.summaryRow, i < qaPairs.length - 1 && styles.summaryRowBorder]}>
                  <Text style={styles.summaryQ} numberOfLines={2}>{pair.q}</Text>
                  <Text style={[styles.summaryA, { color }]}>{pair.a}</Text>
                </View>
              ))}
            </View>

            {/* HAZMAT optional photo */}
            {hasPhoto && (
              <View style={styles.hazmatPhotoSection}>
                {hazmatPhotoUri ? (
                  <View style={styles.hazmatPhotoPreview}>
                    <Image
                      source={{ uri: hazmatPhotoUri }}
                      style={styles.hazmatPhoto}
                      resizeMode="cover"
                    />
                    <View style={styles.hazmatPhotoOverlay}>
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                      <Text style={styles.hazmatPhotoOverlayText}>Photo attached</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.hazmatPhotoRemove}
                      onPress={() => setHazmatPhotoUri(null)}
                    >
                      <Ionicons name="close-circle" size={22} color="rgba(255,255,255,0.85)" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.hazmatPhotoBtn, { borderColor: color }]}
                    onPress={() => navigation.navigate('Camera', { forHazmat: true, type: 'hazmat' })}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera-outline" size={22} color={color} />
                    <View style={styles.hazmatPhotoTextBlock}>
                      <Text style={[styles.hazmatPhotoBtnLabel, { color }]}>Attach Photo</Text>
                      <Text style={styles.hazmatPhotoBtnSub}>Optional — helps responders assess the scene</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={color} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Submit button */}
            <Animated.View style={{ transform: [{ scale: submitScale }] }}>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: color }]}
                onPress={handleSubmit}
                activeOpacity={0.88}
              >
                <Ionicons name="send" size={20} color={COLORS.white} />
                <Text style={styles.submitBtnText}>Submit Emergency Report</Text>
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.submitDisclaimer}>
              This report will be immediately sent to emergency responders in your area.
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Choice buttons ── */}
      {!isDone && currentChoices.length > 0 && (
        <View style={styles.choicesContainer}>
          <View style={styles.choicesInner}>
            {currentChoices.map((choice, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.choiceBtn, { borderColor: color + '50' }]}
                onPress={() => handleChoice(choice)}
                activeOpacity={0.75}
              >
                <Text style={[styles.choiceBtnText, { color }]}>{choice.label}</Text>
                <Ionicons name="chevron-forward" size={14} color={color + '80'} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── Success overlay ── */}
      {isSubmitted && (
        <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <View style={[styles.successIconBg, { backgroundColor: color }]}>
              <Ionicons name="checkmark" size={42} color={COLORS.white} />
            </View>
            <Text style={styles.successTitle}>Report Submitted</Text>
            <Text style={styles.successSub}>Dispatching responders now</Text>
            <View style={styles.successRows}>
              <View style={styles.successRow}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.emerald} />
                <Text style={styles.successRowText}>Emergency services notified</Text>
              </View>
              <View style={styles.successRow}>
                <Ionicons name="people" size={14} color={COLORS.emerald} />
                <Text style={styles.successRowText}>Assessment forwarded to dispatch</Text>
              </View>
              <View style={styles.successRow}>
                <Ionicons name="time" size={14} color={COLORS.emerald} />
                <Text style={styles.successRowText}>Estimated ETA: 4–8 minutes</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  headerIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  progressPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
  },

  // Progress bar
  progressBarTrack: {
    height: 3,
    backgroundColor: COLORS.slate200,
  },
  progressBarFill: {
    height: 3,
    borderRadius: 2,
  },

  // Chat
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: width * 0.82,
  },
  botRow: {
    alignSelf: 'flex-start',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 2,
  },
  bubble: {
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    maxWidth: width * 0.72,
  },
  botBubble: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 6,
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  userBubble: {
    borderTopRightRadius: 6,
  },
  bubbleText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
  botText: {
    color: '#1E293B',
  },
  userText: {
    color: COLORS.white,
  },

  // Choices
  choicesContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.md,
  },
  choicesInner: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    gap: 7,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  choiceBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },

  // Summary
  summaryBlock: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  summaryHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  summaryRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  summaryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  summaryQ: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.slate500,
    marginBottom: 3,
  },
  summaryA: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },

  // HAZMAT photo
  hazmatPhotoSection: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  hazmatPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: SPACING.md,
    gap: SPACING.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  hazmatPhotoTextBlock: { flex: 1 },
  hazmatPhotoBtnLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  hazmatPhotoBtnSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate500,
    fontWeight: '500',
    marginTop: 2,
  },
  hazmatPhotoPreview: {
    height: 160,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  hazmatPhoto: {
    width: '100%',
    height: '100%',
  },
  hazmatPhotoOverlay: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  hazmatPhotoOverlayText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  hazmatPhotoRemove: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },

  // Submit
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    borderRadius: BORDER_RADIUS.xl,
    gap: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  submitBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  submitDisclaimer: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate400,
    fontWeight: '500',
    paddingHorizontal: SPACING.md,
  },

  // Success overlay
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    paddingHorizontal: SPACING.xl,
  },
  successCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: 4,
  },
  successSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.slate500,
    fontWeight: '500',
    marginBottom: SPACING.lg,
  },
  successRows: {
    backgroundColor: COLORS.slate50,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  successRowText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.slate700,
  },

  // shared
  emerald: { color: COLORS.emerald },
});
