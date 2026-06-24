import React, { useState } from 'react';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  HomeIcon,
  EnvelopeIcon,
  BeakerIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  HeartIcon,
  InformationCircleIcon,
  IdentificationIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

function getInitials(first, last) {
  return `${(first || 'U')[0]}${(last || 'S')[0]}`.toUpperCase();
}

function StatusBadge({ status }) {
  const cfg = {
    verified:   { bg: 'bg-emerald-500', text: 'Verified',   icon: CheckCircleSolid },
    pending:    { bg: 'bg-amber-500',   text: 'Pending',    icon: ClockIcon         },
    rejected:   { bg: 'bg-red-600',     text: 'Rejected',   icon: XMarkIcon         },
    unverified: { bg: 'bg-slate-500',   text: 'Unverified', icon: UserIcon          },
  }[status] ?? { bg: 'bg-slate-500', text: status, icon: UserIcon };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white ${cfg.bg}`}>
      <Icon className="w-3 h-3" />
      {cfg.text}
    </span>
  );
}

// National ID thumbnail placeholder
function IdThumb({ label, src }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5">
      <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
        {src
          ? <img src={src} alt={label} className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full flex items-center justify-center">
              <IdentificationIcon className="w-8 h-8 text-slate-600" />
            </div>
          )
        }
      </div>
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </div>
  );
}

function Section({ title, accent, Icon, children }) {
  return (
    <div
      className="rounded-xl overflow-hidden border flex"
      style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="w-1 flex-shrink-0 rounded-l-xl" style={{ backgroundColor: accent }} />
      <div className="flex-1 min-w-0">
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accent + '28' }}>
            <Icon className="w-4 h-4" style={{ color: accent }} />
          </div>
          <span className="text-sm font-bold text-white">{title}</span>
        </div>
        <div className="px-4 py-1">{children}</div>
      </div>
    </div>
  );
}

function InfoRow({ icon: RowIcon, label, value, accent = '#10B981' }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: accent + '22' }}>
        <RowIcon className="w-3.5 h-3.5" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
        <div className="text-sm font-medium text-white/90 break-words">{value || '—'}</div>
      </div>
    </div>
  );
}

export default function CitizenProfileModal({ citizen, onClose }) {
  const [idEnlarged, setIdEnlarged] = useState(null); // 'front' | 'back' | null

  const {
    firstName, middleName, lastName, email, phone,
    address, placeOfBirth, bloodType, dateOfBirth,
    gender, maritalStatus, verificationStatus = 'pending',
  } = citizen;

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

  return (
    <>
      <style>{`
        @keyframes cpSlideIn {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .cp-card { animation: cpSlideIn 0.28s cubic-bezier(0.34,1.2,0.64,1) forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Card */}
        <div
          className="cp-card w-full overflow-hidden flex flex-col rounded-2xl shadow-2xl"
          style={{ maxWidth: 400, maxHeight: 'calc(100vh - 2rem)', backgroundColor: '#0A1628' }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── Cover + Avatar (relative wrapper so avatar sits on boundary) ── */}
          <div className="relative flex-shrink-0" style={{ paddingBottom: 52 }}>

            {/* Cover */}
            <div className="relative overflow-hidden" style={{ height: 110, backgroundColor: '#0D4A35', borderRadius: '1rem 1rem 0 0' }}>
              {/* Orbs */}
              <div className="absolute" style={{ top: -30, right: -20, width: 140, height: 140, borderRadius: '50%', backgroundColor: '#10B981', opacity: 0.18 }} />
              <div className="absolute" style={{ bottom: -40, left: -20, width: 130, height: 130, borderRadius: '50%', backgroundColor: '#10B981', opacity: 0.11 }} />
              {/* CURA brand */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(52,211,153,0.85)"><path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-1-11v5l4 2.5-.75 1.23L9 13V8h2z"/></svg>
                <span className="text-xs font-black tracking-widest" style={{ color: 'rgba(52,211,153,0.85)' }}>CURA</span>
              </div>
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Avatar — absolutely centered on the cover's bottom edge, always on top */}
            <div
              className="absolute left-0 right-0 flex justify-center"
              style={{ top: 110 - 40, zIndex: 20 }} /* 110 - half of 80px avatar = sits centered on boundary */
            >
              <div
                className="rounded-full flex items-center justify-center text-2xl font-black text-white"
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#10B981',
                  border: '4px solid #0A1628',
                  boxShadow: '0 8px 28px rgba(16,185,129,0.45)',
                }}
              >
                {getInitials(firstName, lastName)}
              </div>
            </div>

            {/* Identity text — below the avatar, inside the paddingBottom space */}
            <div className="flex flex-col items-center pt-2 px-5">
              <div className="text-xl font-extrabold text-white text-center mb-0.5">{fullName}</div>
              {email && <div className="text-xs text-white/50 mb-2">{email}</div>}
              <StatusBadge status={verificationStatus} />
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <div className="overflow-y-auto flex-1 min-h-0 px-4 pb-6 space-y-3">

            {/* National ID */}
            <div
              className="rounded-xl overflow-hidden border"
              style={{ backgroundColor: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.25)' }}
            >
              <div className="h-0.5" style={{ backgroundColor: '#10B981', opacity: 0.8 }} />
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(16,185,129,0.15)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.2)' }}>
                    <IdentificationIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">National ID</div>
                    <div className="text-xs text-white/50">Philippine National ID</div>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">Registered</span>
              </div>
              <div className="flex gap-4 px-4 py-3">
                <button onClick={() => setIdEnlarged('front')} className="flex-1 flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity">
                  <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                    <img src="/NatIDFront.png" alt="ID Front" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                  </div>
                  <span className="text-xs font-semibold text-white/50">Front</span>
                </button>
                <div className="w-px" style={{ backgroundColor: 'rgba(16,185,129,0.2)' }} />
                <button onClick={() => setIdEnlarged('back')} className="flex-1 flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity">
                  <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                    <img src="/NatIDBack.png" alt="ID Back" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                  </div>
                  <span className="text-xs font-semibold text-white/50">Back</span>
                </button>
              </div>
            </div>

            {/* Personal Info */}
            <Section title="Personal Info" accent="#10B981" Icon={UserIcon}>
              <InfoRow icon={UserIcon}     label="First Name"    value={firstName}  accent="#10B981" />
              <InfoRow icon={UserIcon}     label="Middle Name"   value={middleName} accent="#10B981" />
              <InfoRow icon={UserIcon}     label="Last Name"     value={lastName}   accent="#10B981" />
              <InfoRow icon={EnvelopeIcon} label="Email Address" value={email}      accent="#10B981" />
            </Section>

            {/* Contact Info */}
            <Section title="Contact Info" accent="#3B82F6" Icon={PhoneIcon}>
              <InfoRow icon={PhoneIcon}  label="Phone Number"   value={phone}        accent="#3B82F6" />
              <InfoRow icon={MapPinIcon} label="Address"        value={address}      accent="#3B82F6" />
              <InfoRow icon={HomeIcon}   label="Place of Birth" value={placeOfBirth} accent="#3B82F6" />
            </Section>

            {/* Medical Info */}
            <Section title="Medical Info" accent="#EF4444" Icon={BeakerIcon}>
              <InfoRow icon={BeakerIcon}        label="Blood Type"    value={bloodType}    accent="#EF4444" />
              <InfoRow icon={CalendarDaysIcon}  label="Date of Birth" value={dateOfBirth}  accent="#EF4444" />
            </Section>

            {/* Additional Info */}
            <Section title="Additional Info" accent="#8B5CF6" Icon={InformationCircleIcon}>
              <InfoRow icon={UserCircleIcon} label="Gender"         value={gender}         accent="#8B5CF6" />
              <InfoRow icon={HeartIcon}      label="Marital Status" value={maritalStatus}  accent="#8B5CF6" />
            </Section>

          </div>
        </div>
      </div>

      {/* National ID Enlarged */}
      {idEnlarged && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
          onClick={() => setIdEnlarged(null)}
        >
          <div className="relative max-w-sm w-full">
            <img
              src={idEnlarged === 'front' ? '/NatIDFront.png' : '/NatIDBack.png'}
              alt={idEnlarged === 'front' ? 'National ID Front' : 'National ID Back'}
              className="w-full rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <div className="text-center mt-4 text-white/60 text-sm">{idEnlarged === 'front' ? 'Front Side' : 'Back Side'} — Click anywhere to close</div>
          </div>
        </div>
      )}
    </>
  );
}
