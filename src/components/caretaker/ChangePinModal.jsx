import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Modal from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { useFormState } from '../../hooks/useFormState';
import { audioFeedback } from '../../services/audioService';

function validatePinChange(values) {
  const errors = {};
  if (!/^\d{4}$/.test(values.pin || '')) {
    errors.pin = 'PIN must be exactly 4 numeric digits.';
  }
  return errors;
}

export default function ChangePinModal({ role, onClose, onSubmit }) {
  const [showPin, setShowPin] = useState(false);
  const { values, errors, setField, validate, reset } = useFormState(
    { pin: '' },
    validatePinChange
  );

  useEffect(() => {
    reset({ pin: '' });
    setShowPin(false);
  }, [role, reset]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate() || !role) return;
    audioFeedback.playSuccessChime();
    onSubmit(role.id, values.pin);
    reset({ pin: '' });
    onClose();
  };

  return (
    <Modal
      isOpen={Boolean(role)}
      onClose={onClose}
      title={role ? `Change PIN for ${role.name}` : 'Change PIN'}
      subtitle="Enter a new 4-digit numeric security PIN"
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="relative">
          <FormField
            label="New 4-Digit PIN"
            name="pin"
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={4}
            required
            placeholder="••••"
            value={values.pin}
            onChange={(e) => setField('pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
            error={errors.pin}
            inputClassName="p-3 pr-10 font-mono font-bold text-lg tracking-widest"
          />
          <button
            type="button"
            onClick={() => setShowPin(prev => !prev)}
            aria-label={showPin ? 'Hide new PIN' : 'Show new PIN'}
            className="absolute right-2.5 top-7 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            {showPin ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
          >
            Update PIN
          </button>
        </div>
      </form>
    </Modal>
  );
}
