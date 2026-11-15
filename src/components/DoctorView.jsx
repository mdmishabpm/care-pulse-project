import React from 'react';
import { Download } from 'lucide-react';

export default function DoctorView({ patient, medications = [], metrics }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <span aria-hidden="true">🩺</span>
            <span>Attending Physician Clinical Review</span>
          </div>
          <h1 className="text-3xl font-black mt-1">Patient Chart: {patient.name}</h1>
          <p className="text-slate-300 text-sm mt-1">
            Age: {patient.age} • Gender: {patient.gender} • Blood Type:{' '}
            <strong className="text-white">{patient.bloodGroup}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/calendar/export-ics"
            download="carepulse-patient-schedule.ics"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Export Clinical ICS</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Documented Allergies</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {patient.allergies.map((all, i) => (
              <span key={i} className="px-3 py-1 bg-rose-100 text-rose-800 rounded-xl font-bold text-xs">
                <span aria-hidden="true">🚫 </span>
                {all}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Chronic Diagnoses</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {patient.medicalConditions.map((cond, i) => (
              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs">
                <span aria-hidden="true">📋 </span>
                {cond}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 mb-2">Medication Adherence Compliance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs font-bold text-slate-500 block">Overall Score</span>
            <span className="text-2xl font-black text-emerald-700">{metrics?.overallPercentage || 100}%</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs font-bold text-slate-500 block">Doses Taken</span>
            <span className="text-2xl font-black text-slate-800">{metrics?.takenCount || 0}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs font-bold text-slate-500 block">Doses Skipped</span>
            <span className="text-2xl font-black text-amber-700">{metrics?.skippedCount || 0}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-xs font-bold text-slate-500 block">Current Streak</span>
            <span className="text-2xl font-black text-blue-700">{metrics?.streakDays || 1} Days</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-black text-slate-900 mb-4">Active Medication Regimen</h2>
        <table className="w-full text-left border-collapse text-sm">
          <caption className="sr-only">Active medications, timing, clinical indication, and remaining inventory</caption>
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
              <th scope="col" className="pb-3">Drug &amp; Dosage</th>
              <th scope="col" className="pb-3">Timing</th>
              <th scope="col" className="pb-3">Clinical Indication</th>
              <th scope="col" className="pb-3">Inventory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {medications.map(m => (
              <tr key={m.id} className="text-xs font-medium text-slate-700">
                <td className="py-3 font-bold text-slate-900">
                  {m.name} ({m.dosage})
                </td>
                <td className="py-3">
                  {m.time} ({m.compartment})
                </td>
                <td className="py-3 text-slate-500">{m.purpose}</td>
                <td className="py-3">
                  <span className={m.remainingCount <= m.refillThreshold ? 'font-bold text-rose-600' : 'text-slate-600'}>
                    {m.remainingCount} left
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
