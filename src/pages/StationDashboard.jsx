import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MapContainer from '../components/MapContainer';
import {
  Squares2X2Icon,
  BellAlertIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  MapIcon,
  FireIcon,
  HeartIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserCircleIcon,
  BoltIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronDownIcon,
  SignalIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolid,
  ExclamationTriangleIcon as ExclamationSolid,
} from '@heroicons/react/24/solid';

// ─── Static Data ──────────────────────────────────────────────────────────────

const INITIAL_DISPATCH_QUEUE = [
  {
    id: 'DSP-2026-041',
    type: 'fire',
    title: 'Structural Fire — Commercial Building',
    location: 'Ayala Center Cebu, Cardinal Rosales Ave',
    reported: '2 min ago',
    priority: 'CODE RED',
    aiConfidence: 94,
    aiNote: 'Thermal signature confirmed. Multi-floor spread probability high.',
    requiredUnits: 2,
  },
  {
    id: 'DSP-2026-042',
    type: 'medical',
    title: 'Cardiac Emergency — Office Tower',
    location: 'IT Park Ave & Gov. Cuenco Ave, Lahug',
    reported: '5 min ago',
    priority: 'CODE 2',
    aiConfidence: 87,
    aiNote: 'NLP voice analysis: distress markers and medical terminology detected.',
    requiredUnits: 1,
  },
  {
    id: 'DSP-2026-043',
    type: 'accident',
    title: 'Multi-Vehicle Collision w/ Entrapment',
    location: 'CCLEX Approach, North Reclamation Area',
    reported: '9 min ago',
    priority: 'CODE 2',
    aiConfidence: 76,
    aiNote: 'Image analysis inconclusive. Manual verification recommended before deploy.',
    requiredUnits: 2,
  },
];

const INITIAL_FLEET = [
  { id: 'FT-04',  label: 'Fire Truck 04',   type: 'fire',    status: 'deployed',    location: 'Substation B, Escario St.', crew: 2 },
  { id: 'FT-05',  label: 'Fire Truck 05',   type: 'fire',    status: 'available',   location: 'Station Base',              crew: 0 },
  { id: 'RV-02',  label: 'Rescue Van 02',   type: 'rescue',  status: 'available',   location: 'Station Base',              crew: 0 },
  { id: 'AMB-07', label: 'Ambulance 07',    type: 'medical', status: 'maintenance', location: 'Workshop Bay 2',            crew: 0 },
  { id: 'LT-01',  label: 'Ladder Truck 01', type: 'fire',    status: 'available',   location: 'Station Base',              crew: 0 },
  { id: 'CMD',    label: 'Command Vehicle', type: 'command', status: 'deployed',    location: 'VECO Substation B',         crew: 1 },
];

const PERSONNEL = [
  { id: 1, name: 'Capt. Ramon Dela Cruz',  rank: 'Station Commander', status: 'on-duty',  unit: null    },
  { id: 2, name: 'Lt. Maria Santos',        rank: 'Fire Lieutenant',   status: 'on-duty',  unit: null    },
  { id: 3, name: 'FF2 Jose Reyes',          rank: 'Firefighter',       status: 'deployed', unit: 'FT-04' },
  { id: 4, name: 'FF2 Carlo Buenaventura',  rank: 'Firefighter',       status: 'deployed', unit: 'FT-04' },
  { id: 5, name: 'FF1 Ana Lim',             rank: 'Firefighter',       status: 'on-duty',  unit: null    },
  { id: 6, name: 'Paramedic Rey Ocampo',    rank: 'Paramedic',         status: 'on-duty',  unit: null    },
  { id: 7, name: 'Driver Jose Mendez',      rank: 'Senior Driver',     status: 'deployed', unit: 'CMD'   },
  { id: 8, name: 'Driver Ana Quiambao',     rank: 'Driver',            status: 'on-duty',  unit: null    },
];

const RECENT_ACTIVITY = [
  { time: '09:44', text: 'DSP-2026-043 received — CCLEX multi-vehicle collision', type: 'alert'  },
  { time: '09:41', text: 'FT-04 deployed to VECO Substation B (Code 3)',          type: 'deploy' },
  { time: '09:34', text: 'CMD vehicle dispatched — Station Commander on scene',    type: 'deploy' },
  { time: '09:30', text: 'AMB-07 flagged for maintenance — brake system fault',    type: 'warn'   },
  { time: '08:55', text: 'Shift A clocked in — 8 personnel on duty',              type: 'info'   },
];

// ─── Chat Data ────────────────────────────────────────────────────────────────

const CHAT_CONTACTS = [
  {
    id: 1,
    name: 'Central Command',
    role: 'Command Center HQ',
    status: 'online',
    unit: 'CMD-001',
    accentColor: 'text-emerald-400',
    lastMessage: 'Station 3 en route. Maintain radio contact.',
    lastTime: '09:42',
  },
  {
    id: 2,
    name: 'VECO Substation B',
    role: 'Power Infrastructure',
    status: 'busy',
    unit: 'ENG-04',
    accentColor: 'text-amber-400',
    lastMessage: 'Fire breached secondary containment.',
    lastTime: '09:41',
    isAlert: true,
  },
  {
    id: 3,
    name: 'Mabolo Police',
    role: 'Law Enforcement',
    status: 'online',
    unit: 'PLT-03',
    accentColor: 'text-blue-400',
    lastMessage: 'Traffic perimeter on Gorordo Ave established.',
    lastTime: '09:43',
  },
  {
    id: 4,
    name: 'City Health Dept.',
    role: 'Medical Coordination',
    status: 'online',
    unit: 'MED-CMD',
    accentColor: 'text-purple-400',
    lastMessage: 'Awaiting casualty count update.',
    lastTime: '09:38',
  },
];

const INITIAL_CHAT_MESSAGES = {
  1: [
    { id: 1, sender: 'contact', name: 'Central Command',       text: 'Station 4, be advised: Structural fire reported at Ayala Center Cebu, Level 4 carpark. CURA has classified this as Code Red. All units in your sector are on standby alert.', time: '09:38', read: true  },
    { id: 2, sender: 'station', name: 'Station 4 — Mabolo',    text: 'Confirmed, Central. Deploying FT-05 and LT-01 immediately. ETA to scene: 6 minutes. Station Commander has been notified.', time: '09:39', read: true  },
    { id: 3, sender: 'contact', name: 'Central Command',       text: 'Copy that, Station 4. Be advised: Cardinal Rosales approach is blocked by thermal debris and structural collapse risk. CURAGA is processing alternate routing.', time: '09:40', read: true  },
    { id: 4, sender: 'ai',      name: 'CURA AI System',        text: '⚠ AI EDGE DETECTION — Thermal signature escalating. Multi-floor spread detected on floors 4–6. Recommending Code 3 backup. Structural integrity risk: 78% probability of partial collapse within 20 minutes.', time: '09:41', read: true  },
    { id: 5, sender: 'station', name: 'Station 4 — Mabolo',    text: 'Understood. Requesting mutual aid from Station 3. Rerouting via Gorordo Ave as advised. All crew on full PPE.', time: '09:41', read: true  },
    { id: 6, sender: 'contact', name: 'Central Command',       text: 'Mutual aid request approved. Station 3 en route — ETA 8 minutes. Maintain radio contact on Channel 7. Incident command post established at Ayala North parking.', time: '09:42', read: false },
  ],
  2: [
    { id: 1, sender: 'contact', name: 'VECO Substation B',     text: 'Station 4, this is VECO ENG-04. Transformer overheat at Unit 3. Active suppression engaged. Requesting perimeter standby — situation may escalate.', time: '09:31', read: true  },
    { id: 2, sender: 'station', name: 'Station 4 — Mabolo',    text: 'Copy that. FT-04 is repositioning to the Escario St perimeter now. Maintain comms and advise if suppression fails. Over.', time: '09:33', read: true  },
    { id: 3, sender: 'contact', name: 'VECO Substation B',     text: 'Update: Fire has breached secondary containment at Unit 3-B. Suppression team pulling back. Requesting IMMEDIATE backup. 2 personnel with minor burns.', time: '09:41', read: true  },
    { id: 4, sender: 'station', name: 'Station 4 — Mabolo',    text: 'Escalating to CODE RED. Notifying Central Command now. Hold position — FT-04 ETA to your location is 3 minutes.', time: '09:42', read: true  },
  ],
  3: [
    { id: 1, sender: 'contact', name: 'Mabolo Police',         text: 'Station 4, PLT-03 here. We are establishing a traffic perimeter on Gorordo Ave approaching Cardinal Rosales. Coordinates transmitted to CURAGA.', time: '09:43', read: false },
  ],
  4: [],
};

