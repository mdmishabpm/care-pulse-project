import React, { useState, useEffect, useCallback, useId } from 'react';
import { Lock, Delete, X } from 'lucide-react';
import { audioFeedback } from '../services/audioService';
import { api } from '../services/apiService';
import { useDialog } from '../hooks/useDialog';

const DEFAULT_ROLES = [
  { id: 'senior', name: 'Arthur (Senior)', badge: '👴 Simple View & Voice' },
  { id: 'caretaker', name: 'Sarah (Caretaker)', badge: '👩‍⚕️ Full Schedule & Alerts' },
  { id: 'family', name: 'David (Family)', badge: '👨‍👩‍👦 Nudges & Peace of Mind' },
  { id: 'doctor', name: 'Dr. Watson (MD)', badge: '🩺 Clinical Review & GCal' }
];

const DEMO_QUICK_PINS = {
  senior: '1234',
  caretaker: '8888',
  family: '5555',
  doctor: '9999'
};

export default function PinPadModal({ isOpen, onClose, onAuthenticated, roles = null }) {
  const activeRoles = roles && roles.length > 0 ? roles : DEFAULT_ROLES;
  const [pin, setPin] = useState('');
  const [selectedRole, setSelectedRole] = useState(activeRoles[0]?.id || 'senior');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const titleId = useId();
  const descId = useId();
  const dialogRef = useDialog({ isOpen, onClose });

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setErrorMsg('');
      setIsVerifying(false);
    }
  }, [isOpen]);

  const verify = useCallback(async (codeToVerify, targetRoleId = selectedRole) => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const result = await api.verifyPin(codeToVerify, targetRoleId);
      if (result?.success) {
        audioFeedback.playSuccessChime();
        const roleMeta = activeRoles.find(r => r.id === (result.role?.id || targetRoleId)) || result.role;
        onAuthenticated(roleMeta);
        setPin('');
        setErrorMsg('');
      } else {
        const msg =
          typeof result?.error === 'string'
            ? result.error
            : result?.error?.message || 'Incorrect PIN. Please re-enter.';
        setErrorMsg(msg);
        window.setTimeout(() => setPin(''), 400);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [activeRoles, isVerifying, onAuthenticated, selectedRole]);

  const handleKeyPress = useCallback((digit) => {
    audioFeedback.playClick();
    setErrorMsg('');
    setPin(prev => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      if (next.length === 4) {
        verify(next, selectedRole);
      }
      return next;
    });
  }, [selectedRole, verify]);

  const handleDelete = useCallback(() => {
    audioFeedback.playClick();
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  }, []);

  const handleClear = useCallback(() => {
    audioFeedback.playClick();
    setPin('');
    setErrorMsg('');
  }, []);

  // Physical keyboard digit, Backspace, Clear, and Enter entry
  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePhysicalKey = (event) => {
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        handleKeyPress(event.key);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleDelete();
      } else if (event.key === 'Delete') {
        event.preventDefault();
        handleClear();
      } else if (event.key === 'Enter' && pin.length === 4) {
        event.preventDefault();
        verify(pin, selectedRole);
      }
    };

    document.addEventListener('keydown', handlePhysicalKey);
    return () => document.removeEventListener('keydown', handlePhysicalKey);
  }, [isOpen, handleKeyPress, handleDelete, handleClear, pin, selectedRole, verify]);

  if (!isOpen) return null;

  const quickFill = (roleObj) => {
    const demoPin = DEMO_QUICK_PINS[roleObj.id];
    if (!demoPin) return;
    setSelectedRole(roleObj.id);
    setPin(demoPin);
    verify(demoPin, roleObj.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-slate-200 overflow-hidden p-6 sm:p-8 outline-none"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
              <Lock className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h2 id={titleId} className="text-2xl font-black text-slate-800">
                Secure Access
              </h2>
              <p id={descId} className="text-sm font-medium text-slate-500">
                Enter your 4-digit PIN (or type 0–9 on keyboard)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            aria-label="Close PIN pad"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Your Profile
          </span>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto" role="group" aria-label="User profiles">
            {activeRoles.map(r => (
              <button
                key={r.id}
                type="button"
                aria-pressed={selectedRole === r.id}
                onClick={() => {
                  setSelectedRole(r.id);
                  setPin('');
                  setErrorMsg('');
                }}
                className={`p-2.5 rounded-xl text-left border-2 transition-all ${
                  selectedRole === r.id
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-800">{r.name}</div>
                <div className="text-[11px] font-semibold text-slate-500 truncate">{r.badge}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="my-6 text-center">
          <div
            className="flex justify-center items-center gap-4"
            aria-label={`PIN entry: ${pin.length} of 4 digits entered`}
          >
            {[0, 1, 2, 3].map(idx => (
              <div
                key={idx}
                aria-hidden="true"
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  pin.length > idx ? 'bg-blue-600 border-blue-600 scale-125' : 'bg-slate-100 border-slate-300'
                }`}
              />
            ))}
          </div>
          <div aria-live="polite" className="min-h-[24px] mt-3">
            {errorMsg ? (
              <p className="text-sm font-bold text-rose-600">{errorMsg}</p>
            ) : (
              <p className="text-xs font-semibold text-slate-500">
                {pin.length === 0
                  ? 'Tap keypad or use number keys 0–9'
                  : `${pin.length} of 4 digits entered`}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3" role="group" aria-label="Numeric PIN keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(String(num))}
              disabled={isVerifying}
              className="h-16 text-3xl font-extrabold rounded-2xl bg-slate-100 hover:bg-blue-50 active:bg-blue-200 text-slate-800 border-2 border-slate-200 hover:border-blue-300 shadow-sm flex items-center justify-center transition-all"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            disabled={isVerifying}
            className="h-16 text-xs font-bold uppercase rounded-2xl bg-slate-50 hover:bg-slate-200 text-slate-600 border border-slate-200 flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            disabled={isVerifying}
            className="h-16 text-3xl font-extrabold rounded-2xl bg-slate-100 hover:bg-blue-50 active:bg-blue-200 text-slate-800 border-2 border-slate-200 hover:border-blue-300 shadow-sm flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isVerifying}
            className="h-16 rounded-2xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 border border-rose-200 flex items-center justify-center"
            aria-label="Backspace"
          >
            <Delete className="w-7 h-7" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase text-slate-500 text-center mb-2">
            Quick Demo Role Switch
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {activeRoles
              .filter(r => DEMO_QUICK_PINS[r.id])
              .map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => quickFill(r)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 font-semibold border border-slate-200 transition-colors"
                >
                  {r.name.split(' ')[0]}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
