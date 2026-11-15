import React, { useState } from 'react';
import { Volume2, Mic, AlertCircle, Phone, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioFeedback } from '../services/audioService';
import { speechAssistant } from '../services/speechService';
import CompartmentGrid from './senior/CompartmentGrid';
import SeniorMedicationCard from './senior/SeniorMedicationCard';
import SkipMedicationModal from './senior/SkipMedicationModal';

const COMPARTMENTS = [
  { id: 'morning', label: 'Morning', icon: '🌅', time: '8:00 AM', desc: 'With Breakfast' },
  { id: 'afternoon', label: 'Afternoon', icon: '☀️', time: '1:00 PM', desc: 'With Lunch' },
  { id: 'evening', label: 'Evening', icon: '🌆', time: '7:00 PM', desc: 'With Dinner' },
  { id: 'night', label: 'Bedtime', icon: '🌙', time: '9:00 PM', desc: 'Before Sleep' }
];

export default function SeniorView({
  patient,
  schedule = [],
  appointments = [],
  onTakeMedication,
  onSkipMedication,
  onTriggerSos,
  loveNudges = []
}) {
  const [selectedCompartment, setSelectedCompartment] = useState('morning');
  const [voiceStatus, setVoiceStatus] = useState('idle');
  const [medToSkip, setMedToSkip] = useState(null);

  const triggerCelebration = () => {
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {
      // Ignore confetti canvas errors in headless environments
    }
  };

  const handleTake = (med) => {
    audioFeedback.playSuccessChime();
    triggerCelebration();
    speechAssistant.speak(`Great job ${patient.name.split(' ')[0]}! You have taken your ${med.name}.`);
    onTakeMedication(med.id);
  };

  const handleConfirmSkip = (med, reason) => {
    audioFeedback.playClick();
    onSkipMedication(med.id, reason);
    speechAssistant.speak(`Understood. ${med.name} was marked as skipped.`);
  };

  const handleReadCard = (med) => {
    audioFeedback.playClick();
    speechAssistant.speak(
      `This is ${med.name}, ${med.dosage}. ${med.instructions}. It is scheduled for ${med.compartment}.`
    );
  };

  const handleReadTodaySchedule = () => {
    audioFeedback.playClick();
    const pending = schedule.filter(m => m.status !== 'taken');
    if (pending.length === 0) {
      speechAssistant.speak('You have taken all your scheduled medications for today! Excellent job!');
    } else {
      const names = pending.map(p => `${p.name} ${p.dosage}`).join(', ');
      speechAssistant.speak(`You have ${pending.length} medications remaining today: ${names}.`);
    }
  };

  const handleVoiceCommand = () => {
    audioFeedback.playClick();
    setVoiceStatus('listening');
    speechAssistant.startVoiceListening(
      (transcript) => {
        setVoiceStatus('idle');
        if (transcript.includes('took') || transcript.includes('taken') || transcript.includes('mark')) {
          const med = schedule.find(m => m.status !== 'taken');
          if (med) handleTake(med);
          else speechAssistant.speak('All medications are already recorded as taken.');
        } else if (transcript.includes('schedule') || transcript.includes('today') || transcript.includes('what')) {
          handleReadTodaySchedule();
        } else if (transcript.includes('emergency') || transcript.includes('help') || transcript.includes('call')) {
          onTriggerSos();
        } else {
          speechAssistant.speak(
            `You said: ${transcript}. You can say "Read schedule", "Mark taken", or "Emergency".`
          );
        }
      },
      (status) => setVoiceStatus(status)
    );
  };

  const activeCompartmentMeds = schedule.filter(m => (m.compartment || 'morning') === selectedCompartment);
  const nextAppointment = appointments[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-100 font-bold uppercase tracking-wider text-xs">
            <span aria-hidden="true">📅</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mt-1 tracking-tight">
            Hello, {patient.name.split(' ')[0]}! <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-blue-100 text-lg font-medium mt-1">Let&apos;s stay healthy together today.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReadTodaySchedule}
            className="px-5 py-4 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/35 backdrop-blur-md text-white font-bold text-base flex items-center gap-2.5 border border-white/20 shadow-sm transition-all senior-target"
          >
            <Volume2 className="w-6 h-6 text-yellow-300" aria-hidden="true" />
            <span>Listen to Schedule</span>
          </button>

          <button
            type="button"
            onClick={handleVoiceCommand}
            aria-pressed={voiceStatus === 'listening'}
            className={`px-5 py-4 rounded-2xl font-bold text-base flex items-center gap-2.5 shadow-md transition-all senior-target ${
              voiceStatus === 'listening'
                ? 'bg-rose-500 text-white animate-bounce'
                : 'bg-yellow-400 hover:bg-yellow-300 text-slate-900'
            }`}
          >
            <Mic className="w-6 h-6 text-slate-900" aria-hidden="true" />
            <span>{voiceStatus === 'listening' ? 'Listening...' : 'Speak Command'}</span>
          </button>
        </div>
      </div>

      {loveNudges.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="text-4xl" aria-hidden="true">{loveNudges[0].avatar || '❤️'}</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">
              Family Love Note from {loveNudges[0].sender}
            </div>
            <p className="text-lg font-bold text-slate-800 mt-0.5">&ldquo;{loveNudges[0].message}&rdquo;</p>
          </div>
        </div>
      )}

      <CompartmentGrid
        compartments={COMPARTMENTS}
        schedule={schedule}
        selectedCompartment={selectedCompartment}
        onSelectCompartment={setSelectedCompartment}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2 border-slate-200">
          <h3 className="text-xl font-black text-slate-800 capitalize flex items-center gap-2">
            <span aria-hidden="true">{COMPARTMENTS.find(c => c.id === selectedCompartment)?.icon}</span>
            <span>{selectedCompartment} Compartment Medications</span>
          </h3>
          <span className="text-sm font-bold text-slate-500">
            {activeCompartmentMeds.filter(m => m.status === 'taken').length} of {activeCompartmentMeds.length} taken
          </span>
        </div>

        {activeCompartmentMeds.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
            <p className="text-lg font-bold text-slate-500">No medications scheduled for this compartment.</p>
          </div>
        ) : (
          activeCompartmentMeds.map(med => (
            <SeniorMedicationCard
              key={med.id}
              med={med}
              onReadCard={handleReadCard}
              onTake={handleTake}
              onSkip={(m) => {
                audioFeedback.playClick();
                setMedToSkip(m);
              }}
            />
          ))
        )}
      </div>

      {nextAppointment && (
        <div className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-600 text-white rounded-2xl">
              <Calendar className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Upcoming Doctor Visit</div>
              <h4 className="text-xl font-black text-slate-900">
                {nextAppointment.doctorName} ({nextAppointment.specialty})
              </h4>
              <p className="text-sm font-semibold text-slate-600">
                {new Date(nextAppointment.dateTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}{' '}
                • {nextAppointment.clinic}
              </p>
            </div>
          </div>
          <a
            href={nextAppointment.googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 bg-white text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-sm border border-indigo-200 shadow-sm text-center shrink-0"
          >
            Open in Google Calendar
          </a>
        </div>
      )}

      <div className="p-6 bg-slate-100 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold text-slate-800">Need help or feeling unwell?</h4>
          <p className="text-sm font-medium text-slate-600">
            Your daughter Sarah is your primary emergency caretaker.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:+15552345678"
            className="px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base flex items-center gap-2 shadow-sm"
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            <span>Call Sarah</span>
          </a>
          <button
            type="button"
            onClick={onTriggerSos}
            className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base flex items-center gap-2 shadow-sm"
          >
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
            <span>SOS Emergency</span>
          </button>
        </div>
      </div>

      <SkipMedicationModal
        medication={medToSkip}
        onClose={() => setMedToSkip(null)}
        onConfirm={handleConfirmSkip}
      />
    </div>
  );
}
