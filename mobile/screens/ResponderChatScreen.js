import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, Animated, Platform, StatusBar, KeyboardAvoidingView,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

/* ── Contact definitions ─────────────────────────────────────────────────── */
const CONTACTS = [
  { id: 1, name: 'Command Center',    short: 'CMD', status: 'online',  color: '#10B981', isEscTarget: false },
  { id: 2, name: 'VECO Substation B', short: 'VCO', status: 'online',  color: '#F59E0B', isEscTarget: true  },
  { id: 3, name: 'DRRMO Dispatch',    short: 'DRR', status: 'online',  color: '#3B82F6', isEscTarget: false },
  { id: 4, name: 'Ambulance Alpha',   short: 'AMB', status: 'online',  color: '#10B981', isEscTarget: false },
  { id: 5, name: 'PNP Mabolo',        short: 'PNP', status: 'offline', color: '#94A3B8', isEscTarget: false },
  { id: 6, name: 'BFP Station 7',     short: 'BFP', status: 'online',  color: '#EF4444', isEscTarget: false },
];

/* ── Initial message threads ─────────────────────────────────────────────── */
const INITIAL_MESSAGES = {
  1: [
    { id: 1, sender: 'them', name: 'Command Center',
      text: 'FR-001, you are dispatched to VECO Substation B — Escario Street. Transformer fire, Code 3. Lights and sirens. Report ETA.',
      time: '09:30' },
    { id: 2, sender: 'me', name: 'FR-001 (Me)',
      text: 'Acknowledged Command. FR-001 en route via Escario Street. ETA approximately 4 minutes.',
      time: '09:31' },
    { id: 3, sender: 'them', name: 'Command Center',
      text: '2 injured personnel confirmed on-site. VECO suppression team pulling back from Unit 3-B. Proceed with full PPE. Code 3 confirmed.',
      time: '09:32' },
    { id: 4, sender: 'me', name: 'FR-001 (Me)',
      text: 'Copy that. Full PPE deployed. Medical kit on board. Will report on arrival.',
      time: '09:33' },
  ],
  2: [
    { id: 1, sender: 'them', name: 'VECO Substation B',
      text: 'BFP unit — fire has breached secondary containment at Unit 3-B. 2 personnel with burns. Requesting immediate backup.',
      time: '09:41' },
    { id: 2, sender: 'me', name: 'FR-001 (Me)',
      text: 'VECO, copy. FR-001 is 2 minutes out. Ensure all non-essential personnel at safe perimeter.',
      time: '09:42' },
    { id: 3, sender: 'them', name: 'VECO Substation B',
      text: 'Copy FR-001. Fire is spreading to Unit 4. We need you here NOW.',
      time: '09:44' },
  ],
  3: [
    { id: 1, sender: 'them', name: 'DRRMO Dispatch',
      text: 'BFP unit, DRRMO requesting situational update on Substation B for EOC briefing.',
      time: '09:38' },
    { id: 2, sender: 'them', name: 'DRRMO Dispatch',
      text: 'Please confirm current status and any civilian casualties.',
      time: '09:39' },
  ],
  4: [
    { id: 1, sender: 'them', name: 'Ambulance Alpha',
      text: 'FR-001 — AMB-02 is 6 minutes out to Substation B. How many injured?',
      time: '09:34' },
    { id: 2, sender: 'me', name: 'FR-001 (Me)',
      text: '2 confirmed injured. Minor burns. Proceed to east entrance for patient handoff.',
      time: '09:35' },
  ],
  5: [],
  6: [
    { id: 1, sender: 'them', name: 'BFP Station 7',
      text: 'FR-001, Station 7 standing by. Do you need secondary backup at the perimeter?',
      time: '09:36' },
  ],
};

