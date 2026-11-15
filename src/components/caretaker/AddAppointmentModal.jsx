import React from 'react';
import Modal from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { useFormState } from '../../hooks/useFormState';
import { audioFeedback } from '../../services/audioService';

const INITIAL_APT = {
  doctorName: '',
  specialty: 'General Practice',
  clinic: '',
  phone: '',
  dateTime: '',
  purpose: '',
  preparationNotes: ''
};

function validateApt(values) {
  const errors = {};
  if (!values.doctorName?.trim()) errors.doctorName = 'Doctor name is required.';
  if (!values.dateTime) errors.dateTime = 'Appointment date and time are required.';
  return errors;
}

export default function AddAppointmentModal({ isOpen, onClose, onSubmit }) {
  const { values, errors, handleChange, validate, reset } = useFormState(INITIAL_APT, validateApt);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    audioFeedback.playClick();
    if (!validate()) return;
    onSubmit(values);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Doctor Appointment">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Doctor Name"
            name="doctorName"
            required
            placeholder="e.g. Dr. Emily Watson"
            value={values.doctorName}
            onChange={handleChange}
            error={errors.doctorName}
            inputClassName="font-semibold"
          />
          <FormField
            label="Specialty"
            name="specialty"
            placeholder="e.g. Cardiology"
            value={values.specialty}
            onChange={handleChange}
          />
        </div>

        <FormField
          label="Clinic / Hospital Location"
          name="clinic"
          placeholder="e.g. Metro Heart Pavilion, Room 302"
          value={values.clinic}
          onChange={handleChange}
        />

        <FormField
          label="Date & Time"
          name="dateTime"
          type="datetime-local"
          required
          value={values.dateTime}
          onChange={handleChange}
          error={errors.dateTime}
          inputClassName="font-semibold"
        />

        <FormField
          label="Purpose"
          name="purpose"
          placeholder="e.g. Blood pressure & cholesterol review"
          value={values.purpose}
          onChange={handleChange}
        />

        <FormField
          label="Preparation Instructions"
          name="preparationNotes"
          placeholder="e.g. Fasting 8 hours prior"
          value={values.preparationNotes}
          onChange={handleChange}
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
            Schedule &amp; Sync GCal
          </button>
        </div>
      </form>
    </Modal>
  );
}