const STATION_AI_ESCALATION_MESSAGES = [
  { id: 'sai-1', sender: 'ai', name: 'CURA AI System', text: '⚠ AUTO-ALERT SENT TO CENTRAL — Code RED escalation confirmed at Ayala Center Cebu. Mutual aid request dispatched to Station 3. All units remain on standby.', time: 'NOW', read: true },
  { id: 'sai-2', sender: 'ai', name: 'CURA AI System', text: '⚠ AI EDGE NODE ALERT — Thermal imaging confirms multi-floor spread on floors 4–6. Structural collapse probability: 78%. Evacuation corridor mapped for Cardinal Rosales Ave.', time: 'NOW', read: true },
  { id: 'sai-3', sender: 'ai', name: 'CURA AI System', text: '⚠ MUTUAL AID CONFIRMED — Station 3 en route, ETA 8 min. DRRMO evacuation team dispatched. All station units remain on Code 3 alert.', time: 'NOW', read: true },
];

const STATION_AI_TO_CENTRAL = {
  id: 'sai-central', sender: 'ai', name: 'CURA AI System',
  text: '⚠ AI AUTO-DISPATCH — Station 4 Edge AI has escalated this incident to Code RED and notified Central Command. Mutual aid request submitted. All actions are logged.',
  time: 'NOW', read: true,
};

// ─── Jurisdiction Map Data ────────────────────────────────────────────────────

const MAP_INCIDENTS = [
  { id: 'INC-041', type: 'fire',     x: 61, y: 43, label: 'Ayala Center Cebu',          detail: 'Structural fire — L4 carpark',     priority: 'CODE RED' },
  { id: 'INC-038', type: 'medical',  x: 41, y: 32, label: 'Cardinal Rosales Bldg, 12F', detail: 'Cardiac arrest — 1 patient',        priority: 'CODE 2'   },
  { id: 'INC-037', type: 'medical',  x: 25, y: 58, label: 'IT Park Ave, Tower 3',        detail: 'Trauma — multiple persons injured',  priority: 'CODE 2'   },
  { id: 'INC-036', type: 'rescue',   x: 16, y: 70, label: 'Mabolo Creek Bridge',         detail: 'Missing person — swift water area', priority: 'CODE 2'   },
];

const MAP_UNITS = [
  { id: 'FT-04', label: 'Engine 04',        status: 'on-scene', coords: '10°19\'01"N  123°54\'18"E', x: 63, y: 46, color: '#10B981' },
  { id: 'CMD',   label: 'Command Vehicle',  status: 'en-route', coords: '10°19\'15"N  123°54\'02"E', x: 50, y: 28, color: '#3B82F6' },
];

const MAP_INCIDENT_CONFIG = {
  fire:     { color: '#EF4444' },
  medical:  { color: '#3B82F6' },
  accident: { color: '#F59E0B' },
  rescue:   { color: '#8B5CF6' },
};

const SECTOR_STATS = [
  { type: 'fire',     label: 'Fire',    count: 1, status: 'Code Red', color: '#EF4444' },
  { type: 'medical',  label: 'Medical', count: 2, status: 'Code 2',   color: '#3B82F6' },
  { type: 'accident', label: 'Road',    count: 0, status: 'Clear',    color: '#94A3B8' },
  { type: 'rescue',   label: 'Rescue',  count: 1, status: 'Code 2',   color: '#8B5CF6' },
];

const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',             icon: Squares2X2Icon          },
  { id: 'dispatches', label: 'Active Dispatches',    icon: BellAlertIcon           },
  { id: 'responders', label: 'Responder Management', icon: UserGroupIcon           },
  { id: 'chat',       label: 'CURA Chat',            icon: ChatBubbleLeftRightIcon },
  { id: 'jurisdiction', label: 'Jurisdiction Map',   icon: MapPinIcon              },
];

const STATION_CATEGORY_COLOR_MAP = {
  fire:      { activeBg: 'bg-red-600',     shadow: 'shadow-red-900/30',     badgeBg: 'bg-white', badgeText: 'text-red-600',     gradientBg: 'bg-gradient-to-b from-red-950 via-red-900 to-slate-950'     },
  medical:   { activeBg: 'bg-blue-600',    shadow: 'shadow-blue-900/30',    badgeBg: 'bg-white', badgeText: 'text-blue-600',    gradientBg: 'bg-gradient-to-b from-blue-950 via-blue-900 to-slate-950'    },
  accidents: { activeBg: 'bg-amber-500',   shadow: 'shadow-amber-900/30',   badgeBg: 'bg-white', badgeText: 'text-amber-500',   gradientBg: 'bg-gradient-to-b from-amber-950 via-amber-900 to-slate-950'  },
  rescue:    { activeBg: 'bg-purple-600',  shadow: 'shadow-purple-900/30',  badgeBg: 'bg-white', badgeText: 'text-purple-600',  gradientBg: 'bg-gradient-to-b from-purple-950 via-purple-900 to-slate-950' },
  overview:  { activeBg: 'bg-emerald-600', shadow: 'shadow-emerald-900/30', badgeBg: 'bg-white', badgeText: 'text-emerald-600', gradientBg: 'bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950' },
  default:   { activeBg: 'bg-emerald-600', shadow: 'shadow-emerald-900/30', badgeBg: 'bg-white', badgeText: 'text-emerald-600', gradientBg: 'bg-gradient-to-b from-slate-900 to-slate-950' },
};

const INCIDENT_NAV_ITEMS = [
  { id: 'fire',      label: 'Fire Incidents',      icon: FireIcon,        category: 'fire'      },
  { id: 'medical',   label: 'Medical Emergencies', icon: HeartIcon,       category: 'medical'   },
  { id: 'accidents', label: 'Road Accidents',      icon: TruckIcon,       category: 'accidents' },
  { id: 'rescue',    label: 'Rescue Operations',   icon: ShieldCheckIcon, category: 'rescue'    },
];

const INCIDENT_TAB_IDS = ['fire', 'medical', 'accidents', 'rescue'];

const TAB_CATEGORY_MAP = {
  overview: 'overview', dispatches: 'overview', responders: 'overview', jurisdiction: 'overview',
  fire: 'fire', medical: 'medical', accidents: 'accidents', rescue: 'rescue',
};

