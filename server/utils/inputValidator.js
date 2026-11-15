/**
 * @file inputValidator.js
 * @description Schema-based input validation for CarePulse API endpoints.
 * Prevents invalid data, enforces type safety, and provides descriptive errors.
 */

export function validatePin(pin) {
  if (pin === null || pin === undefined || pin === '') {
    return { valid: false, error: 'PIN is required.' };
  }
  if (typeof pin !== 'string') {
    return { valid: false, error: 'PIN must be a string.' };
  }
  if (!/^\d{4,8}$/.test(pin.trim())) {
    return { valid: false, error: 'PIN must be 4–8 numeric digits.' };
  }
  return { valid: true };
}

export function validateMedication(med, { isUpdate = false } = {}) {
  const errors = [];
  if (!med || typeof med !== 'object' || Array.isArray(med)) {
    return { valid: false, errors: ['Medication must be an object.'] };
  }
  if (!isUpdate || med.name !== undefined) {
    if (!med.name || typeof med.name !== 'string' || med.name.trim().length === 0) {
      errors.push('Medication name is required.');
    } else if (med.name.length > 100) {
      errors.push('Medication name must be under 100 characters.');
    }
  }
  if (!isUpdate || med.dosage !== undefined) {
    if (!med.dosage || typeof med.dosage !== 'string' || med.dosage.trim().length === 0) {
      errors.push('Dosage is required (e.g., "10mg").');
    } else if (med.dosage.length > 50) {
      errors.push('Dosage must be under 50 characters.');
    }
  }
  if (!isUpdate || med.time !== undefined) {
    if (!med.time || typeof med.time !== 'string') {
      errors.push('Time of day is required (e.g., "08:00").');
    }
  }
  if (med.remainingCount !== undefined && (typeof med.remainingCount !== 'number' || Number.isNaN(med.remainingCount) || med.remainingCount < 0)) {
    errors.push('remainingCount must be a non-negative number.');
  }
  if (med.totalQuantity !== undefined && (typeof med.totalQuantity !== 'number' || Number.isNaN(med.totalQuantity) || med.totalQuantity < 1)) {
    errors.push('totalQuantity must be at least 1.');
  }
  if (med.refillThreshold !== undefined && (typeof med.refillThreshold !== 'number' || Number.isNaN(med.refillThreshold) || med.refillThreshold < 0)) {
    errors.push('refillThreshold must be a non-negative number.');
  }
  return { valid: errors.length === 0, errors };
}

export function validateVital(vital) {
  const errors = [];
  if (!vital || typeof vital !== 'object' || Array.isArray(vital)) {
    return { valid: false, errors: ['Vital signs must be an object.'] };
  }
  if (!vital.type || typeof vital.type !== 'string' || vital.type.trim().length === 0) {
    errors.push('Vital type is required (e.g., "Blood Pressure").');
  }
  if (vital.value === undefined || vital.value === null || String(vital.value).trim() === '') {
    errors.push('Vital value is required.');
  }
  return { valid: errors.length === 0, errors };
}

export function validateAppointment(apt) {
  const errors = [];
  if (!apt || typeof apt !== 'object' || Array.isArray(apt)) {
    return { valid: false, errors: ['Appointment must be an object.'] };
  }
  if (!apt.doctorName || typeof apt.doctorName !== 'string' || apt.doctorName.trim().length === 0) {
    errors.push('Doctor name is required.');
  }
  if (!apt.dateTime || typeof apt.dateTime !== 'string' || Number.isNaN(Date.parse(apt.dateTime))) {
    errors.push('Valid dateTime is required.');
  }
  return { valid: errors.length === 0, errors };
}

export function validateNudge(nudge) {
  const errors = [];
  if (!nudge || typeof nudge !== 'object' || Array.isArray(nudge)) {
    return { valid: false, errors: ['Nudge must be an object.'] };
  }
  if (!nudge.message || typeof nudge.message !== 'string' || nudge.message.trim().length === 0) {
    errors.push('Message is required.');
  } else if (nudge.message.length > 500) {
    errors.push('Message must be under 500 characters.');
  }
  return { valid: errors.length === 0, errors };
}

export function validatePatientUpdate(patient) {
  const errors = [];
  if (!patient || typeof patient !== 'object' || Array.isArray(patient)) {
    return { valid: false, errors: ['Patient payload must be an object.'] };
  }
  if (patient.name !== undefined && (typeof patient.name !== 'string' || patient.name.trim().length === 0)) {
    errors.push('Patient name cannot be empty.');
  }
  if (patient.age !== undefined && (typeof patient.age !== 'number' || Number.isNaN(patient.age) || patient.age < 0 || patient.age > 130)) {
    errors.push('Age must be between 0 and 130.');
  }
  if (patient.allergies !== undefined && !Array.isArray(patient.allergies)) {
    errors.push('Allergies must be an array.');
  }
  if (patient.medicalConditions !== undefined && !Array.isArray(patient.medicalConditions)) {
    errors.push('Medical conditions must be an array.');
  }
  return { valid: errors.length === 0, errors };
}

export function validateRoleCreate(role) {
  const errors = [];
  if (!role || typeof role !== 'object' || Array.isArray(role)) {
    return { valid: false, errors: ['Role payload must be an object.'] };
  }
  if (!role.name || typeof role.name !== 'string' || role.name.trim().length === 0) {
    errors.push('Profile name is required.');
  }
  const pinRes = validatePin(role.pin);
  if (!pinRes.valid) {
    errors.push(pinRes.error);
  }
  return { valid: errors.length === 0, errors };
}

export function validateRoleUpdate(role) {
  const errors = [];
  if (!role || typeof role !== 'object' || Array.isArray(role)) {
    return { valid: false, errors: ['Role update payload must be an object.'] };
  }
  if (role.pin !== undefined) {
    const pinRes = validatePin(role.pin);
    if (!pinRes.valid) errors.push(pinRes.error);
  }
  if (role.name !== undefined && (typeof role.name !== 'string' || role.name.trim().length === 0)) {
    errors.push('Profile name cannot be empty.');
  }
  return { valid: errors.length === 0, errors };
}

export function validatePinRequest(req, res, next) {
  const { pin } = req.body || {};
  const result = validatePin(pin);
  if (!result.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: result.error }
    });
  }
  next();
}

export function validateBody(validatorFn) {
  return (req, res, next) => {
    const result = validatorFn(req.body);
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', messages: result.errors }
      });
    }
    next();
  };
}

export function validateMedicationRequest(req, res, next) {
  return validateBody(validateMedication)(req, res, next);
}
