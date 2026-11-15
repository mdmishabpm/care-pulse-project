import test from 'node:test';
import assert from 'node:assert/strict';
import { AdherenceService } from '../server/services/adherenceService.js';

const mockMeds = [
  { id: "med_1", name: "Metformin", compartment: "morning", time: "08:00", remainingCount: 12, refillThreshold: 5, active: true },
  { id: "med_2", name: "Lisinopril", compartment: "morning", time: "08:00", remainingCount: 3, refillThreshold: 7, active: true },
  { id: "med_3", name: "Atorvastatin", compartment: "night", time: "21:00", remainingCount: 20, refillThreshold: 5, active: true }
];

test('AdherenceService: Calculates 100% adherence when all doses taken', () => {
  const logs = [
    { medicationId: "med_1", status: "taken", date: "2026-11-14" },
    { medicationId: "med_2", status: "taken", date: "2026-11-14" }
  ];
  const metrics = AdherenceService.calculateMetrics(logs, mockMeds);
  assert.equal(metrics.overallPercentage, 100);
  assert.equal(metrics.takenCount, 2);
  assert.equal(metrics.skippedCount, 0);
  assert.equal(metrics.streakDays, 1);
});

test('AdherenceService: Correctly reflects skipped doses', () => {
  const logs = [
    { medicationId: "med_1", status: "taken", date: "2026-11-14" },
    { medicationId: "med_2", status: "skipped", date: "2026-11-14" }
  ];
  const metrics = AdherenceService.calculateMetrics(logs, mockMeds);
  assert.equal(metrics.overallPercentage, 50);
  assert.equal(metrics.takenCount, 1);
  assert.equal(metrics.skippedCount, 1);
});

test('AdherenceService: Flags low inventory refill alerts', () => {
  const alerts = AdherenceService.getRefillAlerts(mockMeds);
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].name, "Lisinopril");
  assert.equal(alerts[0].remainingCount, 3);
  assert.equal(alerts[0].urgent, true);
});

test('AdherenceService: Evaluates schedule status and overdue status', () => {
  // Reference date at 10:00 AM (past the 08:00 meds by > 45 mins)
  const refDate = new Date("2026-11-15T10:00:00");
  const todaySchedule = AdherenceService.getTodaySchedule(mockMeds, [], refDate);
  const morningMed = todaySchedule.find(m => m.id === "med_1");
  const nightMed = todaySchedule.find(m => m.id === "med_3");

  assert.equal(morningMed.status, "overdue");
  assert.equal(morningMed.isOverdue, true);
  assert.equal(nightMed.status, "pending");
});
