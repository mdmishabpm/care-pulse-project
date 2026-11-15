import test from 'node:test';
import assert from 'node:assert/strict';
import { CalendarService } from '../server/services/calendarService.js';

test('CalendarService: Generates valid Google Calendar Web Intent URL', () => {
  const appointment = {
    doctorName: "Dr. Emily Watson",
    specialty: "Cardiology",
    clinic: "Heart Center",
    phone: "555-0100",
    dateTime: "2026-11-20T14:30:00.000Z",
    purpose: "Routine checkup",
    preparationNotes: "Fasting required"
  };

  const url = CalendarService.createAppointmentCalendarUrl(appointment);
  assert.ok(url.startsWith("https://calendar.google.com/calendar/render"));
  assert.ok(url.includes("action=TEMPLATE"));
  assert.ok(url.includes("Emily+Watson"));
});

test('CalendarService: Generates compliant RFC-5545 iCalendar content', () => {
  const events = [
    {
      title: "Doctor Visit: Dr. Watson",
      details: "Cardiology follow-up",
      location: "Heart Center Clinic",
      startTime: "2026-11-20T14:30:00.000Z",
      durationMinutes: 45
    }
  ];

  const ics = CalendarService.generateIcs(events);
  assert.ok(ics.includes("BEGIN:VCALENDAR"));
  assert.ok(ics.includes("VERSION:2.0"));
  assert.ok(ics.includes("BEGIN:VEVENT"));
  assert.ok(ics.includes("SUMMARY:Doctor Visit: Dr. Watson"));
  assert.ok(ics.includes("END:VEVENT"));
  assert.ok(ics.includes("END:VCALENDAR"));
});
