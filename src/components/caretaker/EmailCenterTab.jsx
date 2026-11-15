import React from 'react';
import { Mail } from 'lucide-react';

export default function EmailCenterTab({ patientName, onOpenEmailPreview }) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md">
        <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-wider">
          <span>Google Workspace &amp; Gmail API Integration</span>
        </div>
        <h2 className="text-2xl font-black mt-1">Proactive Automated Email Reminders</h2>
        <p className="text-emerald-50 text-sm mt-1 max-w-2xl">
          CarePulse automatically dispatches morning healthcare digests to family members and fires high-priority alert emails if critical medications are missed past the 45-minute grace period.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Daily Digest</span>
            <h3 className="text-lg font-black text-slate-900 mt-2">Morning Caregiver Briefing</h3>
            <p className="text-xs text-slate-600 mt-1">
              Sent daily at 7:30 AM containing full schedule, upcoming doctor visits, and pharmacy refill alerts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenEmailPreview('briefing')}
            className="mt-6 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>Preview &amp; Test Dispatch (HTML)</span>
          </button>
        </div>

        <div className="p-6 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">Urgent Safety Alert</span>
            <h3 className="text-lg font-black text-slate-900 mt-2">Missed Medication Alert</h3>
            <p className="text-xs text-slate-600 mt-1">
              Dispatched immediately if {patientName.split(' ')[0]} misses a heart or blood pressure dose past 45 minutes of scheduled time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenEmailPreview('urgent')}
            className="mt-6 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>Preview Urgent Alert Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
