// Frontend API Client with Offline-First Local Storage Fallback
import { initialData } from '../../server/data/initialData.js';
import { CalendarService } from '../../server/services/calendarService.js';
import { DrugInteractionService } from '../../server/services/drugInteractionService.js';
import { AdherenceService } from '../../server/services/adherenceService.js';
import { EmailReminderService } from '../../server/services/emailReminderService.js';

const STORAGE_KEY = 'carepulse_state_v1';

const DEFAULT_OFFLINE_ROLES = [
  { id: 'senior', name: 'Arthur (Senior)', badge: '👴 Simple View & Voice', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', maskedPin: '••••' },
  { id: 'caretaker', name: 'Sarah (Caretaker)', badge: '👩‍⚕️ Full Schedule & Alerts', color: 'bg-blue-100 text-blue-800 border-blue-300', maskedPin: '••••' },
  { id: 'family', name: 'David (Family)', badge: '👨‍👩‍👦 Nudges & Peace of Mind', color: 'bg-purple-100 text-purple-800 border-purple-300', maskedPin: '••••' },
  { id: 'doctor', name: 'Dr. Watson (MD)', badge: '🩺 Clinical Review & GCal', color: 'bg-amber-100 text-amber-800 border-amber-300', maskedPin: '••••' }
];

const OFFLINE_DEMO_PINS = {
  senior: '1234',
  caretaker: '8888',
  family: '5555',
  doctor: '9999'
};

class ApiService {
  constructor() {
    this.authToken = null;
    this.initLocalState();
  }

  setAuthToken(token) {
    this.authToken = token || null;
  }

  initLocalState() {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch {
      // Ignore storage access errors in restricted contexts
    }
  }

  getLocalState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(initialData));
    } catch {
      return JSON.parse(JSON.stringify(initialData));
    }
  }

  setLocalState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }

  async request(url, { method = 'GET', body } = {}, fallbackFn) {
    try {
      const headers = {};
      if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
      }
      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
      });

      if (res.ok) {
        return await res.json();
      }
      if (res.status >= 400 && res.status < 500) {
        const errPayload = await res.json().catch(() => null);
        if (errPayload) return { ...errPayload, status: res.status };
      }
    } catch {
      // Network unavailable — use offline fallback
    }
    return fallbackFn();
  }

  async resetToInitialData() {
    return this.request('/api/reset', { method: 'POST' }, () => {
      const fresh = JSON.parse(JSON.stringify(initialData));
      this.setLocalState(fresh);
      return { success: true };
    });
  }

  async verifyPin(pin, role = null) {
    const res = await this.request(
      '/api/auth/verify-pin',
      { method: 'POST', body: { pin, role } },
      () => {
        const cleanPin = String(pin || '').trim();
        const roles = this.getLocalRoles();
        const target = role ? roles.find(r => r.id === role) : null;
        if (target && (target._localPin || OFFLINE_DEMO_PINS[target.id]) === cleanPin) {
          return { success: true, role: target, token: null };
        }
        const matched = roles.find(r => (r._localPin || OFFLINE_DEMO_PINS[r.id]) === cleanPin);
        if (matched) {
          return { success: true, role: matched, token: null };
        }
        return { success: false, error: 'Incorrect PIN. Please re-enter.' };
      }
    );

    if (res?.success && res?.token) {
      this.setAuthToken(res.token);
    }
    return res;
  }

  async getRolesFromApi() {
    return this.request('/api/auth/roles', {}, () => this.getRoles());
  }

  getLocalRoles() {
    const state = this.getLocalState();
    return state.roles || DEFAULT_OFFLINE_ROLES;
  }

  getRoles() {
    return this.getLocalRoles().map(({ _localPin, pin, ...safeRole }) => ({
      ...safeRole,
      maskedPin: '••••'
    }));
  }

  async addRole(newRole) {
    const created = await this.request(
      '/api/auth/roles',
      { method: 'POST', body: newRole },
      () => {
        const state = this.getLocalState();
        if (!state.roles) state.roles = this.getLocalRoles();
        const roleToAdd = {
          id: newRole.id || `user_${Date.now()}`,
          name: newRole.name,
          _localPin: newRole.pin,
          badge: newRole.badge || '👤 Family / Nurse',
          color: newRole.color || 'bg-indigo-100 text-indigo-800 border-indigo-300',
          type: newRole.type || 'family',
          maskedPin: '••••'
        };
        state.roles.push(roleToAdd);
        this.setLocalState(state);
        return roleToAdd;
      }
    );
    return created;
  }

  async updateRole(roleId, updates) {
    const updated = await this.request(
      `/api/auth/roles/${roleId}`,
      { method: 'PUT', body: updates },
      () => {
        const state = this.getLocalState();
        if (!state.roles) state.roles = this.getLocalRoles();
        const idx = state.roles.findIndex(r => r.id === roleId);
        if (idx === -1) return null;
        const { pin, ...rest } = updates;
        state.roles[idx] = {
          ...state.roles[idx],
          ...rest,
          ...(pin ? { _localPin: pin } : {})
        };
        this.setLocalState(state);
        return state.roles[idx];
      }
    );
    return updated;
  }

  async getMedications() {
    return this.request('/api/medications', {}, () => {
      const state = this.getLocalState();
      return {
        medications: state.medications,
        todaySchedule: AdherenceService.getTodaySchedule(state.medications, state.adherenceLogs),
        refillAlerts: AdherenceService.getRefillAlerts(state.medications)
      };
    });
  }

  async markMedicationTaken(id) {
    return this.request(`/api/medications/${id}/take`, { method: 'POST' }, () => {
      const state = this.getLocalState();
      const med = state.medications.find(m => m.id === id);
      if (!med) return { success: false };

      if (med.remainingCount > 0) med.remainingCount -= 1;
      med.lastTaken = new Date().toISOString();

      const log = {
        id: `log_${Date.now()}`,
        medicationId: id,
        date: new Date().toISOString().split('T')[0],
        scheduledTime: med.time,
        status: 'taken',
        timestamp: new Date().toISOString()
      };
      state.adherenceLogs.push(log);

      const unreadNudge = state.loveNudges.find(n => !n.read);
      if (unreadNudge) unreadNudge.read = true;

      this.setLocalState(state);
      return {
        success: true,
        log,
        remainingCount: med.remainingCount,
        needsRefill: med.remainingCount <= (med.refillThreshold || 7),
        loveNudge: unreadNudge || null
      };
    });
  }

  async markMedicationSkipped(id, reason) {
    return this.request(`/api/medications/${id}/skip`, { method: 'POST', body: { reason } }, () => {
      const state = this.getLocalState();
      const med = state.medications.find(m => m.id === id);
      if (!med) return { success: false };

      const log = {
        id: `log_${Date.now()}`,
        medicationId: id,
        date: new Date().toISOString().split('T')[0],
        scheduledTime: med.time,
        status: 'skipped',
        reason,
        timestamp: new Date().toISOString()
      };
      state.adherenceLogs.push(log);
      this.setLocalState(state);
      return { success: true, log };
    });
  }

  async addMedication(medData) {
    return this.request('/api/medications', { method: 'POST', body: medData }, () => {
      const state = this.getLocalState();
      const newMed = {
        id: `med_${Date.now()}`,
        active: true,
        remainingCount: medData.totalQuantity || 30,
        totalQuantity: medData.totalQuantity || 30,
        refillThreshold: medData.refillThreshold || 7,
        shape: medData.shape || 'round',
        color: medData.color || 'white',
        ...medData
      };
      const safetyWarnings = DrugInteractionService.analyzeSafety(state.medications, newMed, state.patient.allergies);
      state.medications.push(newMed);
      this.setLocalState(state);
      return {
        medication: newMed,
        safetyWarnings,
        googleCalendarUrl: CalendarService.createMedicationCalendarUrl(newMed)
      };
    });
  }

  async updateMedication(id, updates) {
    return this.request(`/api/medications/${id}`, { method: 'PUT', body: updates }, () => {
      const state = this.getLocalState();
      const idx = state.medications.findIndex(m => m.id === id);
      if (idx === -1) return null;
      state.medications[idx] = { ...state.medications[idx], ...updates };
      this.setLocalState(state);
      return state.medications[idx];
    });
  }

  async deleteMedication(id) {
    return this.request(`/api/medications/${id}`, { method: 'DELETE' }, () => {
      const state = this.getLocalState();
      state.medications = state.medications.filter(m => m.id !== id);
      this.setLocalState(state);
      return { success: true, removedId: id };
    });
  }

  async getAdherence() {
    return this.request('/api/adherence', {}, () => {
      const state = this.getLocalState();
      return {
        metrics: AdherenceService.calculateMetrics(state.adherenceLogs, state.medications),
        refillAlerts: AdherenceService.getRefillAlerts(state.medications)
      };
    });
  }

  async getAppointments() {
    return this.request('/api/appointments', {}, () => {
      const state = this.getLocalState();
      return state.appointments.map(apt => ({
        ...apt,
        googleCalendarUrl: CalendarService.createAppointmentCalendarUrl(apt)
      }));
    });
  }

  async addAppointment(aptData) {
    return this.request('/api/appointments', { method: 'POST', body: aptData }, () => {
      const state = this.getLocalState();
      const newApt = { id: `apt_${Date.now()}`, status: 'scheduled', ...aptData };
      state.appointments.push(newApt);
      this.setLocalState(state);
      return {
        appointment: newApt,
        googleCalendarUrl: CalendarService.createAppointmentCalendarUrl(newApt)
      };
    });
  }

  async checkSafety(candidateMed = null) {
    const endpoint = candidateMed ? '/api/safety/check-prospective' : '/api/safety/check';
    return this.request(
      endpoint,
      candidateMed ? { method: 'POST', body: { candidateMedication: candidateMed } } : {},
      () => {
        const state = this.getLocalState();
        return {
          warnings: DrugInteractionService.analyzeSafety(state.medications, candidateMed, state.patient.allergies)
        };
      }
    );
  }

  async getNudges() {
    return this.request('/api/nudges', {}, () => this.getLocalState().loveNudges);
  }

  async sendNudge(nudgeData) {
    return this.request('/api/nudges', { method: 'POST', body: nudgeData }, () => {
      const state = this.getLocalState();
      const newNudge = {
        id: `nudge_${Date.now()}`,
        sender: nudgeData.sender || 'Family',
        avatar: nudgeData.avatar || '❤️',
        message: nudgeData.message,
        timestamp: new Date().toISOString(),
        read: false
      };
      state.loveNudges.unshift(newNudge);
      this.setLocalState(state);
      return newNudge;
    });
  }

  async triggerEmergencySos() {
    return this.request('/api/emergency/sos', { method: 'POST' }, () => {
      const state = this.getLocalState();
      return {
        success: true,
        alert: {
          id: `sos_${Date.now()}`,
          patientName: state.patient.name,
          timestamp: new Date().toISOString(),
          location: 'Home Residence',
          medicalSnapshot: {
            bloodGroup: state.patient.bloodGroup,
            allergies: state.patient.allergies,
            currentMedications: state.medications.map(m => `${m.name} ${m.dosage}`),
            emergencyContacts: state.patient.emergencyContacts
          }
        }
      };
    });
  }

  async previewEmailBriefing() {
    return this.request('/api/notifications/preview-briefing', { method: 'POST' }, () => {
      const state = this.getLocalState();
      return {
        recipient: 'sarah.pendelton@example.com (Primary Caretaker)',
        subject: `🌅 Morning Health Briefing for ${state.patient.name}`,
        htmlPreview: EmailReminderService.generateDailyBriefingHtml({
          patientName: state.patient.name,
          dateStr: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
          medications: state.medications,
          appointments: state.appointments,
          refillAlerts: AdherenceService.getRefillAlerts(state.medications)
        })
      };
    });
  }

  async previewUrgentAlert() {
    return this.request('/api/notifications/preview-urgent-alert', { method: 'POST' }, () => {
      const state = this.getLocalState();
      const med = state.medications[0];
      return {
        recipient: 'sarah.pendelton@example.com, david.family@example.com',
        subject: `🚨 URGENT: Missed Medication Alert for ${state.patient.name} (${med.name})`,
        htmlPreview: EmailReminderService.generateUrgentMissedDoseHtml({
          patientName: state.patient.name,
          medication: med,
          scheduledTime: med.time,
          minutesOverdue: 50
        })
      };
    });
  }

  getPatient() {
    return this.getLocalState().patient;
  }

  async getPatientFromApi() {
    return this.request('/api/patient', {}, () => this.getPatient());
  }

  async updatePatient(patientData) {
    const res = await this.request('/api/patient', { method: 'PUT', body: patientData }, () => {
      const state = this.getLocalState();
      state.patient = { ...state.patient, ...patientData };
      this.setLocalState(state);
      return { success: true, patient: state.patient };
    });
    return res?.patient || patientData;
  }

  getVitals() {
    return this.getLocalState().vitals;
  }

  async getVitalsFromApi() {
    return this.request('/api/vitals', {}, () => this.getVitals());
  }

  async addVital(vitalData) {
    return this.request('/api/vitals', { method: 'POST', body: vitalData }, () => {
      const state = this.getLocalState();
      const newVital = {
        id: `v_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...vitalData
      };
      state.vitals.unshift(newVital);
      this.setLocalState(state);
      return newVital;
    });
  }
}

export const api = new ApiService();