const AI_ESCALATION_MSG = {
  id:     'ai-esc-1',
  sender: 'ai',
  name:   'CURA AI System',
  text:   '⚠ AI AUTO-ESCALATION — FR-001 and FR-002 rerouted to VECO Substation B, Code 3. Structural breach probability: 89%. DRRMO evacuation protocol triggered. BFP Station 7 repositioned to Jakosalem St. perimeter. Manual override available.',
  time:   'NOW',
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getLastMsg(msgs) {
  return msgs?.length ? msgs[msgs.length - 1] : null;
}

function countUnread(msgs) {
  if (!msgs?.length) return 0;
  // Unread = consecutive 'them' messages after the last 'me' message
  let lastMeIdx = -1;
  msgs.forEach((m, i) => { if (m.sender === 'me') lastMeIdx = i; });
  return msgs.slice(lastMeIdx + 1).filter(m => m.sender === 'them').length;
}

/* ══════════════════════════════════════════════════════════════════════════ */

export default function ResponderChatScreen() {
  const insets   = useSafeAreaInsets();
  const flatRef  = useRef(null);
  const bannerY  = useRef(new Animated.Value(-140)).current;
  const timeouts = useRef([]);

  const [view,              setView]              = useState('list');   // 'list' | 'chat'
  const [selectedContact,   setSelectedContact]   = useState(null);
  const [messages,          setMessages]          = useState(INITIAL_MESSAGES);
  const [inputText,         setInputText]         = useState('');
  const [searchQuery,       setSearchQuery]       = useState('');
  const [pinnedIds,         setPinnedIds]         = useState([1]);     // CMD pinned by default
  const [escalationActive,  setEscalationActive]  = useState(false);
  const [bannerVisible,     setBannerVisible]      = useState(false);

  const msgAnimMap = useRef({});
  function getMsgAnim(id) {
    if (!msgAnimMap.current[id]) msgAnimMap.current[id] = new Animated.Value(1);
    return msgAnimMap.current[id];
  }

  /* ── Escalation effect ── */
  useEffect(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    if (escalationActive) {
      setBannerVisible(true);
      Animated.spring(bannerY, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }).start();
      const t = setTimeout(() => addMessage(1, AI_ESCALATION_MSG), 600);
      timeouts.current = [t];
    } else {
      Animated.timing(bannerY, { toValue: -140, duration: 300, useNativeDriver: true })
        .start(() => setBannerVisible(false));
      setMessages(INITIAL_MESSAGES);
      msgAnimMap.current = {};
    }
  }, [escalationActive]);

  function addMessage(contactId, msg) {
    const anim = new Animated.Value(0);
    msgAnimMap.current[msg.id] = anim;
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), msg],
    }));
    Animated.spring(anim, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }).start();
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
  }

  function sendMessage() {
    const text = inputText.trim();
    if (!text || !selectedContact) return;
    const msg = {
      id:     Date.now(),
      sender: 'me',
      name:   'FR-001 (Me)',
      text,
      time:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    addMessage(selectedContact.id, msg);
    setInputText('');
  }

  function openChat(contact) {
    setSelectedContact(contact);
    setView('chat');
  }

  function goBack() {
    setView('list');
    setSelectedContact(null);
    setInputText('');
  }

  function togglePin(id) {
    setPinnedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [id, ...prev]
    );
  }

  /* ── Build section data for SectionList ── */
  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinned  = filtered.filter(c => pinnedIds.includes(c.id));
  const unread  = filtered.filter(c => !pinnedIds.includes(c.id) && countUnread(messages[c.id]) > 0);
  const rest    = filtered.filter(c => !pinnedIds.includes(c.id) && countUnread(messages[c.id]) === 0);

  const sections = [
    ...(pinned.length ? [{ title: 'PINNED', data: pinned }] : []),
    ...(unread.length ? [{ title: 'UNREAD', data: unread }] : []),
    ...(rest.length   ? [{ title: 'ALL TRANSMISSIONS', data: rest }] : []),
  ];

  /* ── Render ── */
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#090F1E" />

      {/* Escalation banner */}
      {bannerVisible && (
        <Animated.View style={[styles.escBanner, { transform: [{ translateY: bannerY }] }]}>
          <View style={[styles.escInner, { paddingTop: Platform.OS === 'ios' ? 54 : 44 }]}>
            <View style={styles.escIcon}>
              <Ionicons name="shield" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.escTitle}>⚠ AI CRITICAL ESCALATION ACTIVE</Text>
              <Text style={styles.escDesc}>
                Structural breach at <Text style={{ fontWeight: '900' }}>VECO Substation B</Text>. Probability: 89%. Auto-dispatch initiated.
              </Text>
            </View>
            <TouchableOpacity onPress={() => setBannerVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ════════════════ LIST VIEW ════════════════ */}
      {view === 'list' && (
        <View style={styles.flex}>
          {/* Header */}
          <View style={[styles.listHeader, { paddingTop: Platform.OS === 'ios' ? 56 : 44 }]}>
            <View>
              <Text style={styles.listHeaderTitle}>CURA Chat</Text>
              <Text style={styles.listHeaderSub}>Station Transmissions</Text>
            </View>
            <TouchableOpacity
              style={[styles.aiBtn, escalationActive && styles.aiBtnActive]}
              onPress={() => setEscalationActive(v => !v)}
              activeOpacity={0.85}
            >
              <Ionicons name="flash" size={13} color={escalationActive ? '#fff' : '#EF4444'} />
              <Text style={[styles.aiBtnText, escalationActive && styles.aiBtnTextActive]}>
                {escalationActive ? 'CODE RED' : 'AI ESC'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.35)" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transmissions…"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            )}
          </View>

          {/* Section list */}
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                {section.title === 'PINNED' && (
                  <Ionicons name="pin" size={11} color="rgba(255,255,255,0.35)" style={{ marginRight: 5 }} />
                )}
                {section.title === 'UNREAD' && (
                  <View style={styles.sectionUnreadDot} />
                )}
                <Text style={styles.sectionHeaderText}>{section.title}</Text>
              </View>
            )}
            renderItem={({ item: contact }) => {
              const lastMsg   = getLastMsg(messages[contact.id]);
              const unreadCnt = countUnread(messages[contact.id]);
              const isPinned  = pinnedIds.includes(contact.id);
              const isEscTarget = escalationActive && contact.isEscTarget;

              return (
                <TouchableOpacity
                  style={[
                    styles.contactRow,
                    unreadCnt > 0 && styles.contactRowUnread,
                    isEscTarget && styles.contactRowEsc,
                  ]}
                  onPress={() => openChat(contact)}
                  onLongPress={() => togglePin(contact.id)}
                  activeOpacity={0.82}
                >
                  {/* Avatar */}
                  <View style={styles.avatarWrap}>
                    <View style={[styles.avatar, { backgroundColor: isEscTarget ? '#7F1D1D' : contact.color + '28' }]}>
                      <Text style={[styles.avatarText, { color: isEscTarget ? '#EF4444' : contact.color }]}>
                        {contact.short}
                      </Text>
                    </View>
                    <View style={[
                      styles.onlineDot,
                      { backgroundColor: contact.status === 'online' ? COLORS.emerald : '#475569' },
                    ]} />
                  </View>

                  {/* Content */}
                  <View style={styles.rowContent}>
                    <View style={styles.rowTopLine}>
                      <Text
                        style={[styles.rowName, (unreadCnt > 0 || isEscTarget) && styles.rowNameBold]}
                        numberOfLines={1}
                      >
                        {contact.name}
                      </Text>
                      <Text style={styles.rowTime}>{lastMsg?.time ?? ''}</Text>
                    </View>
                    <View style={styles.rowBottomLine}>
                      <Text
                        style={[styles.rowPreview, unreadCnt > 0 && styles.rowPreviewUnread]}
                        numberOfLines={1}
                      >
                        {lastMsg
                          ? (lastMsg.sender === 'me' ? `You: ${lastMsg.text}` : lastMsg.text)
                          : 'No transmissions yet'}
                      </Text>
                      <View style={styles.rowMetaRight}>
                        {isPinned && (
                          <Ionicons name="pin" size={11} color="rgba(255,255,255,0.3)" style={{ marginRight: 4 }} />
                        )}
                        {unreadCnt > 0 && (
                          <View style={[styles.unreadBadge, isEscTarget && styles.unreadBadgeEsc]}>
                            <Text style={styles.unreadBadgeText}>{unreadCnt}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={44} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            }
          />
        </View>
      )}

      {/* ════════════════ CHAT VIEW ════════════════ */}
      {view === 'chat' && selectedContact && (
        <View style={styles.flex}>
          {/* Chat header */}
          <View style={[styles.chatHeader, {
            paddingTop: Platform.OS === 'ios' ? 56 : 44,
            ...(escalationActive && selectedContact.isEscTarget ? styles.chatHeaderEsc : {}),
          }]}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={[styles.chatAvatarSmall, { backgroundColor: selectedContact.color + '28' }]}>
              <Text style={[styles.chatAvatarSmallText, { color: selectedContact.color }]}>
                {selectedContact.short}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatHeaderName}>{selectedContact.name}</Text>
              <Text style={[
                styles.chatHeaderStatus,
                selectedContact.status === 'online' ? styles.statusOnline : styles.statusOffline,
              ]}>
                {selectedContact.status === 'online' ? '● Online' : '○ Offline'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.pinBtn, pinnedIds.includes(selectedContact.id) && styles.pinBtnActive]}
              onPress={() => togglePin(selectedContact.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={pinnedIds.includes(selectedContact.id) ? 'pin' : 'pin-outline'}
                size={16}
                color={pinnedIds.includes(selectedContact.id) ? COLORS.emerald : 'rgba(255,255,255,0.4)'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.aiBtn, escalationActive && styles.aiBtnActive, { marginLeft: SPACING.xs }]}
              onPress={() => setEscalationActive(v => !v)}
              activeOpacity={0.85}
            >
              <Ionicons name="flash" size={12} color={escalationActive ? '#fff' : '#EF4444'} />
              <Text style={[styles.aiBtnText, escalationActive && styles.aiBtnTextActive]}>
                {escalationActive ? 'RED' : 'AI'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatRef}
            data={messages[selectedContact.id] || []}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
            ListHeaderComponent={
              <View style={styles.dateDivider}>
                <View style={styles.dateLine} />
                <Text style={styles.dateText}>
                  Today · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <View style={styles.dateLine} />
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={44} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>No transmissions yet</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isMe = item.sender === 'me';
              const isAI = item.sender === 'ai';
              const anim = getMsgAnim(item.id);

              if (isAI) {
                return (
                  <Animated.View style={[styles.aiMsgWrap, { opacity: anim }]}>
                    <View style={styles.aiMsgCard}>
                      <View style={styles.aiMsgHeaderRow}>
                        <View style={styles.aiMsgIcon}>
                          <Ionicons name="flash" size={13} color="#fff" />
                        </View>
                        <Text style={styles.aiMsgLabel}>CURA AI · Auto-Action</Text>
                        <Text style={styles.aiMsgTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.aiMsgText}>{item.text}</Text>
                    </View>
                  </Animated.View>
                );
              }

              return (
                <Animated.View
                  style={[
                    styles.msgRow,
                    isMe ? styles.msgRowMe : styles.msgRowThem,
                    {
                      opacity: anim,
                      transform: [{
                        translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [isMe ? 24 : -24, 0] }),
                      }],
                    },
                  ]}
                >
                  {!isMe && (
                    <View style={[styles.msgAvatar, { backgroundColor: selectedContact.color + '28' }]}>
                      <Text style={[styles.msgAvatarText, { color: selectedContact.color }]}>
                        {selectedContact.short}
                      </Text>
                    </View>
                  )}
                  <View style={styles.msgBubbleGroup}>
                    <Text style={[styles.msgSenderName, isMe && styles.msgSenderNameMe]}>
                      {item.name}
                    </Text>
                    <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleThem]}>
                      <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.text}</Text>
                    </View>
                    <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
                      {item.time}{isMe ? ' ✓✓' : ''}
                    </Text>
                  </View>
                  {isMe && (
                    <View style={[styles.msgAvatar, { backgroundColor: `${COLORS.emerald}28` }]}>
                      <Text style={[styles.msgAvatarText, { color: COLORS.emerald }]}>ME</Text>
                    </View>
                  )}
                </Animated.View>
              );
            }}
          />

          {/* Input */}
          <View style={[
            styles.inputArea,
            escalationActive && styles.inputAreaEsc,
            { paddingBottom: Math.max(insets.bottom, SPACING.md) },
          ]}>
            {escalationActive && (
              <View style={styles.escActiveBar}>
                <Ionicons name="warning-outline" size={12} color="#EF4444" />
                <Text style={styles.escActiveBarText}>AI AUTO-DISPATCH ACTIVE — Manual commands still accepted</Text>
              </View>
            )}
            <View style={styles.inputRow}>
              <View style={[styles.inputWrap, escalationActive && styles.inputWrapEsc]}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={`Transmit to ${selectedContact.name}…`}
                  placeholderTextColor="rgba(255,255,255,0.28)"
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  !inputText.trim() && styles.sendBtnDisabled,
                  escalationActive && inputText.trim() && styles.sendBtnEsc,
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim()}
                activeOpacity={0.85}
              >
                <Ionicons name="paper-plane" size={18} color={inputText.trim() ? '#fff' : 'rgba(255,255,255,0.25)'} />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>Enter to transmit · End-to-end encrypted</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090F1E' },
  flex:      { flex: 1 },

  /* Escalation banner */
  escBanner: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: '#450A0A',
    borderBottomWidth: 2, borderBottomColor: '#EF4444',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 18,
  },
  escInner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
  },
  escIcon: {
    width: 36, height: 36, borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  escTitle: { fontSize: 10, fontWeight: '900', color: '#FCA5A5', letterSpacing: 1.5, marginBottom: 3 },
  escDesc:  { fontSize: FONT_SIZES.sm, color: '#fff', fontWeight: '500', lineHeight: 18 },

  /* List header */
  listHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  listHeaderTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  listHeaderSub:   { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '500' },

  /* AI Escalation button */
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.4)',
  },
  aiBtnActive: {
    backgroundColor: '#EF4444', borderColor: '#EF4444',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.55, shadowRadius: 8, elevation: 6,
  },
  aiBtnText:       { fontSize: 10, fontWeight: '900', color: '#EF4444', letterSpacing: 0.5 },
  aiBtnTextActive: { color: '#fff' },

  /* Search */
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: SPACING.lg, marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1, fontSize: FONT_SIZES.md, color: '#fff',
    paddingVertical: 0,
  },

  /* Section headers */
  listContent:   { paddingBottom: SPACING.xl },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  sectionHeaderText: {
    fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  sectionUnreadDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: COLORS.emerald, marginRight: 6,
  },

  /* Contact row */
  contactRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  contactRowUnread: { backgroundColor: 'rgba(255,255,255,0.03)' },
  contactRowEsc:    { backgroundColor: 'rgba(127,29,29,0.2)' },

  avatarWrap: { position: 'relative', marginRight: SPACING.md },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 13, height: 13, borderRadius: 6.5,
    borderWidth: 2.5, borderColor: '#090F1E',
  },

  rowContent: { flex: 1 },
  rowTopLine: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 4,
  },
  rowName:     { fontSize: FONT_SIZES.md, fontWeight: '500', color: 'rgba(255,255,255,0.75)', flex: 1 },
  rowNameBold: { fontWeight: '800', color: '#fff' },
  rowTime:     { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '500', marginLeft: SPACING.sm },
  rowBottomLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowPreview: {
    fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.35)',
    fontWeight: '400', flex: 1,
  },
  rowPreviewUnread: { color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  rowMetaRight: { flexDirection: 'row', alignItems: 'center', marginLeft: SPACING.sm },
  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5,
    backgroundColor: COLORS.emerald,
    justifyContent: 'center', alignItems: 'center',
  },
  unreadBadgeEsc:  { backgroundColor: '#EF4444' },
  unreadBadgeText: { fontSize: 11, fontWeight: '900', color: '#fff' },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  emptyText:  { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.25)', fontWeight: '500' },

  /* Chat header */
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.md,
    backgroundColor: '#0D1B2A',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  chatHeaderEsc: { backgroundColor: 'rgba(127,29,29,0.3)' },
  backBtn: {
    width: 36, height: 36, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
    marginRight: SPACING.xs,
  },
  chatAvatarSmall: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
  },
  chatAvatarSmallText: { fontSize: 12, fontWeight: '800' },
  chatHeaderName:   { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  chatHeaderStatus: { fontSize: 11, marginTop: 1, fontWeight: '600' },
  statusOnline:  { color: COLORS.emerald },
  statusOffline: { color: '#64748B' },
  pinBtn: {
    width: 34, height: 34, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  pinBtnActive: { backgroundColor: `${COLORS.emerald}18` },

  /* Messages */
  msgList: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  dateDivider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  dateLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  dateText: {
    fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.28)',
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  msgRow:      { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  msgRowMe:    { justifyContent: 'flex-end' },
  msgRowThem:  { justifyContent: 'flex-start' },
  msgAvatar: {
    width: 32, height: 32, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
  },
  msgAvatarText: { fontSize: 9, fontWeight: '800' },
  msgBubbleGroup: { maxWidth: '65%' },
  msgSenderName:    { fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: '600', marginBottom: 3 },
  msgSenderNameMe:  { textAlign: 'right' },
  msgBubble: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, borderRadius: 20 },
  msgBubbleMe:   { backgroundColor: '#10B981', borderBottomRightRadius: 4 },
  msgBubbleThem: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
  },
  msgText:    { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.82)', lineHeight: 20 },
  msgTextMe:  { color: '#fff', fontWeight: '500' },
  msgTime:    { fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 3, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  msgTimeMe:  { textAlign: 'right', color: `${COLORS.emerald}99` },

  /* AI message */
  aiMsgWrap: { marginVertical: SPACING.xs },
  aiMsgCard: {
    backgroundColor: 'rgba(127,29,29,0.65)',
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
  },
  aiMsgHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  aiMsgIcon: {
    width: 26, height: 26, borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center',
  },
  aiMsgLabel: { flex: 1, fontSize: 10, fontWeight: '900', color: '#FCA5A5', letterSpacing: 1 },
  aiMsgTime:  { fontSize: 10, color: '#EF4444', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  aiMsgText:  { fontSize: FONT_SIZES.md, color: '#FEE2E2', fontWeight: '500', lineHeight: 20 },

  /* Input area */
  inputArea: {
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md,
    backgroundColor: '#0D1B2A',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  inputAreaEsc: { borderTopColor: 'rgba(239,68,68,0.3)', backgroundColor: '#12131F' },
  escActiveBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
    marginBottom: SPACING.sm,
  },
  escActiveBarText: { fontSize: 10, color: 'rgba(239,68,68,0.8)', fontWeight: '600', flex: 1 },
  inputRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-end' },
  inputWrap: {
    flex: 1, minHeight: 46, maxHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
  },
  inputWrapEsc: { borderColor: 'rgba(239,68,68,0.3)' },
  textInput: { fontSize: FONT_SIZES.md, color: '#fff', textAlignVertical: 'top' },
  sendBtn: {
    width: 46, height: 46, borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.emerald,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.emerald, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.55, shadowRadius: 8, elevation: 6,
  },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.09)', shadowOpacity: 0 },
  sendBtnEsc:      { backgroundColor: '#EF4444', shadowColor: '#EF4444' },
  inputHint: {
    fontSize: 10, color: 'rgba(255,255,255,0.18)',
    textAlign: 'center', marginTop: SPACING.sm, marginBottom: SPACING.xs,
  },
});
