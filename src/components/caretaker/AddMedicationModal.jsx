import React from 'react';
import Modal from '../ui/Modal';
import { FormField, SelectField } from '../ui/FormField';
import { useFormState } from '../../hooks/useFormState';
import { audioFeedback } from '../../services/audioService';

const INITIAL_MED = {
  name: '',
  dosage: '',
  purpose: '',
  instructions: '',
  compartment: 'morning',
  time: '08:00',
  mealTiming: 'with_meal',
  frequency: 'daily',
  shape: 'round',
  color: 'white',
  totalQuantity: 30,
  refillThreshold: 7
};

function validateMed(values) {
  const errors = {};
  if (!values.name?.trim()) errors.name = 'Medication name is required.';
  if (!values.dosage?.trim()) errors.dosage = 'Dosage is required.';
  if (Number(values.totalQuantity) < 1) errors.totalQuantity = 'Quantity must be at least 1.';
  if (Number(values.refillThreshold) < 0) errors.refillThreshold = 'Threshold cannot be negative.';
  return errors;
}

export default function AddMedicationModal({ isOpen, onClose, patientFirstName = 'Arthur', onSubmit }) {
  const { values, errors, handleChange, validate, reset } = useFormState(INITIAL_MED, validateMed);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    audioFeedback.playClick();
    if (!validate()) return;
    onSubmit({
      ...values,
      totalQuantity: Number(values.totalQuantity) || 30,
      refillThreshold: Number(values.refillThreshold) || 7
    });
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Prescription">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Medication Name"
            name="name"
            required
            placeholder="e.g. Warfarin"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            inputClassName="font-semibold"
          />
          <FormField
            label="Dosage"
            name="dosage"
            required
            placeholder="e.g. 5 mg"
            value={values.dosage}
            onChange={handleChange}
            error={errors.dosage}
            inputClassName="font-semibold"
          />
        </div>

        <FormField
          label="Health Target / Purpose"
          name="purpose"
          placeholder="e.g. Blood thinner"
          value={values.purpose}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Compartment"
            name="compartment"
            value={values.compartment}
            onChange={handleChange}
            className="font-semibold"
            options={[
              { value: 'morning', label: 'Morning (08:00)' },
              { value: 'afternoon', label: 'Afternoon (13:00)' },
              { value: 'evening', label: 'Evening (19:00)' },
              { value: 'night', label: 'Bedtime (21:00)' }
            ]}
          />
          <FormField
            label="Exact Time"
            name="time"
            type="time"
            value={values.time}
            onChange={handleChange}
            inputClassName="font-semibold"
          />
        </div>

        <FormField
          label={`Instructions for ${patientFirstName}`}
          name="instructions"
          placeholder="e.g. Take with food and full glass of water"
          value={values.instructions}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Pill Shape"
            name="shape"
            value={values.shape}
            onChange={handleChange}
            options={[
              { value: 'round', label: 'Round Tablet' },
              { value: 'oval', label: 'Oval Caplet' },
              { value: 'capsule', label: 'Capsule' }
            ]}
          />
          <SelectField
            label="Pill Color"
            name="color"
            value={values.color}
            onChange={handleChange}
            options={[
              { value: 'white', label: 'White' },
              { value: 'yellow', label: 'Yellow' },
              { value: 'blue', label: 'Blue' },
              { value: 'orange', label: 'Orange' },
              { value: 'red', label: 'Red' },
              { value: 'green', label: 'Green' }
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Quantity In Bottle"
            name="totalQuantity"
            type="number"
            min={1}
            value={values.totalQuantity}
            onChange={handleChange}
            error={errors.totalQuantity}
          />
          <FormField
            label="Refill Alert At"
            name="refillThreshold"
            type="number"
            min={0}
            value={values.refillThreshold}
            onChange={handleChange}
            error={errors.refillThreshold}
          />
        </div>

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
            Save &amp; Analyze Interactions
          </button>
        </div>
      </form>
    </Modal>
  );
}
