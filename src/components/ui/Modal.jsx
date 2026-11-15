import React, { useId } from 'react';
import { X } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle = null,
  maxWidth = 'max-w-lg',
  children
}) {
  const titleId = useId();
  const subtitleId = useId();
  const dialogRef = useDialog({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        className={`bg-white rounded-3xl p-6 sm:p-8 ${maxWidth} w-full border-2 border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto outline-none`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 id={titleId} className="text-xl font-black text-slate-900">
              {title}
            </h3>
            {subtitle && (
              <p id={subtitleId} className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
