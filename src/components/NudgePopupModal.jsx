import React, { useId } from 'react';
import { Sparkles, X } from 'lucide-react';
import { audioFeedback } from '../services/audioService';
import { useDialog } from '../hooks/useDialog';

export default function NudgePopupModal({ isOpen, onClose, nudge }) {
  const titleId = useId();
  const visible = Boolean(isOpen && nudge);
  const dialogRef = useDialog({ isOpen: visible, onClose });

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in-95"
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
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 text-center overflow-hidden outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close family love note"
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-4xl shadow-lg mb-4 animate-bounce"
          aria-hidden="true"
        >
          {nudge.avatar || '❤️'}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span>Family Love Note</span>
        </div>

        <h3 id={titleId} className="text-xl font-black text-slate-900">
          Message from {nudge.sender}
        </h3>

        <div className="my-5 p-5 bg-amber-50/70 border border-amber-200 rounded-2xl">
          <p className="text-xl font-bold text-slate-800 leading-snug">&ldquo;{nudge.message}&rdquo;</p>
        </div>

        <button
          type="button"
          onClick={() => {
            audioFeedback.playClick();
            onClose();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-base shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
        >
          Thank You! <span aria-hidden="true">❤️</span>
        </button>
      </div>
    </div>
  );
}
