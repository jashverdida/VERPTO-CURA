import React, { useState, useEffect, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  SignalIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  CheckCircleIcon,
  UserCircleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

// ─── Static Data ──────────────────────────────────────────────────────────────

const STATIONS = [
  {
    id: 1,
    name: 'BFP Lahug Fire Station',
    type: 'fire',
    status: 'online',
    unit: 'FR-001 · FR-002',
    lastMessage: 'Acknowledged. Standing by.',
    lastTime: '09:41',
    accentColor: 'text-red-400',
  },
  {
    id: 2,
    name: 'VECO Substation B',
    type: 'electrical',
    status: 'online',
    unit: 'ENG-04',
    lastMessage: 'HIGH risk. Adjacent area within 50m...',
    lastTime: '09:44',
    accentColor: 'text-amber-400',
    isEscalationTarget: true,
  },
  {
    id: 3,
    name: 'DRRMO Central Dispatch',
    type: 'drrmo',
    status: 'online',
    unit: 'DRR-CMD',
    lastMessage: 'Awaiting resource allocation update.',
    lastTime: '09:38',
    accentColor: 'text-blue-400',
  },
  {
    id: 4,
    name: 'Ambulance Base Alpha',
    type: 'medical',
    status: 'online',
    unit: 'AMB-02 · AMB-05',
    lastMessage: 'Units deployed. ETA 6 minutes.',
    lastTime: '09:35',
    accentColor: 'text-emerald-400',
  },
  {
    id: 5,
    name: 'PNP Mabolo Station',
    type: 'police',
    status: 'offline',
    unit: 'PLT-09',
    lastMessage: 'Last seen 2 hours ago.',
    lastTime: '07:22',
    accentColor: 'text-slate-400',
  },
  {
    id: 6,
    name: 'BFP Station 7 Talamban',
    type: 'fire',
    status: 'online',
    unit: 'FR-007',
    lastMessage: 'All units on standby.',
    lastTime: '09:30',
    accentColor: 'text-red-400',
  },
];

const INITIAL_MESSAGES = {
  1: [
    { id: 1, sender: 'command', name: 'Command Center', text: 'BFP Lahug, standby for possible dispatch to VECO Substation B. Transformer fire — Code 2 as of now.', time: '09:34', read: true },
    { id: 2, sender: 'station', name: 'BFP Lahug Fire Station', text: 'Acknowledged. FR-001 and FR-002 are prepped and on standby. Ready to mobilize on your order.', time: '09:41', read: true },
  ],
  2: [
    { id: 1, sender: 'station', name: 'VECO Substation B', text: 'Command, this is VECO Substation B. Reporting transformer fire at Unit 3. Currently contained. Requesting guidance.', time: '09:31', read: true },
    { id: 2, sender: 'command', name: 'Command Center', text: 'Copy that, Substation B. What is your current manpower and equipment status? Are suppression systems active?', time: '09:32', read: true },
    { id: 3, sender: 'station', name: 'VECO Substation B', text: '4 personnel on-site. Active suppression engaged. Requesting BFP standby at perimeter. Fire is stable for now.', time: '09:33', read: true },
    { id: 4, sender: 'command', name: 'Command Center', text: 'Acknowledged. BFP Lahug is on standby. Continue suppression and maintain comms every 5 minutes. Over.', time: '09:34', read: true },
    { id: 5, sender: 'station', name: 'VECO Substation B', text: 'Update: Fire has breached secondary containment barrier at Unit 3-B. Suppression team pulling back. Requesting IMMEDIATE backup.', time: '09:41', read: true },
    { id: 6, sender: 'command', name: 'Command Center', text: 'Copy. Escalating priority to CODE 3. What is your estimated risk to adjacent structures? Confirm personnel count.', time: '09:43', read: true },
    { id: 7, sender: 'station', name: 'VECO Substation B', text: 'HIGH RISK. Residential area within 50 meters. 2 personnel with minor burns. Fire is spreading to Unit 4. We need backup NOW.', time: '09:44', read: false },
  ],
  3: [
    { id: 1, sender: 'station', name: 'DRRMO Central Dispatch', text: 'Command, what is current resource allocation for the Substation B incident? We need a situational update for our EOC briefing.', time: '09:38', read: false },
  ],
  4: [
    { id: 1, sender: 'command', name: 'Command Center', text: 'Ambulance Base Alpha, deploy AMB-02 and AMB-05 to VECO Substation B, Escario Street. 2 injured personnel reported.', time: '09:30', read: true },
    { id: 2, sender: 'station', name: 'Ambulance Base Alpha', text: 'Units deployed. AMB-02 and AMB-05 en route. ETA 6 minutes. Medical team prepared for burn treatment.', time: '09:35', read: true },
  ],
  5: [],
  6: [
    { id: 1, sender: 'command', name: 'Command Center', text: 'BFP Station 7, remain on standby. May require secondary dispatch depending on Substation B escalation.', time: '09:30', read: true },
    { id: 2, sender: 'station', name: 'BFP Station 7 Talamban', text: 'All units on standby. FR-007 crew briefed and ready. Awaiting dispatch order.', time: '09:30', read: true },
  ],
};

const AI_DISPATCH_MESSAGES = [
  {
    id: 'ai-1',
    sender: 'ai',
    name: 'CURA AI System',
    text: '⚠ AUTO-DISPATCH INITIATED — BFP Lahug (FR-001, FR-002) dispatched to VECO Substation B via Escario Street. ETA: 4 minutes. GPS tracking active.',
    time: 'NOW',
    read: true,
  },
  {
    id: 'ai-2',
    sender: 'ai',
    name: 'CURA AI System',
    text: '⚠ SECONDARY BACKUP ALERT — BFP Station 7 Talamban notified for staging position at Jakosalem St. perimeter. Awaiting confirmation.',
    time: 'NOW',
    read: true,
  },
  {
    id: 'ai-3',
    sender: 'ai',
    name: 'CURA AI System',
    text: '⚠ EVACUATION PROTOCOL TRIGGERED — DRRMO Central Dispatch alerted. Residential evacuation corridor mapped for Zone 4-B, Escario St. Estimated 120 residents affected.',
    time: 'NOW',
    read: true,
  },
];

const AI_DISPATCH_TO_STATION_1 = {
  id: 'ai-dispatch-1',
  sender: 'ai',
  name: 'CURA AI System',
  text: '⚠ AI AUTO-DISPATCH — FR-001 and FR-002 mobilized to VECO Substation B by CURA AI. Proceed via Escario Street. Code 3 — lights and sirens.',
  time: 'NOW',
  read: true,
};

const AI_DISPATCH_TO_STATION_6 = {
  id: 'ai-dispatch-6',
  sender: 'ai',
  name: 'CURA AI System',
  text: '⚠ AI STAGING ORDER — FR-007 reposition to Jakosalem St. perimeter as secondary support for Substation B incident. Standby for entry authorization.',
  time: 'NOW',
  read: true,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CuraChat() {
  const [selectedStation, setSelectedStation] = useState(STATIONS[1]);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [escalationActive, setEscalationActive] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const timeoutsRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedStation]);

  useEffect(() => {
    // Clear any pending timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    if (escalationActive) {
      setBannerVisible(true);
      const t1 = setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          2: [...prev[2], AI_DISPATCH_MESSAGES[0]],
        }));
      }, 400);
      const t2 = setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          1: [...prev[1], AI_DISPATCH_TO_STATION_1],
          2: [...prev[2], AI_DISPATCH_MESSAGES[1]],
        }));
      }, 1100);
      const t3 = setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          6: [...prev[6], AI_DISPATCH_TO_STATION_6],
          2: [...prev[2], AI_DISPATCH_MESSAGES[2]],
        }));
      }, 1900);
      timeoutsRef.current = [t1, t2, t3];
    } else {
      setBannerVisible(false);
      setMessages(INITIAL_MESSAGES);
    }
  }, [escalationActive]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'command',
      name: 'Command Center',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    setMessages(prev => ({
      ...prev,
      [selectedStation.id]: [...(prev[selectedStation.id] || []), newMsg],
    }));
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredStations = STATIONS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCount = STATIONS.filter(s => s.status === 'online').length;
  const currentMessages = messages[selectedStation.id] || [];
  const unreadCount = (stationId) => (messages[stationId] || []).filter(m => !m.read && m.sender === 'station').length;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950">

      {/* ── AI Escalation Banner ───────────────────────────────────────────── */}
      {bannerVisible && (
        <div className="flex-shrink-0 bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b-2 border-red-500 px-6 py-4 flex items-start justify-between z-20 shadow-2xl shadow-red-900/50">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mt-0.5 shadow-lg shadow-red-500/40 animate-pulse">
              <ShieldExclamationIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1.5">
                <span className="text-xs font-black text-red-300 uppercase tracking-widest">
                  ⚠ AI DETECTION — CRITICAL ESCALATION ACTIVE
                </span>
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-black rounded-full animate-pulse">
                  LIVE
                </span>
                <span className="px-2 py-0.5 bg-red-900 text-red-300 text-xs font-bold rounded-full border border-red-700">
                  GPT-4o-mini
                </span>
              </div>
              <p className="text-white font-semibold text-sm leading-relaxed">
                Fire escalation detected at <span className="text-red-300 font-black">VECO Substation B</span>.
                Probability of structural breach: <span className="text-red-300 font-black">89%</span>.
                Initiating automated backup dispatch to nearby stations.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-4 text-xs">
                {[
                  { label: 'BFP Lahug dispatched', done: true },
                  { label: 'BFP Station 7 alerted', done: true },
                  { label: 'DRRMO evacuation protocol initiated', done: true },
                  { label: 'Manual override available', done: false, warn: true },
                ].map(({ label, done, warn }) => (
                  <span key={label} className={`flex items-center space-x-1.5 ${warn ? 'text-amber-300' : 'text-red-300'}`}>
                    {done
                      ? <CheckCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      : <ExclamationTriangleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    }
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setBannerVisible(false)}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-800/60 transition-colors ml-6 mt-0.5"
            title="Dismiss (escalation remains active)"
          >
            <XMarkIcon className="w-5 h-5 text-red-400" />
          </button>
        </div>
      )}

      {/* ── Main Split Pane ────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left Pane: Station List ──────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">

          {/* Left header */}
          <div className="px-4 pt-5 pb-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Station Comms</h2>
                <p className="text-xs text-slate-500 mt-0.5">{onlineCount} of {STATIONS.length} stations online</p>
              </div>
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-400">Live</span>
              </div>
            </div>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Station entries */}
          <div className="flex-1 overflow-y-auto">
            {filteredStations.map((station) => {
              const isSelected = selectedStation.id === station.id;
              const isEscTarget = escalationActive && station.isEscalationTarget;
              const unread = unreadCount(station.id);

              return (
                <button
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={`w-full px-4 py-3.5 flex items-start space-x-3 text-left transition-all duration-200 border-b border-slate-800/60 border-l-2 ${
                    isSelected
                      ? isEscTarget
                        ? 'bg-red-950/40 border-l-red-500'
                        : 'bg-slate-800 border-l-emerald-500'
                      : isEscTarget
                        ? 'bg-red-950/20 border-l-transparent hover:bg-red-950/30'
                        : 'border-l-transparent hover:bg-slate-800/40'
                  }`}
                >
                  {/* Avatar with status dot */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isEscTarget ? 'bg-red-900/50' : 'bg-slate-800'
                    }`}>
                      <BuildingOfficeIcon className={`w-4.5 h-4.5 ${
                        isEscTarget ? 'text-red-400' : station.accentColor
                      }`} />
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                      station.status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs font-semibold truncate ${
                        isEscTarget ? 'text-red-300' : 'text-slate-100'
                      }`}>
                        {station.name}
                      </span>
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        {isEscTarget && (
                          <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                        )}
                        <span className="text-xs text-slate-600">{station.lastTime}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{station.lastMessage}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-700">{station.unit}</span>
                      {unread > 0 && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          isEscTarget ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                        }`}>
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dev Tools toggle */}
          <div className={`px-4 py-4 border-t transition-colors duration-500 ${
            escalationActive ? 'border-red-800/50 bg-red-950/20' : 'border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Dev Tools</span>
              <span className="text-xs text-slate-700">Prototype</span>
            </div>
            <button
              onClick={() => setEscalationActive(prev => !prev)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
                escalationActive
                  ? 'bg-red-950/60 border-red-600/50 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BoltIcon className={`w-4 h-4 ${escalationActive ? 'text-red-400' : 'text-slate-600'}`} />
                <span>Simulate AI Escalation</span>
              </div>
              {/* Toggle pill */}
              <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${
                escalationActive ? 'bg-red-500' : 'bg-slate-700'
              }`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${
                  escalationActive ? 'left-4' : 'left-0.5'
                }`} />
              </div>
            </button>
            {escalationActive && (
              <p className="text-xs text-red-500/70 text-center mt-1.5">AI escalation mode active</p>
            )}
          </div>
        </div>

        {/* ── Right Pane: Chat Window ──────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${
          escalationActive ? 'shadow-[inset_0_0_40px_rgba(239,68,68,0.06)]' : ''
        }`}>

          {/* Chat header */}
          <div className={`flex-shrink-0 px-6 py-4 border-b flex items-center justify-between transition-all duration-500 ${
            escalationActive
              ? 'bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border-red-800/50'
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                escalationActive && selectedStation.isEscalationTarget
                  ? 'bg-red-900/60 border border-red-700/50'
                  : 'bg-slate-800 border border-slate-700'
              }`}>
                <BuildingOfficeIcon className={`w-5 h-5 ${
                  escalationActive && selectedStation.isEscalationTarget ? 'text-red-400' : selectedStation.accentColor
                }`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-white">{selectedStation.name}</h3>
                  {escalationActive && selectedStation.isEscalationTarget && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-black bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      <span>ESCALATION</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedStation.status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'
                  }`} />
                  <span className="text-xs text-slate-500">
                    {selectedStation.status === 'online' ? 'Online' : 'Offline'} · {selectedStation.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {escalationActive && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/15 border border-red-500/30 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-black text-red-400 tracking-widest">CODE RED</span>
                </div>
              )}
              <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border ${
                escalationActive
                  ? 'bg-slate-800/50 border-slate-700 text-slate-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                <SignalIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium">Encrypted</span>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className={`flex-1 overflow-y-auto px-6 py-5 space-y-4 transition-all duration-500 ${
            escalationActive ? 'bg-slate-950' : 'bg-slate-950'
          }`}>

            {/* Date divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs font-medium text-slate-600 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full">
                Today · Incident Log · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {currentMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-slate-500 font-medium text-sm">No communications yet</p>
                <p className="text-slate-600 text-xs mt-1">Start a transmission to this station</p>
              </div>
            )}

            {currentMessages.map((msg) => {
              const isCommand = msg.sender === 'command';
              const isAI = msg.sender === 'ai';

              if (isAI) {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <div className="max-w-2xl w-full bg-gradient-to-r from-red-950/80 to-red-900/60 border border-red-600/40 rounded-xl p-4 shadow-lg shadow-red-950/50">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow shadow-red-600/40">
                          <BoltIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-black text-red-400 uppercase tracking-widest">CURA AI · Auto-Action</span>
                            <span className="text-xs text-red-600 font-mono">{msg.time}</span>
                          </div>
                          <p className="text-sm text-red-100 font-medium leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isCommand ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 max-w-md ${isCommand ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${
                      isCommand ? 'bg-emerald-700' : 'bg-slate-700'
                    }`}>
                      <UserCircleIcon className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <p className={`text-xs text-slate-600 mb-1 ${isCommand ? 'text-right' : 'text-left'}`}>
                        {msg.name}
                      </p>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isCommand
                          ? 'bg-emerald-700 text-white rounded-br-sm'
                          : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <p className={`text-xs text-slate-600 mt-1 font-mono ${isCommand ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                        {isCommand && <span className="ml-1 text-emerald-500">✓✓</span>}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className={`flex-shrink-0 px-6 py-4 border-t transition-all duration-500 ${
            escalationActive ? 'bg-slate-900 border-red-800/40' : 'bg-slate-900 border-slate-800'
          }`}>
            {escalationActive && (
              <div className="flex items-center space-x-2 mb-3 px-3 py-2 bg-red-950/40 border border-red-800/40 rounded-lg">
                <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400/80 font-medium">
                  AI AUTO-DISPATCH ACTIVE — Manual commands still accepted. All transmissions are logged.
                </span>
              </div>
            )}
            <div className="flex items-end gap-3">
              <div className={`flex-1 border rounded-xl px-4 py-3 transition-all duration-300 focus-within:ring-1 ${
                escalationActive
                  ? 'bg-slate-800 border-slate-700 focus-within:border-red-500 focus-within:ring-red-500/20'
                  : 'bg-slate-800 border-slate-700 focus-within:border-emerald-500 focus-within:ring-emerald-500/20'
              }`}>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Transmit to ${selectedStation.name}...`}
                  rows={1}
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 resize-none focus:outline-none leading-relaxed"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  inputText.trim()
                    ? escalationActive
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 hover:scale-105 active:scale-95'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                }`}
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-700 mt-2">
              Enter to transmit · Shift+Enter for new line · End-to-end encrypted channel
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
