import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Modal from '../ui/Modal';
import { FormField, SelectField } from '../ui/FormField';
import { useFormState } from '../../hooks/useFormState';
import { audioFeedback } from '../../services/audioService';

const INITIAL_PROFILE = {
  name: '',
  pin: '',
  roleType: 'family'
};

function validateProfile(values) {
  const errors = {};
  if (!values.name?.trim()) errors.name = 'Name or relation is required.';
  if (!/^\d{4}$/.test(values.pin || '')) errors.pin = 'PIN must be exactly 4 digits.';
  return errors;
}

export default function AddProfileModal({ isOpen, onClose, onSubmit }) {
  const [showPin, setShowPin] = useState(false);
  const { values, errors, handleChange, setField, validate, reset } = useFormState(
    INITIAL_PROFILE,
    validateProfile
  );

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    audioFeedback.playSuccessChime();
    onSubmit({
      name: values.name.trim(),
      pin: values.pin,
      type: values.roleType,
      badge: `${values.roleType === 'caretaker' ? '👩‍⚕️' : '👤'} ${values.roleType.toUpperCase()}`
    });
    reset();
    setShowPin(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Profile"
      subtitle="Register a new caretaker, family member, or visiting nurse"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <FormField
          label="Name / Relation"
          name="name"
          required
          placeholder="e.g. Nurse Lisa or Son Michael"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          inputClassName="p-3 font-semibold"
        />

        <div className="relative">
          <FormField
            label="4-Digit Security PIN"
            name="pin"
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={4}
            required
            placeholder="••••"
            value={values.pin}
            onChange={(e) => setField('pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
            error={errors.pin}
            inputClassName="p-3 pr-10 font-mono font-bold"
          />
          <button
            type="button"
            onClick={() => setShowPin(prev => !prev)}
            aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
            className="absolute right-2.5 top-7 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            {showPin ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        <SelectField
          label="Profile Permissions Type"
          name="roleType"
          value={values.roleType}
          onChange={handleChange}
          className="p-3 font-semibold"
          options={[
            { value: 'family', label: 'Family Member (Peace of Mind & Nudges)' },
            { value: 'caretaker', label: 'Caretaker / Nurse (Medications & Full Schedule)' },
            { value: 'senior', label: 'Senior (Simple 1-Tap & Voice View)' },
            { value: 'doctor', label: 'Doctor (Clinical Chart & Review)' }
          ]}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm"
          >
            Create Profile
          </button>
        </div>
      </form>
    </Modal>
  );
}
