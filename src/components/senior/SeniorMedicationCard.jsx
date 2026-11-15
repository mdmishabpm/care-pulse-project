import React from 'react';
import { CheckCircle2, Clock, Volume2 } from 'lucide-react';
import PillVisual from '../PillVisual';

export default function SeniorMedicationCard({ med, onReadCard, onTake, onSkip }) {
  const isTaken = med.status === 'taken';
  const isOverdue = med.status === 'overdue';

  return (
    <div
      className={`p-6 sm:p-7 rounded-3xl border-3 transition-all bg-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isTaken
          ? 'border-emerald-200 bg-emerald-50/40 opacity-90'
          : isOverdue
          ? 'border-rose-400 ring-4 ring-rose-100 urgent-pulse'
          : 'border-slate-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start gap-5">
        <div className="p-4 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
          <PillVisual shape={med.shape} color={med.color} size="lg" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{med.name}</h4>
            <span className="text-base font-extrabold text-blue-700 bg-blue-100 px-3 py-0.5 rounded-full">
              {med.dosage}
            </span>
          </div>

          <p className="text-base font-bold text-slate-600 mt-1 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" aria-hidden="true" />
            <span>{med.time}</span>
            <span className="text-slate-300" aria-hidden="true">•</span>
            <span>{med.instructions}</span>
          </p>

          <p className="text-sm font-semibold text-slate-500 mt-0.5">
            Target: {med.purpose || 'Prescribed health regimen'}
          </p>

          {isTaken && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>
                Taken today at{' '}
                {med.loggedAt
                  ? new Date(med.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Scheduled time'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => onReadCard(med)}
          className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold border border-slate-200 flex items-center gap-2 senior-target"
          aria-label={`Listen to instructions for ${med.name}`}
        >
          <Volume2 className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <span className="text-sm font-bold">Listen</span>
        </button>

        {!isTaken ? (
          <>
            <button
              type="button"
              onClick={() => onTake(med)}
              className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-lg flex items-center gap-2 shadow-lg shadow-emerald-600/30 senior-target btn-tactile"
            >
              <CheckCircle2 className="w-7 h-7 text-white" aria-hidden="true" />
              <span>I TOOK THIS</span>
            </button>

            <button
              type="button"
              onClick={() => onSkip(med)}
              className="px-4 py-4 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-sm border border-slate-200 senior-target"
            >
              Skip
            </button>
          </>
        ) : (
          <div className="px-5 py-3 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-base flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" aria-hidden="true" />
            <span>Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}
