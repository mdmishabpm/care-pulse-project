import { Router } from 'express';
import { AuthService } from '../services/authService.js';
import { AdherenceService } from '../services/adherenceService.js';
import { DrugInteractionService } from '../services/drugInteractionService.js';
import { CalendarService } from '../services/calendarService.js';
import { validateMedicationRequest, validateBody, validateMedication } from '../utils/inputValidator.js';

export function createMedicationRouter(store) {
  const router = Router();

  router.get('/medications', (req, res) => {
    const medications = store.getMedications();
    const todaySchedule = AdherenceService.getTodaySchedule(medications, store.getAdherenceLogs());
    res.json({
      medications,
      todaySchedule,
      refillAlerts: AdherenceService.getRefillAlerts(medications)
    });
  });

  router.post('/medications', validateMedicationRequest, (req, res) => {
    const existing = store.getMedications();
    const patient = store.getPatient();
    const newMed = store.addMedication(req.body);
    const safetyWarnings = DrugInteractionService.analyzeSafety(existing.slice(0, -1), newMed, patient.allergies);

    AuthService.logAudit('MEDICATION_ADD', `Added medication ${newMed.name} (${newMed.dosage})`);
    res.status(201).json({
      medication: newMed,
      safetyWarnings,
      googleCalendarUrl: CalendarService.createMedicationCalendarUrl(newMed)
    });
  });

  router.put('/medications/:id', validateBody((b) => validateMedication(b, { isUpdate: true })), (req, res) => {
    const updated = store.updateMedication(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    AuthService.logAudit('MEDICATION_UPDATE', `Updated medication ${updated.name}`);
    res.json(updated);
  });

  router.delete('/medications/:id', (req, res) => {
    const removed = store.deleteMedication(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    AuthService.logAudit('MEDICATION_DELETE', `Removed medication ${removed.name}`);
    res.json({ success: true, removedId: req.params.id });
  });

  router.post('/medications/:id/take', (req, res) => {
    const outcome = store.recordMedicationTaken(req.params.id);
    if (!outcome) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    const { med, logEntry, unreadNudge } = outcome;
    AuthService.logAudit('MEDICATION_TAKEN', `Arthur logged ${med.name} as TAKEN.`);

    res.json({
      success: true,
      log: logEntry,
      remainingCount: med.remainingCount,
      needsRefill: med.remainingCount <= (med.refillThreshold || 7),
      loveNudge: unreadNudge
    });
  });

  router.post('/medications/:id/skip', (req, res) => {
    const reason = typeof req.body?.reason === 'string' ? req.body.reason : 'Unspecified by patient';
    const outcome = store.recordMedicationSkipped(req.params.id, reason);
    if (!outcome) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    AuthService.logAudit('MEDICATION_SKIPPED', `Medication ${outcome.med.name} marked SKIPPED. Reason: ${reason}`);
    res.json({ success: true, log: outcome.logEntry });
  });

  router.get('/adherence', (req, res) => {
    const medications = store.getMedications();
    const metrics = AdherenceService.calculateMetrics(store.getAdherenceLogs(), medications);
    const refillAlerts = AdherenceService.getRefillAlerts(medications);
    res.json({ metrics, refillAlerts });
  });

  return router;
}
