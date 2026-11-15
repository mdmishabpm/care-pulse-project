// Google Calendar & iCalendar (.ics) Service
// Generates 1-click Google Calendar web intent links and RFC-5545 calendar files.

export class CalendarService {
  /**
   * Format ISO date string to Google Calendar compact format (YYYYMMDDTHHmmssZ).
   */
  static toGoogleCalendarDate(dateStr, durationMinutes = 30) {
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const format = (d) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

    return `${format(start)}/${format(end)}`;
  }

  /**
   * Generate 1-click Google Calendar Web Intent URL.
   * @param {object} event { title, details, location, startTime, durationMinutes }
   * @returns {string} Fully encoded Google Calendar URL
   */
  static generateGoogleCalendarUrl({ title, details, location = "", startTime, durationMinutes = 30 }) {
    const baseUrl = "https://calendar.google.com/calendar/render";
    const dates = this.toGoogleCalendarDate(startTime, durationMinutes);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      details: details,
      location: location,
      dates: dates
    });
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate Google Calendar event link for a Doctor Appointment.
   */
  static createAppointmentCalendarUrl(appointment) {
    const title = `🩺 Medical Visit: ${appointment.doctorName} (${appointment.specialty})`;
    const details = [
      `Clinic: ${appointment.clinic}`,
      `Phone: ${appointment.phone}`,
      `Purpose: ${appointment.purpose}`,
      appointment.preparationNotes ? `\n⚠️ PREPARATION: ${appointment.preparationNotes}` : "",
      "\nScheduled via CarePulse Healthcare Companion."
    ].filter(Boolean).join("\n");

    return this.generateGoogleCalendarUrl({
      title,
      details,
      location: appointment.clinic,
      startTime: appointment.dateTime,
      durationMinutes: 45
    });
  }

  /**
   * Generate Google Calendar event link for Medication Reminder.
   */
  static createMedicationCalendarUrl(medication, dateStr = new Date().toISOString().split('T')[0]) {
    const [hours, minutes] = medication.time.split(':');
    const start = new Date(`${dateStr}T${hours}:${minutes}:00`);
    const title = `💊 Take Medicine: ${medication.name} (${medication.dosage})`;
    const details = [
      `Medication: ${medication.name} - ${medication.dosage}`,
      `Compartment: ${medication.compartment.toUpperCase()}`,
      `Instructions: ${medication.instructions}`,
      `Purpose: ${medication.purpose}`,
      "\nManaged via CarePulse Senior Healthcare Ecosystem."
    ].join("\n");

    return this.generateGoogleCalendarUrl({
      title,
      details,
      location: "Home",
      startTime: start.toISOString(),
      durationMinutes: 15
    });
  }

  /**
   * Generate standard RFC-5545 iCalendar (.ics) content for cross-platform imports.
   */
  static generateIcs(events = []) {
    const pad = (n) => String(n).padStart(2, '0');
    const formatIcsDate = (d) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CarePulse//Elderly Health Companion//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    for (const ev of events) {
      const start = new Date(ev.startTime);
      const end = new Date(start.getTime() + (ev.durationMinutes || 30) * 60 * 1000);
      const uid = `carepulse-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@carepulse.app`;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${formatIcsDate(new Date())}`);
      lines.push(`DTSTART:${formatIcsDate(start)}`);
      lines.push(`DTEND:${formatIcsDate(end)}`);
      lines.push(`SUMMARY:${ev.title.replace(/\n/g, " ")}`);
      if (ev.details) lines.push(`DESCRIPTION:${ev.details.replace(/\n/g, "\\n")}`);
      if (ev.location) lines.push(`LOCATION:${ev.location.replace(/\n/g, " ")}`);
      lines.push("STATUS:CONFIRMED");
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }
}
