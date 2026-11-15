import React, { useEffect, useId } from 'react';
import { AlertOctagon, Phone, X } from 'lucide-react';
import { audioFeedback } from '../services/audioService';
import { useDialog } from '../hooks/useDialog';

export default function EmergencyModal({ isOpen, onClose, patient, medications = [] }) {
  const titleId = useId();
  const dialogRef = useDialog({ isOpen, onClose });

  useEffect(() => {
    if (isOpen) {
      audioFeedback.startEmergencySiren();
    } else {
      audioFeedback.stopEmergencySiren();
    }
    return () => audioFeedback.stopEmergencySiren();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-rose-500 overflow-hidden outline-none"
      >
        <div className="bg-rose-600 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss emergency modal"
            className="absolute right-4 top-4 p-1.5 text-white/80 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="inline-flex p-3 bg-white/20 rounded-full animate-bounce mb-2">
            <AlertOctagon className="w-12 h-12 text-white" aria-hidden="true" />
          </div>
          <h2 id={titleId} className="text-3xl font-black tracking-tight">
            EMERGENCY SOS BROADCAST
          </h2>
          <p className="text-rose-100 font-bold text-sm mt-1">
            Caregivers &amp; Emergency Contacts Have Been Notified
          </p>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold uppercase text-slate-500">Patient Emergency ID</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {patient.name} (Age {patient.age})
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs font-bold">
              <div>
                <span className="text-slate-500 block">Blood Group:</span>
                <span className="text-rose-700 text-sm">{patient.bloodGroup}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Severe Allergies:</span>
                <span className="text-rose-700 text-sm">{patient.allergies.join(', ')}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Primary Emergency Contacts
            </h3>
            <div className="space-y-2">
              {patient.emergencyContacts.map((c, i) => (
                <div key={i} className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{c.name}</div>
                    <div className="text-xs text-blue-700 font-semibold">
                      {c.relation} • {c.phone}
                    </div>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Call Now</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Active Prescriptions (For Paramedics)
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-700 space-y-1 border border-slate-200">
              {medications.map(m => (
                <div key={m.id} className="flex justify-between">
                  <span className="font-bold text-slate-900">
                    {m.name} ({m.dosage})
                  </span>
                  <span className="text-slate-500">
                    {m.compartment} • {m.purpose}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
          <a
            href="tel:911"
            className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-center text-sm shadow-md"
          >
            Call 911 / EMS
          </a>
          <button
            type="button"
            onClick={onClose}
            className="py-3.5 px-6 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-bold text-sm"
          >
            I am Safe (Cancel Siren)
          </button>
        </div>
      </div>
    </div>
  );
}
