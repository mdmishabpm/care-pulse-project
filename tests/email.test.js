import test from 'node:test';
import assert from 'node:assert/strict';
import { EmailReminderService } from '../server/services/emailReminderService.js';

test('EmailReminderService: Generates responsive daily briefing HTML', () => {
  const html = EmailReminderService.generateDailyBriefingHtml({
    patientName: "Arthur Pendelton",
    dateStr: "Sunday, Nov 15, 2026",
    medications: [
      { name: "Metformin", dosage: "500 mg", time: "08:00", compartment: "morning", instructions: "With food" }
    ],
    appointments: [],
    refillAlerts: [{ name: "Atorvastatin", remainingCount: 4 }]
  });

  assert.ok(html.includes("Arthur Pendelton"));
  assert.ok(html.includes("CarePulse Morning Briefing"));
  assert.ok(html.includes("Metformin"));
  assert.ok(html.includes("Pharmacy Refill Notice"));
});

test('EmailReminderService: Generates urgent missed dose warning email', () => {
  const html = EmailReminderService.generateUrgentMissedDoseHtml({
    patientName: "Arthur Pendelton",
    medication: { name: "Lisinopril", dosage: "10 mg", purpose: "Blood Pressure" },
    scheduledTime: "08:00",
    minutesOverdue: 60
  });

  assert.ok(html.includes("URGENT: Missed Medication Alert"));
  assert.ok(html.includes("Lisinopril"));
  assert.ok(html.includes("Overdue by ~60 minutes"));
});