const INCIDENT_LABELS = {
  fire: 'Fire Incidents', medical: 'Medical Emergencies',
  accidents: 'Road Accidents', rescue: 'Rescue Operations',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeConfig = {
  fire:    { icon: FireIcon,          color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700 border-red-200'       },
  medical: { icon: HeartIcon,         color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700 border-blue-200'    },
  accident:{ icon: TruckIcon,         color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  rescue:  { icon: ShieldCheckIcon,   color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  command: { icon: BuildingOfficeIcon,color: 'text-slate-500',  bg: 'bg-slate-100', border: 'border-slate-200',  badge: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const fleetStatusConfig = {
  available:   { label: 'Available',   dot: 'bg-emerald-500',            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  deployed:    { label: 'Deployed',    dot: 'bg-blue-500 animate-pulse', badge: 'bg-blue-50 text-blue-700 border-blue-200'          },
  maintenance: { label: 'Maintenance', dot: 'bg-amber-500',              badge: 'bg-amber-50 text-amber-700 border-amber-200'       },
};

const priorityConfig = {
  'CODE RED': 'bg-red-600 text-white',
  'CODE 2':   'bg-amber-500 text-white',
  'CODE 1':   'bg-blue-500 text-white',
};

const confidenceColor = (score) => {
  if (score >= 90) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  if (score >= 78) return { bar: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200'    };
  return                   { bar: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50 border-red-200'        };
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function StationDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dispatchQueue, setDispatchQueue] = useState(INITIAL_DISPATCH_QUEUE);
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [toast, setToast] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Chat state
  const [selectedContact, setSelectedContact] = useState(CHAT_CONTACTS[0]);
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [chatEscalationActive, setChatEscalationActive] = useState(false);
  const [chatBannerVisible, setChatBannerVisible] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedContact, activeTab]);

  useEffect(() => {
    if (chatEscalationActive) {
      setChatBannerVisible(true);
      const t1 = setTimeout(() => {
        setChatMessages(prev => ({ ...prev, 1: [...(prev[1] || []), STATION_AI_ESCALATION_MESSAGES[0]] }));
      }, 400);
      const t2 = setTimeout(() => {
        setChatMessages(prev => ({
          ...prev,
          1: [...(prev[1] || []), STATION_AI_TO_CENTRAL],
          2: [...(prev[2] || []), STATION_AI_ESCALATION_MESSAGES[1]],
        }));
      }, 1100);
      const t3 = setTimeout(() => {
        setChatMessages(prev => ({ ...prev, 1: [...(prev[1] || []), STATION_AI_ESCALATION_MESSAGES[2]] }));
      }, 1900);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setChatBannerVisible(false);
      setChatMessages(INITIAL_CHAT_MESSAGES);
    }
  }, [chatEscalationActive]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAcceptDispatch = (dispatch) => {
    const available = fleet.find(v =>
      v.status === 'available' &&
      (dispatch.type === 'medical' ? v.type === 'medical' : v.type === 'fire' || v.type === 'rescue')
    ) || fleet.find(v => v.status === 'available');

    setDispatchQueue(prev => prev.filter(d => d.id !== dispatch.id));
    if (available) {
      setFleet(prev => prev.map(v =>
        v.id === available.id ? { ...v, status: 'deployed', location: dispatch.location } : v
      ));
    }
    showToast(`${dispatch.id} accepted — ${available?.label ?? 'unit'} deployed.`, 'success');
  };

  const handleDeclineDispatch = (id) => {
    setDispatchQueue(prev => prev.filter(d => d.id !== id));
    showToast('Dispatch declined. Routing to next available station.', 'warn');
  };

  const handleSendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    const newMsg = {
      id: Date.now(),
      sender: 'station',
      name: 'Station 4 — Mabolo',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    setChatMessages(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }));
    setChatInput('');
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  const availableCount = fleet.filter(v => v.status === 'available').length;
  const deployedCount  = fleet.filter(v => v.status === 'deployed').length;
  const onDutyCount    = PERSONNEL.filter(p => p.status !== 'off-shift').length;
  const unreadCount    = (contactId) => (chatMessages[contactId] || []).filter(m => !m.read && m.sender === 'contact').length;
  const filteredContacts = CHAT_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(chatSearch.toLowerCase())
  );
  const onlineContactCount = CHAT_CONTACTS.filter(c => c.status === 'online').length;

  const isIncidentTab = INCIDENT_TAB_IDS.includes(activeTab);
  const activeCategory = TAB_CATEGORY_MAP[activeTab] || 'default';
  const overviewExpanded = activeTab === 'overview' || isIncidentTab;

  const BADGE_ACCENT = {
    fire:      { border: 'border-red-500/20',     bg: 'bg-red-500/10',     dot: 'bg-red-400',     text: 'text-red-300'     },
    medical:   { border: 'border-blue-500/20',    bg: 'bg-blue-500/10',    dot: 'bg-blue-400',    text: 'text-blue-300'    },
    accidents: { border: 'border-amber-500/20',   bg: 'bg-amber-500/10',   dot: 'bg-amber-400',   text: 'text-amber-300'   },
    rescue:    { border: 'border-purple-500/20',  bg: 'bg-purple-500/10',  dot: 'bg-purple-400',  text: 'text-purple-300'  },
    overview:  { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400', text: 'text-emerald-300' },
    default:   { border: 'border-slate-500/20',   bg: 'bg-slate-500/10',   dot: 'bg-slate-400',   text: 'text-slate-300'   },
  };
  const badgeAccent = BADGE_ACCENT[activeCategory] || BADGE_ACCENT.default;
  const incidentDispatchCount = (tabId) => {
    const typeMap = { fire: 'fire', medical: 'medical', accidents: 'accident', rescue: 'rescue' };
    return dispatchQueue.filter(d => d.type === typeMap[tabId]).length;
  };

  const kpiCards = [
    { label: 'Available Fleet',    value: `${availableCount}/${fleet.length}`, sub: 'units ready at base',        icon: TruckIcon,  accentHex: '#10B981' },
    { label: 'Active Deployments', value: deployedCount,                        sub: 'units currently in field',   icon: SignalIcon, accentHex: '#3B82F6' },
    { label: 'Avg Dispatch Time',  value: '1m 45s',                             sub: 'rolling 24-hour average',    icon: ClockIcon,  accentHex: '#F59E0B' },
    {
      label: 'Pending AI Alerts',
      value: dispatchQueue.length,
      sub: 'awaiting station response',
      icon: BoltIcon,
      accentHex: dispatchQueue.length > 0 ? '#EF4444' : '#10B981',
      pulse: dispatchQueue.length > 0,
    },
  ];

  // ── Render helpers ──────────────────────────────────────────────────────────

  const renderDispatchQueue = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Dispatch Queue</h3>
          <p className="text-xs text-slate-500 mt-0.5">AI-verified · Auto-prioritized by risk score</p>
        </div>
        <div className="flex items-center space-x-2">
          {dispatchQueue.length > 0 && (
            <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-full animate-pulse">
              {dispatchQueue.length} pending
            </span>
          )}
          <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowPathIcon className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {dispatchQueue.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <CheckCircleSolid className="w-12 h-12 text-emerald-400 mb-3" />
          <p className="text-slate-600 font-semibold">Queue Clear</p>
          <p className="text-slate-400 text-sm mt-1">No pending dispatches. Station is standby-ready.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {dispatchQueue.map((d) => {
            const tc = typeConfig[d.type] || typeConfig.fire;
            const IconComp = tc.icon;
            const cc = confidenceColor(d.aiConfidence);
            return (
              <div
                key={d.id}
                className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${
                  d.priority === 'CODE RED' ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-start space-x-3">
                    <div className={`w-9 h-9 rounded-lg ${tc.bg} ${tc.border} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <IconComp className={`w-5 h-5 ${tc.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${priorityConfig[d.priority]}`}>{d.priority}</span>
                        <span className="text-xs text-slate-400 font-mono">{d.id}</span>
                        <span className="text-xs text-slate-400">{d.reported}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 mt-1">{d.title}</p>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <MapPinIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <p className="text-xs text-slate-500">{d.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`rounded-lg px-3 py-2 border mb-3 ${cc.bg}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">AI Confidence</span>
                    <span className={`text-xs font-black ${cc.text}`}>{d.aiConfidence}%</span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-1.5 mb-2">
                    <div className={`h-1.5 rounded-full ${cc.bar} transition-all duration-700`} style={{ width: `${d.aiConfidence}%` }} />
                  </div>
                  <p className="text-xs text-slate-600 italic">{d.aiNote}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    Requires <span className="font-bold text-slate-700">{d.requiredUnits}</span> unit{d.requiredUnits > 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDeclineDispatch(d.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptDispatch(d)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${
                        d.priority === 'CODE RED' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                      }`}
                    >
                      Accept & Deploy
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderFleet = () => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Fleet Status</h3>
          <p className="text-xs text-slate-500">{availableCount} available · {deployedCount} deployed</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {fleet.map((v) => {
          const sc = fleetStatusConfig[v.status];
          const tc = typeConfig[v.type] || typeConfig.fire;
          const IconComp = tc.icon;
          return (
            <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${tc.bg} flex items-center justify-center`}>
                  <IconComp className={`w-4 h-4 ${tc.color}`} />
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${sc.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 leading-tight">{v.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{v.location}</p>
              {v.crew > 0 && <p className="text-xs text-slate-500 mt-0.5">{v.crew} crew aboard</p>}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRoster = () => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Shift Roster</h3>
          <p className="text-xs text-slate-500">Shift A · 06:00–18:00 · {onDutyCount} active</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {PERSONNEL.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${p.status === 'deployed' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <UserCircleIcon className={`w-5 h-5 ${p.status === 'deployed' ? 'text-blue-500' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{p.name}</p>
                <p className="text-xs text-slate-400">{p.rank}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {p.unit && (
                <span className="text-xs font-mono text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">{p.unit}</span>
              )}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === 'deployed' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {p.status === 'deployed' ? 'Deployed' : 'On Duty'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Station Health</h3>
          <div className="space-y-3">
            {[
              { label: 'Fleet Readiness',    value: `${Math.round((availableCount / fleet.length) * 100)}%`, bar: Math.round((availableCount / fleet.length) * 100), color: 'bg-emerald-500' },
              { label: 'Personnel On-Duty',  value: `${onDutyCount}/${PERSONNEL.length}`,                    bar: Math.round((onDutyCount / PERSONNEL.length) * 100),  color: 'bg-blue-500'    },
              { label: 'AI Alert Response',  value: '92%',   bar: 92,   color: 'bg-emerald-500' },
              { label: 'System Uptime',      value: '99.9%', bar: 99.9, color: 'bg-emerald-500' },
            ].map(({ label, value, bar, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-bold text-slate-800">{value}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${bar}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  a.type === 'alert' ? 'bg-red-500' : a.type === 'deploy' ? 'bg-blue-500' : a.type === 'warn' ? 'bg-amber-500' : 'bg-slate-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-relaxed">{a.text}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">{renderFleet()}</div>
    </div>
  );

  // ── CURA Chat ─────────────────────────────────────────────────────────────────

  const renderChat = () => {
    const currentMessages = chatMessages[selectedContact.id] || [];

    return (
      <div className="h-full flex flex-col overflow-hidden bg-slate-950">

        {/* AI Escalation Banner */}
        {chatBannerVisible && (
          <div className="flex-shrink-0 bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b-2 border-red-500 px-6 py-4 flex items-start justify-between z-20 shadow-2xl shadow-red-900/50">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mt-0.5 shadow-lg shadow-red-500/40 animate-pulse">
                <ShieldExclamationIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-1.5">
                  <span className="text-xs font-black text-red-300 uppercase tracking-widest">⚠ AI DETECTION — CRITICAL ESCALATION ACTIVE</span>
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-black rounded-full animate-pulse">LIVE</span>
                  <span className="px-2 py-0.5 bg-red-900 text-red-300 text-xs font-bold rounded-full border border-red-700">Edge Node</span>
                </div>
                <p className="text-white font-semibold text-sm leading-relaxed">
                  Fire escalation detected at <span className="text-red-300 font-black">Ayala Center Cebu</span>.
                  Structural breach probability: <span className="text-red-300 font-black">78%</span>.
                  Central Command notified. Mutual aid in progress.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-4 text-xs">
                  {[
                    { label: 'Central Command alerted', done: true },
                    { label: 'Station 3 mutual aid dispatched', done: true },
                    { label: 'DRRMO evacuation protocol active', done: true },
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
              onClick={() => setChatBannerVisible(false)}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-800/60 transition-colors ml-6 mt-0.5"
            >
              <XMarkIcon className="w-5 h-5 text-red-400" />
            </button>
          </div>
        )}

        {/* Main Split Pane */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left Pane — Contacts */}
          <div className="w-72 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">

            {/* Left header */}
            <div className="px-4 pt-5 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide">Station Comms</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{onlineContactCount} of {CHAT_CONTACTS.length} contacts online</p>
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
                  placeholder="Search contacts..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Contact entries */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((contact) => {
                const isSelected = selectedContact.id === contact.id;
                const isAlertContact = chatEscalationActive && contact.isAlert;
                const unread = unreadCount(contact.id);

                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full px-4 py-3.5 flex items-start space-x-3 text-left transition-all duration-200 border-b border-slate-800/60 border-l-2 ${
                      isSelected
                        ? isAlertContact
                          ? 'bg-red-950/40 border-l-red-500'
                          : 'bg-slate-800 border-l-emerald-500'
                        : isAlertContact
                          ? 'bg-red-950/20 border-l-transparent hover:bg-red-950/30'
                          : 'border-l-transparent hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isAlertContact ? 'bg-red-900/50' : 'bg-slate-800'}`}>
                        <BuildingOfficeIcon className={`w-5 h-5 ${isAlertContact ? 'text-red-400' : contact.accentColor}`} />
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                        contact.status === 'online' ? 'bg-emerald-500' :
                        contact.status === 'busy'   ? 'bg-amber-500'   : 'bg-slate-600'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-semibold truncate ${isAlertContact ? 'text-red-300' : 'text-slate-100'}`}>
                          {contact.name}
                        </span>
                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          {isAlertContact && <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400 animate-pulse" />}
                          <span className="text-xs text-slate-600">{contact.lastTime}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{contact.lastMessage}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-700">{contact.unit}</span>
                        {unread > 0 && (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isAlertContact ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dev Tools */}
            <div className={`px-4 py-4 border-t transition-colors duration-500 ${chatEscalationActive ? 'border-red-800/50 bg-red-950/20' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Dev Tools</span>
                <span className="text-xs text-slate-700">Prototype</span>
              </div>
              <button
                onClick={() => setChatEscalationActive(prev => !prev)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
                  chatEscalationActive
                    ? 'bg-red-950/60 border-red-600/50 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BoltIcon className={`w-4 h-4 ${chatEscalationActive ? 'text-red-400' : 'text-slate-600'}`} />
                  <span>Simulate AI Escalation</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${chatEscalationActive ? 'bg-red-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${chatEscalationActive ? 'left-4' : 'left-0.5'}`} />
                </div>
              </button>
              {chatEscalationActive && (
                <p className="text-xs text-red-500/70 text-center mt-1.5">AI escalation mode active</p>
              )}
            </div>
          </div>

          {/* Right Pane — Chat Window */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${chatEscalationActive ? 'shadow-[inset_0_0_40px_rgba(239,68,68,0.06)]' : ''}`}>

            {/* Chat header */}
            <div className={`flex-shrink-0 px-6 py-4 border-b flex items-center justify-between transition-all duration-500 ${
              chatEscalationActive
                ? 'bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border-red-800/50'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selectedContact.isAlert
                    ? 'bg-red-900/60 border border-red-700/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}>
                  <BuildingOfficeIcon className={`w-5 h-5 ${selectedContact.isAlert ? 'text-red-400' : selectedContact.accentColor}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-white">{selectedContact.name}</h3>
                    {chatEscalationActive && selectedContact.isAlert && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-black bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        <span>ESCALATION</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedContact.status === 'online' ? 'bg-emerald-500' :
                      selectedContact.status === 'busy'   ? 'bg-amber-500'   : 'bg-slate-600'
                    }`} />
                    <span className="text-xs text-slate-500">
                      {selectedContact.status === 'online' ? 'Online' : selectedContact.status === 'busy' ? 'Busy' : 'Offline'} · {selectedContact.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {chatEscalationActive && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/15 border border-red-500/30 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black text-red-400 tracking-widest">CODE RED</span>
                  </div>
                )}
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg">
                  <SignalIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-medium text-slate-400">Encrypted</span>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-slate-950">
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
                  <p className="text-slate-600 text-xs mt-1">Start a transmission to this contact</p>
                </div>
              )}

              {currentMessages.map((msg) => {
                const isStation = msg.sender === 'station';
                const isAI      = msg.sender === 'ai';

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
                  <div key={msg.id} className={`flex ${isStation ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2 max-w-md ${isStation ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${isStation ? 'bg-emerald-700' : 'bg-slate-700'}`}>
                        <UserCircleIcon className="w-5 h-5 text-white/80" />
                      </div>
                      <div>
                        <p className={`text-xs text-slate-600 mb-1 ${isStation ? 'text-right' : 'text-left'}`}>{msg.name}</p>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          isStation
                            ? 'bg-emerald-700 text-white rounded-br-sm'
                            : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <p className={`text-xs text-slate-600 mt-1 font-mono ${isStation ? 'text-right' : 'text-left'}`}>
                          {msg.time}
                          {isStation && <span className="ml-1 text-emerald-500">✓✓</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div className={`flex-shrink-0 px-6 py-4 border-t transition-all duration-500 ${chatEscalationActive ? 'bg-slate-900 border-red-800/40' : 'bg-slate-900 border-slate-800'}`}>
              {chatEscalationActive && (
                <div className="flex items-center space-x-2 mb-3 px-3 py-2 bg-red-950/40 border border-red-800/40 rounded-lg">
                  <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span className="text-xs text-red-400/80 font-medium">
                    AI AUTO-DISPATCH ACTIVE — Manual commands still accepted. All transmissions are logged.
                  </span>
                </div>
              )}
              <div className="flex items-end gap-3">
                <div className={`flex-1 border rounded-xl px-4 py-3 transition-all duration-300 focus-within:ring-1 ${
                  chatEscalationActive
                    ? 'bg-slate-800 border-slate-700 focus-within:border-red-500 focus-within:ring-red-500/20'
                    : 'bg-slate-800 border-slate-700 focus-within:border-emerald-500 focus-within:ring-emerald-500/20'
                }`}>
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder={`Transmit to ${selectedContact.name}...`}
                    rows={1}
                    className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-600 resize-none focus:outline-none leading-relaxed"
                  />
                </div>
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    chatInput.trim()
                      ? chatEscalationActive
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 hover:scale-105 active:scale-95'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-700 mt-2">Enter to transmit · Shift+Enter for new line · End-to-end encrypted channel</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Local Routing Module ──────────────────────────────────────────────────────

  // ── Jurisdiction Map ─────────────────────────────────────────────────────────

  const renderJurisdictionMap = () => (
    <div className="relative h-full overflow-hidden" style={{ minHeight: 0 }}>

      {/* ── Map Base — dark tactical grid ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#0D1B2A',
          backgroundImage:
            'linear-gradient(rgba(71,85,105,0.18) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(71,85,105,0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Street / Block SVG layer ── */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ pointerEvents: 'none' }}>
        {/* Major arterials */}
        <line x1="0"    y1="38%" x2="100%" y2="38%" stroke="rgba(148,163,184,0.22)" strokeWidth="7" />
        <line x1="0"    y1="62%" x2="100%" y2="62%" stroke="rgba(148,163,184,0.16)" strokeWidth="5" />
        <line x1="32%"  y1="0"   x2="32%"  y2="100%" stroke="rgba(148,163,184,0.22)" strokeWidth="7" />
        <line x1="62%"  y1="0"   x2="62%"  y2="100%" stroke="rgba(148,163,184,0.16)" strokeWidth="5" />
        {/* Secondary streets */}
        <line x1="0"    y1="20%" x2="100%" y2="20%" stroke="rgba(148,163,184,0.09)" strokeWidth="2.5" />
        <line x1="0"    y1="50%" x2="100%" y2="50%" stroke="rgba(148,163,184,0.09)" strokeWidth="2.5" />
        <line x1="0"    y1="77%" x2="100%" y2="77%" stroke="rgba(148,163,184,0.09)" strokeWidth="2.5" />
        <line x1="15%"  y1="0"   x2="15%"  y2="100%" stroke="rgba(148,163,184,0.09)" strokeWidth="2.5" />
        <line x1="47%"  y1="0"   x2="47%"  y2="100%" stroke="rgba(148,163,184,0.09)" strokeWidth="2.5" />
        <line x1="78%"  y1="0"   x2="78%"  y2="100%" stroke="rgba(148,163,184,0.09)" strokeWidth="2.5" />
        {/* Diagonal — Gorordo Ave */}
        <line x1="18%"  y1="0"   x2="66%"  y2="100%" stroke="rgba(148,163,184,0.14)" strokeWidth="4" />
        {/* Block fills */}
        <rect x="32%" y="38%" width="30%" height="24%" fill="rgba(100,116,139,0.05)" />
        <rect x="0%"  y="20%" width="32%" height="18%" fill="rgba(100,116,139,0.04)" />
        <rect x="62%" y="0%"  width="38%" height="38%" fill="rgba(100,116,139,0.04)" />
        {/* Station base marker */}
        <circle cx="12%" cy="82%" r="18" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" strokeDasharray="4,3" />
        {/* Street labels */}
        <text x="2%"   y="36.5%" fill="rgba(148,163,184,0.45)" fontSize="9" fontFamily="monospace" fontWeight="bold">CARDINAL ROSALES AVE</text>
        <text x="2%"   y="60.5%" fill="rgba(148,163,184,0.35)" fontSize="8" fontFamily="monospace">JUAN LUNA AVE</text>
        <text x="33%"  y="15%"   fill="rgba(148,163,184,0.45)" fontSize="9" fontFamily="monospace" fontWeight="bold">IT PARK AVE</text>
        <text x="63%"  y="15%"   fill="rgba(148,163,184,0.35)" fontSize="8" fontFamily="monospace">ESCARIO ST</text>
        <text x="43%"  y="72%"   fill="rgba(148,163,184,0.35)" fontSize="8" fontFamily="monospace" transform="rotate(-62, 390, 415)">GORORDO AVE</text>
      </svg>

      {/* ── District Watermark ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <p
          className="font-black uppercase tracking-[0.35em] text-center"
          style={{ fontSize: 'clamp(20px, 4vw, 52px)', color: 'rgba(255,255,255,0.025)', lineHeight: 1.1 }}
        >
          MABOLO<br />DISTRICT
        </p>
      </div>

      {/* ── Incident Pins ── */}
      {MAP_INCIDENTS.map((pin) => {
        const cfg = MAP_INCIDENT_CONFIG[pin.type] || MAP_INCIDENT_CONFIG.fire;
        const isBottom = pin.y > 60;
        return (
          <div
            key={pin.id}
            className="absolute z-10"
            style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* Outer pulse ring */}
            <div className="relative flex items-center justify-center w-6 h-6">
              <span
                className="absolute inline-flex w-6 h-6 rounded-full animate-ping opacity-60"
                style={{ backgroundColor: cfg.color }}
              />
              {/* Inner dot */}
              <span
                className="relative inline-flex w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: cfg.color, boxShadow: `0 0 12px ${cfg.color}99` }}
              />
            </div>
            {/* Label card — flips above if near bottom */}
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-lg shadow-2xl border whitespace-nowrap z-20"
              style={{
                [isBottom ? 'bottom' : 'top']: '100%',
                [isBottom ? 'marginBottom' : 'marginTop']: '6px',
                backgroundColor: 'rgba(10,18,32,0.95)',
                borderColor: `${cfg.color}55`,
                borderLeftColor: cfg.color,
                borderLeftWidth: 3,
                padding: '5px 10px',
              }}
            >
              <p className="text-white text-[11px] font-bold leading-tight">{pin.label}</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: `${cfg.color}CC` }}>{pin.detail}</p>
            </div>
          </div>
        );
      })}

      {/* ── Deployed Unit Markers ── */}
      {MAP_UNITS.map((unit) => (
        <div
          key={unit.id}
          className="absolute z-20"
          style={{ left: `${unit.x}%`, top: `${unit.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative flex items-center justify-center">
            {unit.status === 'en-route' && (
              <span
                className="absolute w-5 h-5 rounded-sm rotate-45 animate-ping opacity-50"
                style={{ backgroundColor: unit.color }}
              />
            )}
            <div
              className="relative w-4 h-4 rounded-sm rotate-45 border-2 border-white shadow-xl"
              style={{ backgroundColor: unit.color, boxShadow: `0 0 10px ${unit.color}88` }}
            />
          </div>
          <div
            className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap shadow"
            style={{ backgroundColor: 'rgba(10,18,32,0.9)', color: unit.color, borderColor: `${unit.color}44` }}
          >
            {unit.label}
          </div>
        </div>
      ))}

      {/* ── Station Base Marker ── */}
      <div
        className="absolute z-10"
        style={{ left: '12%', top: '82%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center" style={{ boxShadow: '0 0 14px #10B98166' }}>
          <BuildingOfficeIcon className="w-3 h-3 text-white" />
        </div>
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-black px-2 py-0.5 rounded border whitespace-nowrap shadow" style={{ backgroundColor: 'rgba(10,18,32,0.9)', color: '#34D399', borderColor: '#10B98144' }}>
          STN 4 BASE
        </div>
      </div>

      {/* ── TOP-LEFT: Station badge ── */}
      <div className="absolute left-4 top-4 z-30">
        <div
          className="rounded-xl px-4 py-2.5 shadow-2xl border border-emerald-700/40"
          style={{ backgroundColor: 'rgba(10,46,26,0.97)' }}
        >
          <div className="flex items-center space-x-2 mb-0.5">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-black text-emerald-300 tracking-wide">STATION 4 — MABOLO</span>
          </div>
          <p className="text-[10px] text-slate-500">Jurisdiction · 4.2 km² coverage area</p>
        </div>
      </div>

      {/* ── RIGHT SIDE PANEL OVERLAY ── */}
      <div
        className="absolute right-4 top-4 bottom-10 w-68 flex flex-col gap-3 overflow-y-auto z-30"
        style={{ width: '264px' }}
      >

        {/* Sector header */}
        <div
          className="rounded-xl px-4 py-3 shadow-2xl border border-slate-700/50"
          style={{ backgroundColor: 'rgba(15,23,42,0.97)' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-white uppercase tracking-widest">Mabolo Sector</p>
            <span className="text-xs font-mono text-slate-500">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Active Incidents · Station 4 Jurisdiction</p>
        </div>

        {/* Incident counts */}
        <div
          className="rounded-xl overflow-hidden shadow-2xl border border-slate-700/50"
          style={{ backgroundColor: 'rgba(15,23,42,0.97)' }}
        >
          <div className="px-4 py-2 border-b border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Incidents</p>
          </div>
          {SECTOR_STATS.map((stat, i) => (
            <div
              key={stat.type}
              className={`flex items-center justify-between px-4 py-3 ${i < SECTOR_STATS.length - 1 ? 'border-b border-slate-800/60' : ''}`}
              style={{ borderLeft: `3px solid ${stat.count > 0 ? stat.color : 'transparent'}` }}
            >
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stat.count > 0 ? stat.color : '#334155' }}
                />
                <span className="text-sm font-semibold text-slate-200">{stat.label}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-medium" style={{ color: stat.count > 0 ? `${stat.color}99` : '#475569' }}>
                  {stat.status}
                </span>
                <span
                  className="text-xl font-black w-5 text-right leading-none"
                  style={{ color: stat.count > 0 ? stat.color : '#334155' }}
                >
                  {stat.count}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Deployed units */}
        <div
          className="rounded-xl overflow-hidden shadow-2xl border border-slate-700/50"
          style={{ backgroundColor: 'rgba(15,23,42,0.97)' }}
        >
          <div className="px-4 py-2 border-b border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deployed Station Units</p>
          </div>
          {MAP_UNITS.map((unit, i) => (
            <div
              key={unit.id}
              className={`px-4 py-3 ${i < MAP_UNITS.length - 1 ? 'border-b border-slate-800/60' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-3 h-3 rounded-sm rotate-45 flex-shrink-0"
                    style={{ backgroundColor: unit.color }}
                  />
                  <span className="text-sm font-bold text-white">{unit.label}</span>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    color: unit.color,
                    backgroundColor: `${unit.color}18`,
                    borderColor: `${unit.color}40`,
                  }}
                >
                  {unit.status === 'on-scene' ? 'On Scene' : 'En Route'}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-600">{unit.coords}</p>
            </div>
          ))}
          {/* Station base row */}
          <div className="px-4 py-3 border-t border-slate-800/60">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-emerald-500" />
                <span className="text-sm font-bold text-white">FT-05 · LT-01 · RV-02</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-emerald-400 border-emerald-800/50" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                At Base
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-600">10°18′49"N  123°53′55"E</p>
          </div>
        </div>

        {/* Legend */}
        <div
          className="rounded-xl px-4 py-3 shadow-2xl border border-slate-700/50"
          style={{ backgroundColor: 'rgba(15,23,42,0.97)' }}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Legend</p>
          <div className="space-y-2">
            {[
              { color: '#EF4444', label: 'Fire Incident' },
              { color: '#3B82F6', label: 'Medical Emergency' },
              { color: '#F59E0B', label: 'Road Accident' },
              { color: '#8B5CF6', label: 'Rescue Operation' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center space-x-2.5">
                <div className="relative flex items-center justify-center w-3.5 h-3.5">
                  <span className="absolute w-3.5 h-3.5 rounded-full opacity-40" style={{ backgroundColor: color }} />
                  <span className="relative w-2.5 h-2.5 rounded-full border border-white/40" style={{ backgroundColor: color }} />
                </div>
                <span className="text-[11px] text-slate-400">{label}</span>
              </div>
            ))}
            <div className="border-t border-slate-800/60 pt-2 flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-sm rotate-45 flex-shrink-0 bg-emerald-500 border border-white/30" />
              <span className="text-[11px] text-slate-400">Deployed Unit</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-emerald-500 border border-white/30" />
              <span className="text-[11px] text-slate-400">Station Base</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATUS BAR ── */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 py-2 flex items-center space-x-5 border-t z-30"
        style={{ backgroundColor: 'rgba(10,18,32,0.92)', borderColor: 'rgba(71,85,105,0.3)' }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-400">CURA Edge Node Active</span>
        </div>
        <span className="text-slate-700 text-xs">|</span>
        <span className="text-[11px] text-slate-500">Mabolo District · Cebu City · 4 incidents tracked</span>
        <span className="text-slate-700 text-xs">|</span>
        <div className="flex items-center space-x-4 ml-auto">
          {SECTOR_STATS.filter(s => s.count > 0).map(s => (
            <div key={s.type} className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[11px] font-semibold" style={{ color: s.color }}>{s.count} {s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Incident Type View (Map Dashboard) ───────────────────────────────────────

  const renderIncidentView = (tabId) => {
    const typeMap = { fire: 'fire', medical: 'medical', accidents: 'accident', rescue: 'rescue' };
    const filtered = dispatchQueue.filter(d => d.type === typeMap[tabId]);
    const label = INCIDENT_LABELS[tabId];

    const cfg = {
      fire:      { gradient: 'from-red-700 via-red-600 to-red-700',       sub: 'text-red-200',    valColor: 'text-red-700',    valBg: 'bg-red-50',    valBorder: 'border-red-200',    dot: 'bg-red-500',    icon: FireIcon,        kpiLabel: 'Active Fires',     kpiGrad: 'from-red-50 to-red-100',       kpiBorder: 'border-red-200',    kpiText: 'text-red-600',    kpiVal: 'text-red-700'    },
      medical:   { gradient: 'from-blue-700 via-blue-600 to-blue-700',     sub: 'text-blue-200',   valColor: 'text-blue-700',   valBg: 'bg-blue-50',   valBorder: 'border-blue-200',   dot: 'bg-blue-500',   icon: HeartIcon,       kpiLabel: 'Critical Cases',   kpiGrad: 'from-blue-50 to-blue-100',     kpiBorder: 'border-blue-200',   kpiText: 'text-blue-600',   kpiVal: 'text-blue-700'   },
      accidents: { gradient: 'from-amber-600 via-amber-500 to-amber-600',  sub: 'text-amber-200',  valColor: 'text-amber-700',  valBg: 'bg-amber-50',  valBorder: 'border-amber-200',  dot: 'bg-amber-500',  icon: TruckIcon,       kpiLabel: 'Active Accidents', kpiGrad: 'from-amber-50 to-amber-100',   kpiBorder: 'border-amber-200',  kpiText: 'text-amber-600',  kpiVal: 'text-amber-700'  },
      rescue:    { gradient: 'from-purple-700 via-purple-600 to-purple-700', sub: 'text-purple-200', valColor: 'text-purple-700', valBg: 'bg-purple-50', valBorder: 'border-purple-200', dot: 'bg-purple-500', icon: ShieldCheckIcon, kpiLabel: 'Active Rescues',   kpiGrad: 'from-purple-50 to-purple-100', kpiBorder: 'border-purple-200', kpiText: 'text-purple-600', kpiVal: 'text-purple-700' },
    }[tabId];

    const Icon = cfg.icon;

    return (
      <div className="h-full flex flex-col overflow-hidden">

        {/* Colored header */}
        <div className={`bg-gradient-to-r ${cfg.gradient} px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 backdrop-blur rounded-xl">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className={`text-xs font-medium tracking-wide ${cfg.sub}`}>Station 4 — Mabolo</div>
              <h2 className="text-lg font-bold text-white leading-tight">{label}</h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-white">Station Online</span>
            </div>
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-lg">
              <div className="text-center border-r border-white/20 pr-4">
                <div className="text-lg font-bold text-white">{filtered.length}</div>
                <div className={`text-xs ${cfg.sub}`}>Pending</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{availableCount}</div>
                <div className={`text-xs ${cfg.sub}`}>Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map + right panel */}
        <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-hidden">

          {/* Map */}
          <div className="flex-1 min-w-0 min-h-0">
            <MapContainer />
          </div>

          {/* Right panel: filtered dispatch queue */}
          <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Panel header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-bold ${cfg.valColor}`}>{label}</h3>
                  <p className="text-xs text-slate-500">Station 4 jurisdiction</p>
                </div>
                {filtered.length > 0 && (
                  <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border ${cfg.valBg} ${cfg.valBorder}`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />
                    <span className={`text-xs font-bold ${cfg.valColor}`}>{filtered.length} pending</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dispatch cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <CheckCircleSolid className="w-10 h-10 text-emerald-400 mb-2" />
                  <p className="text-slate-600 font-semibold text-sm">All Clear</p>
                  <p className="text-slate-400 text-xs mt-1">No active {label.toLowerCase()} in your jurisdiction</p>
                </div>
              ) : (
                filtered.map((d) => {
                  const tc = typeConfig[d.type] || typeConfig.fire;
                  const IconComp = tc.icon;
                  const cc = confidenceColor(d.aiConfidence);
                  return (
                    <div key={d.id} className={`border rounded-xl p-3 shadow-sm ${d.priority === 'CODE RED' ? 'border-red-200 ring-1 ring-red-100 bg-red-50/30' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-start space-x-2.5 mb-2.5">
                        <div className={`w-8 h-8 rounded-lg ${tc.bg} ${tc.border} border flex items-center justify-center flex-shrink-0`}>
                          <IconComp className={`w-4 h-4 ${tc.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-black px-1.5 py-0.5 rounded ${priorityConfig[d.priority]}`}>{d.priority}</span>
                            <span className="text-xs text-slate-400 font-mono">{d.id}</span>
                            <span className="text-xs text-slate-400">{d.reported}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-0.5 leading-tight">{d.title}</p>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <MapPinIcon className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <p className="text-xs text-slate-500 truncate">{d.location}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`rounded-lg px-2.5 py-1.5 border mb-2.5 ${cc.bg}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">AI Confidence</span>
                          <span className={`text-xs font-black ${cc.text}`}>{d.aiConfidence}%</span>
                        </div>
                        <div className="w-full bg-white/60 rounded-full h-1 mb-1.5">
                          <div className={`h-1 rounded-full ${cc.bar}`} style={{ width: `${d.aiConfidence}%` }} />
                        </div>
                        <p className="text-xs text-slate-600 italic leading-snug">{d.aiNote}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">
                          <span className="font-bold text-slate-700">{d.requiredUnits}</span> unit{d.requiredUnits > 1 ? 's' : ''} needed
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleDeclineDispatch(d.id)} className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
                            Decline
                          </button>
                          <button
                            onClick={() => handleAcceptDispatch(d)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 ${d.priority === 'CODE RED' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                          >
                            Accept & Deploy
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Panel footer */}
            <div className={`p-3 border-t border-slate-200 flex-shrink-0 ${cfg.valBg}`}>
              <div className={`flex items-center justify-between text-xs ${cfg.valColor}`}>
                <div className="flex items-center space-x-1.5">
                  <CheckCircleSolid className="w-3.5 h-3.5" />
                  <span>Station 4 Command Active</span>
                </div>
                <span className="font-semibold">{availableCount} units ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom KPI strip */}
        <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-3">
          <div className="grid grid-cols-4 gap-3">
            <div className={`bg-gradient-to-br ${cfg.kpiGrad} border ${cfg.kpiBorder} rounded-xl p-3`}>
              <p className={`text-xs font-semibold ${cfg.kpiText} uppercase tracking-wide`}>{cfg.kpiLabel}</p>
              <p className={`text-2xl font-bold ${cfg.kpiVal} mt-1`}>{filtered.length}</p>
              <p className={`text-xs mt-1 opacity-70 ${cfg.kpiText}`}>In your jurisdiction</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fleet Available</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{availableCount}/{fleet.length}</p>
              <p className="text-xs text-slate-500 mt-1">Units ready at base</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Response</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">1m 45s</p>
              <p className="text-xs text-slate-500 mt-1">Rolling 24-hour avg</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Personnel</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{onDutyCount}/{PERSONNEL.length}</p>
              <p className="text-xs text-slate-500 mt-1">Active this shift</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Tab Content Router ────────────────────────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':   return renderOverview();
      case 'dispatches': return <div className="max-w-2xl mx-auto h-full">{renderDispatchQueue()}</div>;
      case 'responders': return (
        <div className="flex gap-5 h-full">
          <div className="flex-1 min-w-0 flex flex-col">{renderDispatchQueue()}</div>
          <div className="w-80 flex-shrink-0 space-y-5 overflow-y-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">{renderFleet()}</div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">{renderRoster()}</div>
          </div>
        </div>
      );
      case 'fire':
      case 'medical':
      case 'accidents':
      case 'rescue':     return renderIncidentView(activeTab);
      case 'chat':         return renderChat();
      case 'jurisdiction': return renderJurisdictionMap();
      default:        return null;
    }
  };

  // ── Main Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-slate-100 font-inter overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {toast.type === 'success'
            ? <CheckCircleSolid className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            : <ExclamationSolid  className="w-5 h-5 text-amber-500 flex-shrink-0"  />
          }
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)}>
            <XMarkIcon className="w-4 h-4 opacity-50 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div className={`relative flex-shrink-0 h-full transition-all duration-300 shadow-2xl overflow-hidden bg-slate-950 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>

        {/* Dynamic Background Gradients */}
        {Object.entries(STATION_CATEGORY_COLOR_MAP).map(([category, theme]) => (
          <div
            key={category}
            className={`absolute inset-0 ${theme.gradientBg} transition-opacity duration-700 ease-in-out ${
              activeCategory === category ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col h-full w-full">

          {/* Logo Section */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img src="/cura-logo.png" alt="CURA Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">CURA</h1>
                    <p className="text-xs text-slate-400">Station Portal</p>
                  </div>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="w-10 h-10 flex items-center justify-center mx-auto">
                  <img src="/cura-logo.png" alt="CURA Logo" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(p => !p)}
              className="mt-3 w-full p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 flex items-center justify-center"
            >
              {sidebarCollapsed ? <Bars3Icon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* Station badge */}
          {!sidebarCollapsed && (
            <div className={`mx-3 mt-3 px-3 py-2 rounded-lg border transition-colors duration-700 ${badgeAccent.border} ${badgeAccent.bg}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0 transition-colors duration-700 ${badgeAccent.dot}`} />
                <span className={`text-xs font-semibold truncate transition-colors duration-700 ${badgeAccent.text}`}>Station 4 — Mabolo</span>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

            {/* Overview — expandable to show incident sub-tabs */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`relative w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out group ${
                activeTab === 'overview'
                  ? 'text-white bg-emerald-600 shadow-lg shadow-emerald-900/30'
                  : isIncidentTab
                    ? 'text-white/70 bg-white/10 hover:bg-white/15'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Squares2X2Icon className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left truncate">Overview</span>
                  <ChevronDownIcon className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${overviewExpanded ? 'rotate-180' : ''}`} />
                </>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                  Overview
                </div>
              )}
            </button>

            {/* Incident sub-tabs — slide in when Overview is expanded */}
            {!sidebarCollapsed && overviewExpanded && (
              <div className="ml-3 pl-3 border-l border-slate-700/50 space-y-0.5 mt-1">
                {INCIDENT_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const theme = STATION_CATEGORY_COLOR_MAP[item.category];
                  const isSubActive = activeTab === item.id;
                  const count = incidentDispatchCount(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`relative w-full flex items-center px-2.5 py-2 text-xs font-medium rounded-lg transition-all duration-300 ease-in-out ${
                        isSubActive
                          ? `text-white ${theme.activeBg} shadow-md ${theme.shadow}`
                          : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2.5 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {count > 0 && (
                        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isSubActive ? `${theme.badgeBg} ${theme.badgeText}` : 'bg-slate-600 text-white'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Remaining top-level nav items */}
            {NAV_ITEMS.slice(1).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const dispatchBadge = item.id === 'dispatches' && dispatchQueue.length > 0 ? dispatchQueue.length : null;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out group ${
                    isActive
                      ? 'text-white bg-emerald-600 shadow-lg shadow-emerald-900/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {dispatchBadge && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold transition-colors duration-300 ${
                          isActive ? 'bg-white text-emerald-600' : 'bg-slate-600 text-white'
                        }`}>
                          {dispatchBadge}
                        </span>
                      )}
                    </>
                  )}
                  {sidebarCollapsed && dispatchBadge && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center transition-colors duration-300 ${
                      isActive ? 'bg-white text-emerald-600' : 'bg-slate-600 text-white'
                    }`}>
                      {dispatchBadge}
                    </span>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Section: Station Profile + Emergency Hotline */}
          <div className="p-3 border-t border-slate-700/50 space-y-3">

            {/* Station Profile Block */}
            {!sidebarCollapsed ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all duration-200"
                >
                  <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">Station 4 — Mabolo</div>
                    <div className="text-xs text-slate-400">Fire Substation</div>
                  </div>
                  <Cog6ToothIcon className="w-4 h-4 text-slate-400" />
                </button>
                {showUserMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="p-3 border-b border-slate-700">
                      <div className="text-sm font-semibold text-white">Station 4 — Mabolo</div>
                      <div className="text-xs text-slate-400">Fire Substation</div>
                    </div>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full flex items-center space-x-2 px-3 py-2.5 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-full p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                >
                  <UserCircleIcon className="w-6 h-6 text-slate-400 mx-auto group-hover:text-white" />
                </button>
                {showUserMenu && (
                  <div className="absolute left-full bottom-0 ml-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 w-48">
                    <div className="p-3 border-b border-slate-700">
                      <div className="text-sm font-semibold text-white">Station 4 — Mabolo</div>
                    </div>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full flex items-center space-x-2 px-3 py-2.5 text-red-400 hover:bg-red-900/30 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Emergency Hotline */}
            {!sidebarCollapsed ? (
              <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-medium text-red-300">Emergency</span>
                  </div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-xl font-bold text-white font-mono">911</div>
              </div>
            ) : (
              <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-2 flex items-center justify-center">
                <PhoneIcon className="w-5 h-5 text-red-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar — Overview only */}
        {activeTab === 'overview' && (
          <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
            <div>
              <div className="flex items-center space-x-2">
                <BuildingOfficeIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-800">Station 4 — Mabolo Substation</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">Shift A · 06:00–18:00</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Command Overview</p>
            </div>
            <div className="flex items-center space-x-3">
              {dispatchQueue.length > 0 && (
                <button
                  onClick={() => setActiveTab('dispatches')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <ExclamationSolid className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-red-700">{dispatchQueue.length} Pending Dispatch</span>
                </button>
              )}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700">Station Online</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        )}

        {/* KPI Cards — Overview only */}
        {activeTab === 'overview' && (
          <div className="flex-shrink-0 grid grid-cols-4 gap-4 px-6 py-4 bg-slate-100">
            {kpiCards.map(({ label, value, sub, icon: Icon, accentHex, pulse }) => (
              <div
                key={label}
                className="bg-white border border-slate-200 rounded-xl px-4 py-4 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow"
                style={{ borderLeftWidth: '4px', borderLeftColor: accentHex }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentHex}18` }}>
                  <Icon className={`w-5 h-5 ${pulse ? 'animate-pulse' : ''}`} style={{ color: accentHex }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold truncate">{label}</p>
                  <p className="text-2xl font-black text-slate-800 leading-none mt-1">{value}</p>
                  <p className="text-xs text-slate-400 mt-1 truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <div className={`flex-1 overflow-hidden ${activeTab === 'jurisdiction' || isIncidentTab || activeTab === 'chat' ? '' : 'px-6 pb-6 pt-4'}`}>
          <div className={`h-full ${activeTab === 'jurisdiction' || isIncidentTab || activeTab === 'chat' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
