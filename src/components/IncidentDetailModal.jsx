import React, { useEffect, useState } from 'react';
import {
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  FireIcon,
  HeartIcon,
  TruckIcon,
  UserGroupIcon,
  CpuChipIcon,
  UserIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CFG = {
  fire: {
    Icon: FireIcon,
    gradient: 'from-red-700 to-red-600',
    imageBg: 'from-slate-900 via-red-950 to-orange-950',
    ImageIcon: FireIcon,
    imageIconClass: 'text-orange-400/40',
    label: 'Fire Incident',
    accentColor: '#DC2626',
    hasAiImage: true,
  },
  accident: {
    Icon: TruckIcon,
    gradient: 'from-amber-600 to-amber-500',
    imageBg: 'from-slate-900 via-amber-950 to-yellow-900',
    ImageIcon: TruckIcon,
    imageIconClass: 'text-amber-400/40',
    label: 'Road Accident',
    accentColor: '#D97706',
    hasAiImage: true,
  },
  medical: {
    Icon: HeartIcon,
    gradient: 'from-blue-700 to-blue-600',
    label: 'Medical Emergency',
    accentColor: '#2563EB',
    hasAiImage: false,
  },
  rescue: {
    Icon: UserGroupIcon,
    gradient: 'from-purple-700 to-purple-600',
    label: 'Rescue Operation',
    accentColor: '#7C3AED',
    hasAiImage: false,
  },
};

// ── Badge helpers (mirrors GoogleMapContainer logic) ──────────────────────────
function statusBadgeClass(status) {
  const s = (status ?? '').toLowerCase();
  if (s.includes('control') || s.includes('clear') || s.includes('complet'))
    return 'bg-amber-100 text-amber-800 border border-amber-300';
  if (s.includes('going') || s.includes('active') || s.includes('critical') || s.includes('code red'))
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
  return report.priority ?? 'ALERT';
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
  if (p === 'critical' || p === 'code red') return 'bg-red-700 text-white';
  if (p === 'high' || p === 'code 2')       return 'bg-amber-600 text-white';
  return 'bg-slate-500 text-white';
}

// ── Animated confidence bar (mounts at 0, transitions to real value) ──────────
function ConfidenceBar({ value, color = '#10B981' }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 80);
    return () => clearTimeout(t);
  }, [value]);

  const label =
    value >= 88 ? 'High Confidence' :
    value >= 70 ? 'Moderate Confidence' :
                  'Low Confidence — Manual Check Advised';

  const barColor =
    value >= 88 ? '#10B981' :
    value >= 70 ? '#F59E0B' :
                  '#EF4444';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <CpuChipIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">AI Confidence Score</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold" style={{ color: barColor }}>{value}%</span>
          <span className="text-xs text-slate-400">{label}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function IncidentDetailModal({ report, onClose }) {
  const cfg = TYPE_CFG[report.type] ?? TYPE_CFG.fire;
  const { Icon } = cfg;

  // Escape key to close
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const displayTime   = report.time ?? report.reported ?? '—';
  const displayStatus = report.status ?? report.priority ?? '—';
  const showAiImage   = cfg.hasAiImage;
  const showTriage    = (report.type === 'medical' || report.type === 'rescue') && report.triageData?.length > 0;

  return (
    <>
      <style>{`
        @keyframes curaBackdrop { from{opacity:0} to{opacity:1} }
        @keyframes curaCard {
          from { opacity:0; transform:scale(0.92) translateY(14px); }
          to   { opacity:1; transform:scale(1)    translateY(0);    }
        }
        .cura-backdrop { animation: curaBackdrop 0.18s ease forwards; }
        .cura-card     { animation: curaCard 0.26s cubic-bezier(0.34,1.3,0.64,1) forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        className="cura-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Card */}
        <div
          className="cura-card bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col"
          style={{ maxWidth: 448, maxHeight: 'calc(100vh - 2rem)' }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── Header ── */}
          <div className={`bg-gradient-to-r ${cfg.gradient} px-5 py-4 flex-shrink-0`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="bg-white/20 rounded-xl p-2 flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-white/65 text-xs font-medium tracking-wide mb-0.5">{cfg.label}</div>
                  <div className="text-white font-bold text-base leading-snug">{report.title}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPinIcon className="w-3.5 h-3.5 text-white/55 flex-shrink-0" />
                    <span className="text-white/70 text-xs leading-tight">{report.location}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white bg-white/15 hover:bg-white/25 rounded-xl p-1.5 transition-colors flex-shrink-0"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Status bar ── */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex-shrink-0 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusBadgeClass(displayStatus)}`}>
                {displayStatus}
              </span>
              {alarmLabel(report) && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${alarmBadgeClass(report)}`}>
                  {alarmLabel(report)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
              <ClockIcon className="w-3.5 h-3.5" />
              <span>{displayTime}</span>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="px-5 py-4 space-y-4">

              {/* AI Image Placeholder — Fire & Accident */}
              {showAiImage && cfg.ImageIcon && (
                <div>
                  {/* Faux analyzed image */}
                  <div
                    className={`rounded-xl overflow-hidden bg-gradient-to-br ${cfg.imageBg} relative flex items-center justify-center select-none`}
                    style={{ height: 148 }}
                  >
                    <cfg.ImageIcon className={`w-24 h-24 ${cfg.imageIconClass}`} />
                    {/* scanline texture */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-[0.07]"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.8) 3px,rgba(255,255,255,0.8) 4px)',
                      }}
                    />
                    {/* AI badge */}
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-white text-xs font-semibold">AI Visual Analysis</span>
                    </div>
                    {/* Confidence badge */}
                    {report.aiConfidence != null && (
                      <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1">
                        <span className="text-emerald-400 text-xs font-bold">{report.aiConfidence}%</span>
                        <span className="text-white/60 text-xs ml-1">confidence</span>
                      </div>
                    )}
                    {/* corner brackets */}
                    {['top-2 left-2','top-2 right-2','bottom-2 left-2','bottom-2 right-2'].map((pos, i) => (
                      <div key={i} className={`absolute ${pos} w-4 h-4 border-white/30`} style={{
                        borderTopWidth:    i < 2 ? 1.5 : 0,
                        borderBottomWidth: i >= 2 ? 1.5 : 0,
                        borderLeftWidth:   i % 2 === 0 ? 1.5 : 0,
                        borderRightWidth:  i % 2 === 1 ? 1.5 : 0,
                      }} />
                    ))}
                  </div>

                  {/* Confidence bar */}
                  {report.aiConfidence != null && (
                    <div className="mt-3">
                      <ConfidenceBar value={report.aiConfidence} />
                      {report.aiNote && (
                        <p className="mt-2 text-xs text-slate-500 italic leading-relaxed bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                          "{report.aiNote}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Fire-specific details */}
              {report.type === 'fire' && (
                <div className="space-y-2.5">
                  {report.structureType && (
                    <div className="flex items-center gap-3">
                      <div className="bg-red-50 rounded-lg p-1.5 flex-shrink-0">
                        <BuildingOfficeIcon className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Structure Type</div>
                        <div className="text-sm font-semibold text-slate-700">{report.structureType}</div>
                      </div>
                    </div>
                  )}
                  {report.description && (
                    <p className="text-xs text-slate-500 leading-relaxed bg-red-50/50 rounded-xl px-3 py-2.5 border border-red-100">
                      {report.description}
                    </p>
                  )}
                </div>
              )}

              {/* Accident-specific details */}
              {report.type === 'accident' && (
                <div className="space-y-2.5">
                  {report.vehicleType && (
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-50 rounded-lg p-1.5 flex-shrink-0">
                        <TruckIcon className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Vehicle(s) Involved</div>
                        <div className="text-sm font-semibold text-slate-700">{report.vehicleType}</div>
                      </div>
                    </div>
                  )}
                  {report.casualties && (
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-50 rounded-lg p-1.5 flex-shrink-0">
                        <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Casualties</div>
                        <div className="text-sm font-semibold text-slate-700">{report.casualties}</div>
                      </div>
                    </div>
                  )}
                  {report.description && (
                    <p className="text-xs text-slate-500 leading-relaxed bg-amber-50/50 rounded-xl px-3 py-2.5 border border-amber-100">
                      {report.description}
                    </p>
                  )}
                </div>
              )}

              {/* Triage / Situation Assessment — Medical & Rescue */}
              {showTriage && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheckIcon className="w-4 h-4 flex-shrink-0" style={{ color: cfg.accentColor }} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      {report.type === 'medical' ? 'Triage Assessment' : 'Situation Assessment'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {report.triageData.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-xl border px-3.5 py-2.5"
                        style={{
                          backgroundColor: i % 2 === 0 ? `${cfg.accentColor}08` : '#F8FAFC',
                          borderColor: i % 2 === 0 ? `${cfg.accentColor}20` : '#E2E8F0',
                        }}
                      >
                        <div className="text-[11px] font-semibold text-slate-400 mb-0.5">Q: {item.q}</div>
                        <div className="text-sm font-semibold text-slate-700">A: {item.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vitals — Medical only */}
              {report.type === 'medical' && report.vitals && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Vital Signs</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: 'HR',   value: report.vitals.hr,  unit: 'bpm'  },
                      { label: 'BP',   value: report.vitals.bp,  unit: 'mmHg' },
                      { label: 'SpO₂', value: report.vitals.spo2,unit: '%'    },
                      { label: 'RR',   value: report.vitals.rr,  unit: '/min' },
                    ].map(v => (
                      <div key={v.label} className="bg-blue-50 rounded-xl p-2 text-center border border-blue-100">
                        <div className="text-[10px] text-blue-400 font-semibold">{v.label}</div>
                        <div className="text-sm font-black text-blue-700 mt-0.5 leading-none">{v.value}</div>
                        <div className="text-[9px] text-blue-400 mt-0.5">{v.unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rescue: persons involved */}
              {report.type === 'rescue' && report.personsInvolved && (
                <div className="flex items-center gap-3">
                  <div className="bg-purple-50 rounded-lg p-1.5 flex-shrink-0">
                    <UserGroupIcon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Persons Involved</div>
                    <div className="text-sm font-semibold text-slate-700">{report.personsInvolved}</div>
                  </div>
                </div>
              )}

              {/* Reported by */}
              {report.reportedBy && (
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 rounded-lg p-1.5 flex-shrink-0">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Reported By</div>
                    <div className="text-sm font-semibold text-slate-700">{report.reportedBy}</div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Footer: Assigned Units ── */}
          {report.units?.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Assigned Units</div>
              <div className="flex flex-wrap gap-1.5">
                {report.units.map(u => (
                  <span key={u} className="bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm">
                    {u}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
