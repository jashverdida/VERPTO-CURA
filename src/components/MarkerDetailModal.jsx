import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  FireIcon,
  HeartIcon,
  TruckIcon,
  UserGroupIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import CitizenProfileModal from './CitizenProfileModal';

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CFG = {
  fire: {
    Icon: FireIcon,
    gradient: 'from-red-700 to-red-600',
    color: '#DC2626',
    label: 'Fire Incident',
    imageSrc: '/fire-incident.png',
    imageBg: 'from-slate-900 via-red-950 to-orange-950',
    hasImage: true,
    hasAi: true,
  },
  accident: {
    Icon: TruckIcon,
    gradient: 'from-amber-600 to-amber-500',
    color: '#D97706',
    label: 'Road Accident',
    imageSrc: '/vehicular-accident.png',
    imageBg: 'from-slate-900 via-amber-950 to-yellow-900',
    hasImage: true,
    hasAi: true,
  },
  medical: {
    Icon: HeartIcon,
    gradient: 'from-blue-700 to-blue-600',
    color: '#2563EB',
    label: 'Medical Emergency',
    hasImage: false,
    hasAi: false,
  },
  rescue: {
    Icon: UserGroupIcon,
    gradient: 'from-purple-700 to-purple-600',
    color: '#7C3AED',
    label: 'Rescue Operation',
    hasImage: false,
    hasAi: false,
  },
};

// ── Badge helpers ─────────────────────────────────────────────────────────────
function statusBadgeClass(status) {
  const s = (status ?? '').toLowerCase();
  if (s.includes('control') || s.includes('clear') || s.includes('complet'))
    return 'bg-amber-100 text-amber-800 border border-amber-300';
  if (s.includes('going') || s.includes('active') || s.includes('critical'))
    return 'bg-red-100 text-red-800 border border-red-300';
  return 'bg-slate-100 text-slate-700 border border-slate-300';
}

function alarmLabel(report) {
  if (report.type === 'fire') {
    const lvl = report.alarmLevel;
    if (lvl === 'general') return 'GENERAL ALARM';
    const ord = ['', '1ST ALARM', '2ND ALARM', '3RD ALARM', '4TH ALARM', '5TH ALARM'];
    return ord[lvl] ?? `${lvl}TH ALARM`;
  }
  if (report.type === 'medical')  return (report.priority ?? '').toUpperCase();
  if (report.type === 'accident') return (report.severity  ?? '').toUpperCase();
  if (report.type === 'rescue')   return (report.priority  ?? '').toUpperCase();
  return '';
}

function alarmBadgeClass(report) {
  const lvl = report.alarmLevel;
  if (report.type === 'fire') {
    if (lvl === 'general') return 'bg-gray-900 text-white';
    if (lvl >= 4)          return 'bg-red-700 text-white';
    if (lvl === 3)         return 'bg-orange-600 text-white';
    if (lvl === 2)         return 'bg-amber-500 text-white';
    return 'bg-yellow-400 text-gray-900';
  }
  const p = (report.priority ?? report.severity ?? '').toLowerCase();
  if (p === 'critical') return 'bg-red-700 text-white';
  if (p === 'high')     return 'bg-amber-600 text-white';
  return 'bg-slate-500 text-white';
}

// ── Animated confidence bar ───────────────────────────────────────────────────
function ConfidenceBar({ value }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 120); return () => clearTimeout(t); }, [value]);
  const barColor = value >= 88 ? '#10B981' : value >= 70 ? '#F59E0B' : '#EF4444';
  const label    = value >= 88 ? 'High' : value >= 70 ? 'Moderate' : 'Low — Manual Check Advised';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <CpuChipIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">AI Confidence</span>
        </div>
        <span className="text-xs font-bold" style={{ color: barColor }}>{value}% — {label}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${w}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

// ── Reporter card — absolute-positioned avatar so it never gets overlapped ────
const COVER_H = 76; // px
const AVATAR_SIZE = 64; // px — w-16 h-16
const AVATAR_OVERLAP = AVATAR_SIZE / 2; // how much avatar hangs below cover

