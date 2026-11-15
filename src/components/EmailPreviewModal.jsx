import React, { useState, useId } from 'react';
import { Mail, X, Check, Send } from 'lucide-react';
import { audioFeedback } from '../services/audioService';
import { useDialog } from '../hooks/useDialog';

export default function EmailPreviewModal({ isOpen, onClose, previewData }) {
  const [sentSuccess, setSentSuccess] = useState(false);
  const titleId = useId();
  const visible = Boolean(isOpen && previewData);
  const dialogRef = useDialog({ isOpen: visible, onClose });

  if (!visible) return null;

  const handleSendTest = () => {
    audioFeedback.playSuccessChime();
    setSentSuccess(true);
    window.setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[90vh] outline-none"
      >
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl">
              <Mail className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 id={titleId} className="font-bold text-base">
                Google Gmail API • Proactive Email Dispatcher
              </h3>
              <p className="text-xs text-slate-400">Sandboxed HTML preview of automated healthcare briefing</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close email preview"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-1.5 font-medium">
          <div className="flex">
            <span className="w-16 font-bold text-slate-500">To:</span>
            <span className="font-bold text-slate-800">{previewData.recipient}</span>
          </div>
          <div className="flex">
            <span className="w-16 font-bold text-slate-500">Subject:</span>
            <span className="font-bold text-blue-700">{previewData.subject}</span>
          </div>
          <div className="flex">
            <span className="w-16 font-bold text-slate-500">Channel:</span>
            <span className="text-slate-600 font-semibold">Google Workspace / Gmail REST API Connector</span>
          </div>
        </div>

        {/* Sandboxed Email Preview Iframe (zero script/origin permissions) */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
          <iframe
            title="Email HTML Preview"
            sandbox=""
            srcDoc={previewData.htmlPreview}
            className="w-full min-h-[380px] bg-white rounded-2xl shadow-sm border border-slate-200"
          />
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Automated by CarePulse scheduler</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSendTest}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              {sentSuccess ? <Check className="w-4 h-4" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
              <span>{sentSuccess ? 'Dispatched via Gmail API!' : 'Dispatch Test Alert'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
