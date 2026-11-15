import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import PillVisual from '../PillVisual';
import { audioFeedback } from '../../services/audioService';

export default function CompartmentGrid({
  compartments,
  schedule = [],
  selectedCompartment,
  onSelectCompartment
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <span aria-hidden="true">💊</span>
          <span>Today&apos;s Pill Organizer</span>
        </h2>
        <span className="text-xs font-bold text-slate-500">Tap a compartment to view</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" role="tablist" aria-label="Pillbox compartments">
        {compartments.map(comp => {
          const medsInComp = schedule.filter(m => (m.compartment || 'morning') === comp.id);
          const allTaken = medsInComp.length > 0 && medsInComp.every(m => m.status === 'taken');
          const hasOverdue = medsInComp.some(m => m.status === 'overdue');
          const isSelected = selectedCompartment === comp.id;

          return (
            <button
              key={comp.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                audioFeedback.playClick();
                onSelectCompartment(comp.id);
              }}
              className={`p-4 rounded-3xl border-3 text-left transition-all relative overflow-hidden pillbox-compartment ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 shadow-lg scale-102 ring-4 ring-blue-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl" aria-hidden="true">{comp.icon}</span>
                {allTaken ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> All Done
                  </span>
                ) : hasOverdue ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 animate-pulse">
                    Needs Attention
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-500">{medsInComp.length} meds</span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="text-lg font-black text-slate-900">{comp.label}</h3>
                <p className="text-xs font-bold text-slate-500">{comp.time}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 min-h-[26px]">
                {medsInComp.map(m => (
                  <PillVisual key={m.id} shape={m.shape} color={m.color} size="sm" />
                ))}
                {medsInComp.length === 0 && (
                  <span className="text-xs text-slate-400 italic font-medium">Empty</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
