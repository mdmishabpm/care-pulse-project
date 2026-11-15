import React from 'react';
import Modal from '../ui/Modal';
import { FormField, SelectField } from '../ui/FormField';
import { useFormState } from '../../hooks/useFormState';
import { audioFeedback } from '../../services/audioService';

const INITIAL_VITAL = {
  type: 'Blood Pressure',
  value: '',
  status: 'normal'
};

function validateVitalForm(values) {
  const errors = {};
  if (!values.type?.trim()) errors.type = 'Vital type is required.';
  if (!values.value?.trim()) errors.value = 'Reading value is required.';
  return errors;
}

export default function LogVitalModal({ isOpen, onClose, onSubmit }) {
  const { values, errors, handleChange, validate, reset } = useFormState(
    INITIAL_VITAL,
    validateVitalForm
  );

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    audioFeedback.playSuccessChime();
    onSubmit({
      type: values.type,
      value: values.value.trim(),
      status: values.status
    });
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Vital Reading"
      subtitle="Record a new health measurement for clinical tracking"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <SelectField
          label="Vital Measurement Type"
          name="type"
          value={values.type}
          onChange={handleChange}
          className="p-3 font-semibold"
          options={[
            { value: 'Blood Pressure', label: 'Blood Pressure (mmHg)' },
            { value: 'Heart Rate', label: 'Heart Rate (bpm)' },
            { value: 'Blood Glucose', label: 'Blood Glucose (mg/dL)' },
            { value: 'Oxygen Saturation', label: 'Oxygen Saturation (SpO2 %)' },
            { value: 'Body Temperature', label: 'Body Temperature (°F)' }
          ]}
        />

        <FormField
          label="Measured Value"
          name="value"
          required
          placeholder="e.g. 122/80 mmHg"
          value={values.value}
          onChange={handleChange}
          error={errors.value}
          inputClassName="p-3 font-bold"
        />

        <SelectField
          label="Clinical Status"
          name="status"
          value={values.status}
          onChange={handleChange}
          className="p-3 font-semibold"
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'elevated', label: 'Elevated — Monitor' },
            { value: 'attention', label: 'Needs Attention' }
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
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
          >
            Save Vital Reading
          </button>
        </div>
      </form>
    </Modal>
  );
}
