import React, { useState, useEffect } from 'react';
import { Save, Plus, Key, Eye, EyeOff } from 'lucide-react';
import { audioFeedback } from '../../services/audioService';
import { FormField, TextareaField } from '../ui/FormField';
import { useFormState } from '../../hooks/useFormState';

const DEMO_DEFAULT_PINS = {
  senior: '1234',
  caretaker: '8888',
  family: '5555',
  doctor: '9999'
};

export default function ProfilesTab({
  patient,
  roles = [],
  knownPins = {},
  onUpdatePatient,
  onOpenAddProfileModal,
  onSelectRoleForPinChange
}) {
  const [patientSavedToast, setPatientSavedToast] = useState(false);
  const [revealedPins, setRevealedPins] = useState({});

  const { values, setValues, handleChange, setField } = useFormState({
    name: patient?.name || '',
    age: patient?.age ?? 76,
    bloodGroup: patient?.bloodGroup || '',
    allergiesText: Array.isArray(patient?.allergies) ? patient.allergies.join(', ') : '',
    conditionsText: Array.isArray(patient?.medicalConditions) ? patient.medicalConditions.join(', ') : '',
    notes: patient?.notes || ''
  });

  useEffect(() => {
    setValues({
      name: patient?.name || '',
      age: patient?.age ?? 76,
      bloodGroup: patient?.bloodGroup || '',
      allergiesText: Array.isArray(patient?.allergies) ? patient.allergies.join(', ') : '',
      conditionsText: Array.isArray(patient?.medicalConditions) ? patient.medicalConditions.join(', ') : '',
      notes: patient?.notes || ''
    });
  }, [patient, setValues]);

  const handleSavePatient = (e) => {
    e.preventDefault();
    audioFeedback.playSuccessChime();
    onUpdatePatient({
      ...patient,
      name: values.name,
      age: Number(values.age) || 0,
      bloodGroup: values.bloodGroup,
      allergies: values.allergiesText.split(',').map(s => s.trim()).filter(Boolean),
      medicalConditions: values.conditionsText.split(',').map(s => s.trim()).filter(Boolean),
      notes: values.notes
    });
    setPatientSavedToast(true);
    window.setTimeout(() => setPatientSavedToast(false), 3000);
  };

  const toggleRevealPin = (roleId) => {
    setRevealedPins(prev => ({ ...prev, [roleId]: !prev[roleId] }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Elderly Patient Health Profile</h2>
            <p className="text-xs text-slate-500">Edit demographic info, emergency contacts, and allergies</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold uppercase">
            Active Patient
          </span>
        </div>

        <form onSubmit={handleSavePatient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              label="Full Name"
              name="name"
              required
              value={values.name}
              onChange={handleChange}
              inputClassName="p-3 font-bold"
            />
            <FormField
              label="Age"
              name="age"
              type="number"
              min={0}
              max={130}
              value={values.age}
              onChange={handleChange}
              inputClassName="p-3 font-bold"
            />
            <FormField
              label="Blood Group"
              name="bloodGroup"
              value={values.bloodGroup}
              onChange={handleChange}
              inputClassName="p-3 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Allergies (comma separated)"
              name="allergiesText"
              value={values.allergiesText}
              onChange={handleChange}
              inputClassName="p-3 font-semibold text-rose-700"
            />
            <FormField
              label="Medical Conditions (comma separated)"
              name="conditionsText"
              value={values.conditionsText}
              onChange={handleChange}
              inputClassName="p-3 font-semibold"
            />
          </div>

          <TextareaField
            label="Caregiver Clinical Notes"
            name="notes"
            rows={2}
            value={values.notes}
            onChange={(e) => setField('notes', e.target.value)}
            className="p-3 font-medium"
          />

          <div className="flex items-center justify-between pt-2">
            <div aria-live="polite">
              {patientSavedToast && (
                <span className="text-xs font-bold text-emerald-700">
                  ✓ Patient profile saved successfully!
                </span>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>Save Patient Profile</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">User Profiles &amp; Security PINs</h2>
            <p className="text-xs text-slate-500">Edit existing 4-digit PINs or register new family members and nurses</p>
          </div>
          <button
            type="button"
            onClick={onOpenAddProfileModal}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add New Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(r => {
            const isRevealed = Boolean(revealedPins[r.id]);
            const displayablePin = knownPins[r.id] || DEMO_DEFAULT_PINS[r.id] || null;

            return (
              <div
                key={r.id}
                className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-base font-black text-slate-900">{r.name}</div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">{r.badge || r.id}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg font-mono font-bold text-xs">
                      PIN: {isRevealed && displayablePin ? displayablePin : '••••'}
                    </span>
                    {displayablePin && (
                      <button
                        type="button"
                        onClick={() => toggleRevealPin(r.id)}
                        aria-label={isRevealed ? `Hide PIN for ${r.name}` : `Reveal PIN for ${r.name}`}
                        aria-pressed={isRevealed}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-300"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">Role ID: {r.id}</span>
                  <button
                    type="button"
                    onClick={() => onSelectRoleForPinChange(r)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs border border-slate-300 flex items-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Change PIN</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
