import React from 'react';
import { HeartPulse, KeyRound, Eye, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { audioFeedback } from '../services/audioService';
import { BRANDING } from '../config/branding';

export default function Navbar({
  currentRole,
  onOpenPinPad,
  fontSize,
  onChangeFontSize,
  theme,
  onChangeTheme,
  speechEnabled,
  onToggleSpeech,
  onTriggerSos
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20"
            aria-hidden="true"
          >
            <HeartPulse className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900">{BRANDING.appName}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700">
                {BRANDING.badge}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">{BRANDING.tagline}</p>
          </div>
        </div>

        <nav aria-label="Accessibility and role controls" className="flex items-center gap-2 sm:gap-3">
          <div
            role="group"
            aria-label="Text size"
            className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200"
          >
            <button
              type="button"
              aria-pressed={fontSize === 'font-standard'}
              aria-label="Standard text size"
              onClick={() => {
                audioFeedback.playClick();
                onChangeFontSize('font-standard');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                fontSize === 'font-standard' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A
            </button>
            <button
              type="button"
              aria-pressed={fontSize === 'font-large'}
              aria-label="Large text size"
              onClick={() => {
                audioFeedback.playClick();
                onChangeFontSize('font-large');
              }}
              className={`px-2 py-1 rounded-lg text-sm font-bold transition-all ${
                fontSize === 'font-large' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A+
            </button>
            <button
              type="button"
              aria-pressed={fontSize === 'font-xlarge'}
              aria-label="Extra-large text size"
              onClick={() => {
                audioFeedback.playClick();
                onChangeFontSize('font-xlarge');
              }}
              className={`px-2 py-1 rounded-lg text-base font-extrabold transition-all ${
                fontSize === 'font-xlarge' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A++
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              audioFeedback.playClick();
              const nextTheme =
                theme === 'theme-default'
                  ? 'theme-contrast'
                  : theme === 'theme-contrast'
                  ? 'theme-warm'
                  : 'theme-default';
              onChangeTheme(nextTheme);
            }}
            aria-label="Cycle visual contrast mode"
            className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              theme === 'theme-contrast'
                ? 'bg-black text-yellow-300 border-yellow-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            <Eye className="w-5 h-5" aria-hidden="true" />
            <span className="hidden md:inline">
              {theme === 'theme-contrast' ? 'High Contrast' : theme === 'theme-warm' ? 'Warm Mode' : 'Contrast'}
            </span>
          </button>

          <button
            type="button"
            aria-pressed={speechEnabled}
            aria-label={speechEnabled ? 'Turn voice read-aloud off' : 'Turn voice read-aloud on'}
            onClick={() => {
              audioFeedback.playClick();
              onToggleSpeech();
            }}
            className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              speechEnabled
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {speechEnabled ? <Volume2 className="w-5 h-5" aria-hidden="true" /> : <VolumeX className="w-5 h-5" aria-hidden="true" />}
            <span className="hidden md:inline">{speechEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioFeedback.playClick();
              onOpenPinPad();
            }}
            aria-label={`Switch role, currently ${currentRole.name}`}
            className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
          >
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs" aria-hidden="true">
              {currentRole.name[0]}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-black tracking-wide leading-tight">{currentRole.name.split(' ')[0]}</div>
              <div className="text-[10px] text-blue-300 font-semibold uppercase">{currentRole.id}</div>
            </div>
            <KeyRound className="w-4 h-4 text-slate-400 ml-1" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              audioFeedback.playClick();
              onTriggerSos();
            }}
            aria-label="Trigger Emergency SOS"
            className="px-3 sm:px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-sm flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all animate-pulse"
          >
            <AlertTriangle className="w-5 h-5 text-white" aria-hidden="true" />
            <span className="tracking-wide">SOS</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
