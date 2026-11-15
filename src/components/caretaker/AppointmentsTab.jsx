import React from 'react';
import { Calendar, Download, Plus, ExternalLink } from 'lucide-react';

export default function AppointmentsTab({ appointments = [], onOpenAddModal }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-slate-900">Doctor Appointments &amp; Follow-ups</h2>
          <p className="text-xs text-slate-500">Integrated with Google Calendar and RFC-5545 iCal export</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/calendar/export-ics"
            download="carepulse-appointments.ics"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Export .ICS</span>
          </a>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Schedule Visit</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {appointments.map(apt => (
          <div
            key={apt.id}
            className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl shrink-0">
                <Calendar className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{apt.doctorName}</h3>
                <div className="text-xs font-bold text-indigo-700">
                  {apt.specialty} • {apt.clinic}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  <span aria-hidden="true">📅 </span>
                  <strong>{new Date(apt.dateTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</strong>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Purpose: {apt.purpose}</p>
                {apt.preparationNotes && (
                  <p className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    <span aria-hidden="true">⚠️ </span>
                    {apt.preparationNotes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={apt.googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span>Add to Google Calendar</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