function ReporterCard({ reporter, typeCfg, onViewProfile }) {
  const { Icon } = typeCfg;
  const initials = `${(reporter.firstName || 'U')[0]}${(reporter.lastName || 'S')[0]}`.toUpperCase();
  const fullName = [reporter.firstName, reporter.middleName, reporter.lastName].filter(Boolean).join(' ');

  return (
    // Wrapper with enough height for cover + avatar overlap + name content
    <div className="relative flex-shrink-0" style={{ paddingBottom: 0 }}>

      {/* ── Green CURA cover ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: COVER_H, backgroundColor: '#0D4A35', borderRadius: '1rem 1rem 0 0' }}
      >
        {/* Orbs */}
        <div className="absolute" style={{ top: -24, right: -18, width: 110, height: 110, borderRadius: '50%', backgroundColor: '#10B981', opacity: 0.18 }} />
        <div className="absolute" style={{ bottom: -32, left: -12, width: 100, height: 100, borderRadius: '50%', backgroundColor: '#10B981', opacity: 0.11 }} />
        {/* CURA brand */}
        <div className="absolute top-3 left-4 flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(52,211,153,0.85)">
            <path d="M17 8C8 10 5.9 16.17 3.82 19.11L5.71 21 7 19.38l.11.11C8.38 20.8 10.06 21.5 12 21.5c4.97 0 9-4.03 9-9S16.97 3.5 12 3.5c-1.09 0-2.14.19-3.1.54.3.3.57.63.8 1C10.49 5.03 11.23 5 12 5c3.86 0 7 3.14 7 7s-3.14 7-7 7c-1.38 0-2.66-.4-3.75-1.07l-.66-.42L7 19l-.96-1.07C7.7 15.44 10.77 12 17 8z"/>
          </svg>
          <span className="text-[10px] font-black tracking-widest" style={{ color: 'rgba(52,211,153,0.85)' }}>CURA</span>
        </div>
      </div>

      {/* ── Avatar — absolutely positioned, centered vertically on the cover boundary ── */}
      <div
        className="absolute left-4 flex items-center gap-3"
        style={{
          top: COVER_H - AVATAR_OVERLAP, // center avatar on cover bottom edge
          zIndex: 20,
        }}
      >
        <div
          className="rounded-full flex items-center justify-center font-black text-white text-xl"
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            backgroundColor: '#10B981',
            border: '3.5px solid white',
            boxShadow: '0 4px 18px rgba(16,185,129,0.4)',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        {/* View Profile pill — vertically centered with avatar */}
        <button
          onClick={onViewProfile}
          className="px-3 py-1.5 rounded-full border text-xs font-semibold text-slate-600 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
          style={{ marginTop: AVATAR_OVERLAP }} // align bottom of pill with bottom of avatar
        >
          View Profile
        </button>
      </div>

      {/* ── Emergency type badge — top-right of white section ── */}
      <div
        className="absolute right-4 flex items-center justify-center rounded-full shadow-lg"
        style={{
          top: COVER_H + 8,
          width: 44,
          height: 44,
          backgroundColor: typeCfg.color,
          zIndex: 10,
        }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* ── White content area — top padding clears the avatar overlap ── */}
      <div
        className="bg-white px-4 pb-4"
        style={{ paddingTop: AVATAR_OVERLAP + 10 }} // clears half-avatar + breathing room
      >
        <div className="text-lg font-extrabold text-slate-900 leading-tight">{fullName}</div>
        {reporter.phone && (
          <div className="flex items-center gap-1.5 mt-1">
            <PhoneIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-500">{reporter.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function MarkerDetailModal({ report, onClose }) {
  const [viewingProfile, setViewingProfile] = useState(false);

  const cfg = TYPE_CFG[report.type] ?? TYPE_CFG.fire;
  const { Icon } = cfg;

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const reporter   = report.reporter;
  const showTriage = (report.type === 'medical' || report.type === 'rescue') && report.triageData?.length > 0;

  return (
    <>
      <style>{`
        @keyframes mrkBackdrop { from{opacity:0} to{opacity:1} }
        @keyframes mrkCard {
          from { opacity:0; transform:scale(0.93) translateY(14px); }
          to   { opacity:1; transform:scale(1)    translateY(0);    }
        }
        .mrk-backdrop { animation: mrkBackdrop 0.18s ease forwards; }
        .mrk-card     { animation: mrkCard 0.26s cubic-bezier(0.34,1.3,0.64,1) forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        className="mrk-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Card — position:relative so absolute children stay inside */}
        <div
          className="mrk-card relative bg-white rounded-2xl shadow-2xl w-full flex flex-col"
          style={{ maxWidth: 420, maxHeight: 'calc(100vh - 2rem)', overflow: 'hidden' }}
          onClick={e => e.stopPropagation()}
        >

          {/* Close button — inside cover, top-right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(0,0,0,0.28)', zIndex: 30 }}
          >
            <XMarkIcon className="w-4 h-4 text-white" />
          </button>

          {/* Reporter card (cover + avatar + name) */}
          {reporter ? (
            <ReporterCard
              reporter={reporter}
              typeCfg={cfg}
              onViewProfile={() => setViewingProfile(true)}
            />
          ) : (
            <div className={`bg-gradient-to-r ${cfg.gradient} px-5 py-4 flex items-center gap-3 flex-shrink-0`}>
              <div className="bg-white/20 rounded-xl p-2">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white/65 text-xs font-medium">{cfg.label}</div>
                <div className="text-white font-bold">{report.title}</div>
              </div>
            </div>
          )}

          {/* ── Scrollable body — all details visible, no toggle ── */}
          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="px-4 py-3 space-y-3">

              {/* Location + time */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-start gap-1.5 flex-1 min-w-0">
                  <MapPinIcon className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600 font-medium leading-tight">{report.location}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                  <ClockIcon className="w-3 h-3" />
                  <span className="text-xs">{report.time}</span>
                </div>
              </div>

              {/* Status + alarm badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(report.status)}`}>
                  {report.status}
                </span>
                {alarmLabel(report) && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${alarmBadgeClass(report)}`}>
                    {alarmLabel(report)}
                  </span>
                )}
              </div>

              {/* Incident image — fire & accident */}
              {cfg.hasImage && (
                <div className="rounded-xl overflow-hidden" style={{ height: 168 }}>
                  <img
                    src={cfg.imageSrc}
                    alt={cfg.label}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className={`w-full h-full bg-gradient-to-br ${cfg.imageBg} items-center justify-center`}
                    style={{ height: 168, display: 'none' }}
                  >
                    <Icon className="w-16 h-16 text-white/20" />
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* AI section — fire/accident */}
              {cfg.hasAi && report.aiConfidence != null && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CpuChipIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">AI Analysis</span>
                  </div>
                  <ConfidenceBar value={report.aiConfidence} />
                  {report.aiNote && (
                    <p className="mt-2 text-xs text-slate-500 italic bg-white rounded-lg px-3 py-2 border border-slate-100 leading-relaxed">
                      "{report.aiNote}"
                    </p>
                  )}
                </div>
              )}

              {/* Fire-specific */}
              {report.type === 'fire' && (
                <div className="space-y-2.5">
                  {report.structureType && (
                    <div className="flex items-center gap-2.5">
                      <div className="bg-red-50 rounded-lg p-1.5 flex-shrink-0">
                        <BuildingOfficeIcon className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Structure Type</div>
                        <div className="text-sm font-semibold text-slate-700">{report.structureType}</div>
                      </div>
                    </div>
                  )}
                  {report.description && (
                    <p className="text-xs text-slate-500 bg-red-50/60 rounded-xl px-3 py-2.5 border border-red-100 leading-relaxed">
                      {report.description}
                    </p>
                  )}
                </div>
              )}

              {/* Accident-specific */}
              {report.type === 'accident' && (
                <div className="space-y-2.5">
                  {report.vehicleType && (
                    <div className="flex items-center gap-2.5">
                      <div className="bg-amber-50 rounded-lg p-1.5 flex-shrink-0">
                        <TruckIcon className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Vehicles Involved</div>
                        <div className="text-sm font-semibold text-slate-700">{report.vehicleType}</div>
                      </div>
                    </div>
                  )}
                  {report.casualties && (
                    <div className="flex items-center gap-2.5">
                      <div className="bg-orange-50 rounded-lg p-1.5 flex-shrink-0">
                        <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Casualties</div>
                        <div className="text-sm font-semibold text-slate-700">{report.casualties}</div>
                      </div>
                    </div>
                  )}
                  {report.description && (
                    <p className="text-xs text-slate-500 bg-amber-50/60 rounded-xl px-3 py-2.5 border border-amber-100 leading-relaxed">
                      {report.description}
                    </p>
                  )}
                </div>
              )}

              {/* Triage Q&A — medical/rescue */}
              {showTriage && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheckIcon className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      {report.type === 'medical' ? 'Triage Assessment' : 'Situation Assessment'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {report.triageData.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-xl border px-3 py-2.5"
                        style={{
                          backgroundColor: i % 2 === 0 ? `${cfg.color}08` : '#F8FAFC',
                          borderColor:     i % 2 === 0 ? `${cfg.color}20` : '#E2E8F0',
                        }}
                      >
                        <div className="text-[11px] font-semibold text-slate-400 mb-0.5">Q: {item.q}</div>
                        <div className="text-sm font-semibold text-slate-700">A: {item.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical vitals */}
              {report.type === 'medical' && report.vitals && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Vital Signs</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: 'HR',   value: report.vitals.hr,   unit: 'bpm'  },
                      { label: 'BP',   value: report.vitals.bp,   unit: 'mmHg' },
                      { label: 'SpO₂', value: report.vitals.spo2, unit: '%'    },
                      { label: 'RR',   value: report.vitals.rr,   unit: '/min' },
                    ].map(v => (
                      <div key={v.label} className="bg-blue-50 rounded-xl p-2 text-center border border-blue-100">
                        <div className="text-[10px] text-blue-400 font-semibold">{v.label}</div>
                        <div className="text-sm font-black text-blue-700 leading-none mt-0.5">{v.value}</div>
                        <div className="text-[9px] text-blue-400 mt-0.5">{v.unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned units */}
              {report.units?.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Assigned Units</div>
                  <div className="flex flex-wrap gap-1.5">
                    {report.units.map(u => (
                      <span key={u} className="bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm">
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom spacer */}
              <div className="h-1" />

            </div>
          </div>
        </div>
      </div>

      {/* Citizen Profile — nested at higher z */}
      {viewingProfile && reporter && (
        <CitizenProfileModal
          citizen={reporter}
          onClose={() => setViewingProfile(false)}
        />
      )}
    </>
  );
}
