import { Router } from 'express';
import { AuthService } from '../services/authService.js';
import { CalendarService } from '../services/calendarService.js';
import { validateBody, validateAppointment } from '../utils/inputValidator.js';

export function createAppointmentRouter(store) {
  const router = Router();

  router.get('/appointments', (req, res) => {
    const withLinks = store.getAppointments().map(apt => ({
      ...apt,
      googleCalendarUrl: CalendarService.createAppointmentCalendarUrl(apt)
    }));
    res.json(withLinks);
  });

  router.post('/appointments', validateBody(validateAppointment), (req, res) => {
    const newApt = store.addAppointment(req.body);
    const googleCalendarUrl = CalendarService.createAppointmentCalendarUrl(newApt);
    AuthService.logAudit('APPOINTMENT_SCHEDULE', `Scheduled visit with ${newApt.doctorName}`);
    res.status(201).json({ appointment: newApt, googleCalendarUrl });
  });

  router.get('/calendar/export-ics', (req, res) => {
    const events = store.getAppointments().map(a => ({
      title: `Doctor: ${a.doctorName} (${a.specialty})`,
      details: `${a.purpose}\nPreparation: ${a.preparationNotes || 'None'}`,
      location: a.clinic,
      startTime: a.dateTime,
      durationMinutes: 45
    }));

    const icsContent = CalendarService.generateIcs(events);
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="carepulse-appointments.ics"');
    res.send(icsContent);
  });

  return router;
}
