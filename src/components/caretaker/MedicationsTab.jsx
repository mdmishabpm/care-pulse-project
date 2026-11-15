import React from 'react';
import { Plus, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import PillVisual from '../PillVisual';

export default function MedicationsTab({
  medications = [],
  onDeleteMedication,
  onOpenAddModal,
  onOpenResetModal
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-black text-slate-900">Prescription Schedule &amp; Inventory</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenResetModal}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200"
            title="Reset intake logs and pill stock back to fresh demo state"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Demo State</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map(med => {
          const stockPct = Math.min(100, Math.round((med.remainingCount / (med.totalQuantity || 30)) * 100));
          const isLow = med.remainingCount <= med.refillThreshold;

          return (
            <div
              key={med.id}
              className="p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-300 shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <PillVisual shape={med.shape} color={med.color} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{med.name}</h3>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {med.dosage}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{med.purpose}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteMedication(med.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  aria-label={`Remove ${med.name}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-500 block font-semibold">Compartment:</span>
                  <span className="font-bold text-slate-700 capitalize">
                    {med.compartment} ({med.time})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Instructions:</span>
                  <span className="font-bold text-slate-700">{med.instructions}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">Remaining Inventory</span>
                  <span className={isLow ? 'text-rose-600' : 'text-slate-700'}>
                    {med.remainingCount} / {med.totalQuantity} pills
                  </span>
                </div>
                <div
                  className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={med.remainingCount}
                  aria-valuemin={0}
                  aria-valuemax={med.totalQuantity}
                  aria-label={`${med.name} remaining pills`}
                >
                  <div
                    className={`h-full rounded-full transition-all ${isLow ? 'bg-rose-500' : 'bg-blue-600'}`}
                    style={{ width: `${stockPct}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Google Calendar Synced</span>
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Take+${encodeURIComponent(med.name)}+(${encodeURIComponent(med.dosage)})&details=${encodeURIComponent(med.instructions || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>View in GCal</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
