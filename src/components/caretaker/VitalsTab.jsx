import React from 'react';
import { Plus } from 'lucide-react';

export default function VitalsTab({ vitals = [], onOpenLogVitalModal }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">Vitals &amp; Health Logs</h2>
        <button
          type="button"
          onClick={onOpenLogVitalModal}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Log Vital Reading</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {vitals.map(v => (
          <div key={v.id} className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-500">{v.type}</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{v.value}</div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3">
              <span className="font-semibold text-emerald-700 uppercase">Status: {v.status}</span>
              <span>{new Date(v.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
