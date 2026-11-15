import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { FormField } from '../ui/FormField';

const QUICK_REASONS = [
  'Felt nauseous or unwell',
  'Doctor advised to hold dose',
  'Already took earlier',
  'Running low / need refill'
];

export default function SkipMedicationModal({ medication, onClose, onConfirm }) {
  const [reason, setReason] = useState('Felt unwell');

  useEffect(() => {
    if (medication) {
      setReason('Felt unwell');
    }
  }, [medication]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!medication) return;
    onConfirm(medication, reason.trim() || 'Unspecified by patient');
    onClose();
  };

  return (
    <Modal
      isOpen={Boolean(medication)}
      onClose={onClose}
      title={medication ? `Skip ${medication.name}?` : 'Skip Medication'}
      subtitle="Let your caretaker know why you are skipping this dose."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Reasons</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_REASONS.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setReason(opt)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  reason === opt
                    ? 'bg-blue-50 border-blue-500 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <FormField
          label="Or type a note for your caretaker"
          name="skipReason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Felt nauseous after breakfast"
          inputClassName="p-3 font-medium"
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
          >
            Confirm Skip
          </button>
        </div>
      </form>
    </Modal>
  );
}
