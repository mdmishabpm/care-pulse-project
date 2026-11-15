import { Router } from 'express';
import { AdherenceService } from '../services/adherenceService.js';
import { EmailReminderService } from '../services/emailReminderService.js';

export function createNotificationRouter(store) {
  const router = Router();

  router.post('/preview-briefing', (req, res) => {
    const patient = store.getPatient();
    const medications = store.getMedications();
    const html = EmailReminderService.generateDailyBriefingHtml({
      patientName: patient.name,
      dateStr: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      medications,
      appointments: store.getAppointments(),
      refillAlerts: AdherenceService.getRefillAlerts(medications)
    });
    res.json({
      recipient: 'sarah.pendelton@example.com (Primary Caretaker)',
      subject: `🌅 Morning Health Briefing for ${patient.name}`,
      htmlPreview: html
    });
  });

  router.post('/preview-urgent-alert', (req, res) => {
    const patient = store.getPatient();
    const medications = store.getMedications();
    const overdueMed = medications[0];
    if (!overdueMed) {
      return res.status(404).json({ error: 'No medications available to preview urgent alert' });
    }
    const html = EmailReminderService.generateUrgentMissedDoseHtml({
      patientName: patient.name,
      medication: overdueMed,
      scheduledTime: overdueMed.time,
      minutesOverdue: 55
    });
    res.json({
      recipient: 'sarah.pendelton@example.com, david.family@example.com',
      subject: `🚨 URGENT: Missed Medication Alert for ${patient.name} (${overdueMed.name})`,
      htmlPreview: html
    });
  });

  return router;
}
