import React, { useState, useId } from 'react';
import { Heart, Flame, CheckCircle, Clock, Send, Sparkles, ShieldCheck } from 'lucide-react';
import { audioFeedback } from '../services/audioService';

const SUGGESTED_NUDGES = [
  'Proud of you Grandpa! Keep up the healthy habits ❤️',
  'Hope you had a wonderful morning walk! Thinking of you ☀️',
  "Don't forget your afternoon pills, Dad! Call you tonight 📞",
  'Sending you big hugs from the kids and me! 🥰'
];

export default function FamilyView({ patient, metrics, onSendNudge }) {
  const [customMsg, setCustomMsg] = useState('');
  const [senderName] = useState('David (Grandson)');
  const [sentSuccess, setSentSuccess] = useState(false);
  const inputId = useId();

  const handleSend = (msgToSend) => {
    const text = msgToSend || customMsg;
    if (!text.trim()) return;

    audioFeedback.playSuccessChime();
    onSendNudge({
      sender: senderName,
      message: text.trim(),
      avatar: '❤️'
    });
    setCustomMsg('');
    setSentSuccess(true);
    window.setTimeout(() => setSentSuccess(false), 3000);
  };

  const streak = metrics?.streakDays || 1;
  const adherencePercent = metrics?.overallPercentage || 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-purple-200 text-xs font-bold uppercase tracking-wider">
            <span aria-hidden="true">👨‍👩‍👦</span>
            <span>Family Peace of Mind Portal</span>
          </div>
          <h1 className="text-3xl font-black mt-1">Checking in on {patient.name.split(' ')[0]}</h1>
          <p className="text-purple-100 text-sm mt-1">
            Real-time compliance visibility and emotional support connection.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
          <div className="p-3 bg-amber-400 text-amber-950 rounded-xl font-extrabold shadow-sm">
            <Flame className="w-8 h-8 fill-amber-500 animate-bounce" aria-hidden="true" />
          </div>
          <div>
            <div className="text-2xl font-black">{streak} Days</div>
            <div className="text-xs font-bold text-purple-200 uppercase tracking-wider">Adherence Streak</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Overall Compliance</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{adherencePercent}%</div>
            <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Excellent compliance</span>
            </p>
          </div>
          <div
            className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-emerald-200 flex items-center justify-center font-black text-sm text-emerald-700"
            aria-hidden="true"
          >
            {adherencePercent}%
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-500">By Time of Day</span>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs font-bold">
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block">Morning:</span>
              <span className="text-emerald-700">{metrics?.compartmentBreakdown?.morning || 100}% on time</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block">Evening:</span>
              <span className="text-emerald-700">{metrics?.compartmentBreakdown?.evening || 100}% on time</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Care Status</span>
            <div className="text-lg font-black text-slate-900 mt-1">Active Oversight</div>
            <p className="text-xs text-slate-500 mt-0.5">Primary Caregiver: Sarah (Active)</p>
          </div>
          <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" aria-hidden="true" />
          <h2 className="text-2xl font-black text-slate-900">
            Send {patient.name.split(' ')[0]} a &ldquo;Love Nudge&rdquo;
          </h2>
        </div>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Your cheer note will pop up on {patient.name.split(' ')[0]}&apos;s screen next time he marks his medicine as taken.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTED_NUDGES.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(sug)}
              className="text-xs font-bold px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl border border-purple-200 transition-colors text-left"
            >
              &ldquo;{sug}&rdquo;
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-4 flex gap-2"
        >
          <label htmlFor={inputId} className="sr-only">
            Personal Love Nudge message
          </label>
          <input
            id={inputId}
            type="text"
            placeholder={`Type your personal message to ${patient.name.split(' ')[0]}...`}
            value={customMsg}
            onChange={e => setCustomMsg(e.target.value)}
            className="flex-1 p-3.5 rounded-2xl border-2 border-slate-200 focus:border-purple-600 font-semibold text-sm outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-sm flex items-center gap-2 shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>Send</span>
          </button>
        </form>

        <div aria-live="polite" className="min-h-[20px]">
          {sentSuccess && (
            <p className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
              <Sparkles className="w-4 h-4" aria-hidden="true" /> Love Nudge dispatched! It will appear on{' '}
              {patient.name.split(' ')[0]}&apos;s screen.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slate-500" aria-hidden="true" />
          <span>Live Intake &amp; Activity Stream</span>
        </h3>

        <div className="space-y-3">
          {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
            metrics.recentActivity.map(act => (
              <div
                key={act.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      act.status === 'taken' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800">
                      Medication dose recorded as <span className="uppercase text-emerald-700 font-black">{act.status}</span>
                    </span>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Scheduled: {act.scheduledTime} • Date: {act.date}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm font-semibold text-slate-500 italic">No activity recorded today yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
