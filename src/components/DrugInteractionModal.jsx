import React, { useId } from 'react';
import { ShieldAlert, X, CheckCircle, Info } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';

export default function DrugInteractionModal({ isOpen, onClose, warnings = [] }) {
  const titleId = useId();
  const dialogRef = useDialog({ isOpen, onClose });

  if (!isOpen) return null;

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
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[85vh] outline-none"
      >
        <div className="p-6 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 id={titleId} className="font-black text-xl">
                AI Clinical Safety &amp; Interaction Analysis
              </h3>
              <p className="text-xs text-rose-100 font-semibold">Real-time pharmacology conflict detection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close interaction analysis"
            className="p-1.5 text-white/80 hover:text-white rounded-lg"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {warnings.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" aria-hidden="true" />
              <h4 className="font-bold text-emerald-900 text-base">No Adverse Drug Interactions Detected</h4>
              <p className="text-xs text-emerald-700 mt-1">
                The current prescription schedule has no documented high-risk interactions or allergy conflicts.
              </p>
            </div>
          ) : (
            warnings.map((w, i) => (
              <div key={i} className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-200 text-rose-800">
                    Severity: {w.severity}
                  </span>
                  <span className="text-xs font-bold text-slate-600 uppercase">{w.type}</span>
                </div>
                <h4 className="text-lg font-black text-rose-950">{w.title}</h4>
                <p className="text-xs font-medium text-rose-900 leading-relaxed">{w.description}</p>
                <div className="pt-2 border-t border-rose-200 flex items-start gap-2 text-xs font-bold text-rose-800">
                  <Info className="w-4 h-4 shrink-0 text-rose-700 mt-0.5" aria-hidden="true" />
                  <span>Clinical Recommendation: {w.recommendation}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
