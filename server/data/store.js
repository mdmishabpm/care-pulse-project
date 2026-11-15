/**
 * @file store.js
 * @description Encapsulated in-memory state store for CarePulse API routers.
 */

import { initialData } from './initialData.js';
import { AuthService } from '../services/authService.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createStore() {
  const state = {
    patient: clone(initialData.patient),
    medications: clone(initialData.medications),
    adherenceLogs: clone(initialData.adherenceLogs),
    appointments: clone(initialData.appointments),
    loveNudges: clone(initialData.loveNudges),
    vitals: clone(initialData.vitals),
    emergencyAlerts: []
  };

  return {
    getPatient: () => state.patient,
    updatePatient: (updates) => {
      const allowed = ['name', 'age', 'gender', 'bloodGroup', 'allergies', 'medicalConditions', 'notes', 'emergencyContacts'];
      for (const key of allowed) {
        if (updates[key] !== undefined) {
          state.patient[key] = updates[key];
        }
      }
      return state.patient;
    },

    getMedications: () => state.medications,
    findMedication: (id) => state.medications.find(m => m.id === id),
    addMedication: (medInput) => {
      const newMed = {
        id: `med_${Date.now()}`,
        active: true,
        remainingCount: medInput.totalQuantity || 30,
        totalQuantity: medInput.totalQuantity || 30,
        refillThreshold: medInput.refillThreshold || 7,
        shape: medInput.shape || 'round',
        color: medInput.color || 'white',
        compartment: medInput.compartment || 'morning',
        frequency: medInput.frequency || 'daily',
        mealTiming: medInput.mealTiming || 'with_meal',
        purpose: medInput.purpose || '',
        instructions: medInput.instructions || '',
        name: medInput.name,
        dosage: medInput.dosage,
        time: medInput.time
      };
      state.medications.push(newMed);
      return newMed;
    },
    updateMedication: (id, updates) => {
      const index = state.medications.findIndex(m => m.id === id);
      if (index === -1) return null;
      const allowed = [
        'name', 'dosage', 'purpose', 'instructions', 'compartment',
        'time', 'mealTiming', 'frequency', 'shape', 'color',
        'totalQuantity', 'remainingCount', 'refillThreshold', 'active'
      ];
      for (const key of allowed) {
        if (updates[key] !== undefined) {
          state.medications[index][key] = updates[key];
        }
      }
      return state.medications[index];
    },
    deleteMedication: (id) => {
      const med = state.medications.find(m => m.id === id);
      if (!med) return null;
      state.medications = state.medications.filter(m => m.id !== id);
      return med;
    },

    getAdherenceLogs: () => state.adherenceLogs,
    recordMedicationTaken: (id) => {
      const med = state.medications.find(m => m.id === id);
      if (!med) return null;

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      if (med.remainingCount > 0) {
        med.remainingCount -= 1;
      }
      med.lastTaken = now.toISOString();

      const logEntry = {
        id: `log_${Date.now()}`,
        medicationId: id,
        date: dateStr,
        scheduledTime: med.time,
        status: 'taken',
        timestamp: now.toISOString()
      };
      state.adherenceLogs.push(logEntry);

      const unreadNudge = state.loveNudges.find(n => !n.read);
      if (unreadNudge) {
        unreadNudge.read = true;
      }

      return { med, logEntry, unreadNudge: unreadNudge || null };
    },
    recordMedicationSkipped: (id, reason) => {
      const med = state.medications.find(m => m.id === id);
      if (!med) return null;

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const logEntry = {
        id: `log_${Date.now()}`,
        medicationId: id,
        date: dateStr,
        scheduledTime: med.time,
        status: 'skipped',
        reason: reason || 'Unspecified by patient',
        timestamp: now.toISOString()
      };
      state.adherenceLogs.push(logEntry);
      return { med, logEntry };
    },

    getAppointments: () => state.appointments,
    addAppointment: (aptInput) => {
      const newApt = {
        id: `apt_${Date.now()}`,
        status: 'scheduled',
        doctorName: aptInput.doctorName,
        specialty: aptInput.specialty || 'General Practice',
        clinic: aptInput.clinic || '',
        phone: aptInput.phone || '',
        dateTime: aptInput.dateTime,
        purpose: aptInput.purpose || '',
        preparationNotes: aptInput.preparationNotes || ''
      };
      state.appointments.push(newApt);
      return newApt;
    },

    getNudges: () => state.loveNudges,
    addNudge: (nudgeInput) => {
      const newNudge = {
        id: `nudge_${Date.now()}`,
        sender: nudgeInput.sender || 'Family Member',
        avatar: nudgeInput.avatar || '❤️',
        message: nudgeInput.message,
        timestamp: new Date().toISOString(),
        read: false
      };
      state.loveNudges.unshift(newNudge);
      return newNudge;
    },

    getVitals: () => state.vitals,
    addVital: (vitalInput) => {
      const newVital = {
        id: `v_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: vitalInput.type,
        value: vitalInput.value,
        status: vitalInput.status || 'normal'
      };
      state.vitals.unshift(newVital);
      return newVital;
    },

    getEmergencyAlerts: () => state.emergencyAlerts,
    addEmergencyAlert: (location) => {
      const alert = {
        id: `sos_${Date.now()}`,
        patientId: state.patient.id,
        patientName: state.patient.name,
        timestamp: new Date().toISOString(),
        location: location || 'Home Residence (Living Room)',
        medicalSnapshot: {
          bloodGroup: state.patient.bloodGroup,
          allergies: state.patient.allergies,
          currentMedications: state.medications.map(m => `${m.name} ${m.dosage}`),
          emergencyContacts: state.patient.emergencyContacts
        }
      };
      state.emergencyAlerts.unshift(alert);
      return alert;
    },

    reset: () => {
      state.patient = clone(initialData.patient);
      state.medications = clone(initialData.medications);
      state.adherenceLogs = clone(initialData.adherenceLogs);
      state.appointments = clone(initialData.appointments);
      state.loveNudges = clone(initialData.loveNudges);
      state.vitals = clone(initialData.vitals);
      state.emergencyAlerts = [];
      AuthService.resetRoles();
    }
  };
}
