/**
 * @file emailReminderService.js
 * @description Proactive Email & Gmail API Reminder Service.
 * Generates XSS-safe responsive HTML notifications for caregivers and families.
 */

import { escapeHtml } from '../utils/sanitizer.js';

export class EmailReminderService {
  /**
   * Generate daily morning briefing HTML email for caregivers.
   */
  static generateDailyBriefingHtml({ patientName, dateStr, medications = [], appointments = [], refillAlerts = [] }) {
    const safePatientName = escapeHtml(patientName);
    const safeDateStr = escapeHtml(dateStr);

    const medRows = medications.map(m => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">${escapeHtml(m.name)} (${escapeHtml(m.dosage)})</td>
        <td style="padding: 10px 12px; color: #475569;">${escapeHtml(m.time)} (${escapeHtml(m.compartment)})</td>
        <td style="padding: 10px 12px; color: #64748b;">${escapeHtml(m.instructions)}</td>
      </tr>
    `).join('');

    const aptSection = appointments.length ? `
      <div style="margin-top: 24px; padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #166534;">🩺 Upcoming Doctor Appointments</h3>
        ${appointments.map(a => `
          <div style="margin-bottom: 12px;">
            <strong>${escapeHtml(a.doctorName)} (${escapeHtml(a.specialty)})</strong><br/>
            <span>📅 ${escapeHtml(new Date(a.dateTime).toLocaleString())}</span><br/>
            <span style="color: #4b5563;">📍 ${escapeHtml(a.clinic)}</span><br/>
            <span style="color: #b45309; font-size: 13px;">⚠️ ${escapeHtml(a.preparationNotes || 'Standard checkup')}</span>
          </div>
        `).join('')}
      </div>
    ` : '';

    const refillSection = refillAlerts.length ? `
      <div style="margin-top: 20px; padding: 16px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #991b1b;">⚠️ Pharmacy Refill Notice</h3>
        <ul>
          ${refillAlerts.map(r => `<li><strong>${escapeHtml(r.name)}</strong> - Only ${escapeHtml(r.remainingCount)} pills left!</li>`).join('')}
        </ul>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CarePulse Daily Briefing</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; color: white;">
            <h1 style="margin: 0; font-size: 24px;">CarePulse Morning Briefing</h1>
            <p style="margin: 6px 0 0; opacity: 0.9;">Healthcare &amp; Medication Schedule for ${safePatientName} - ${safeDateStr}</p>
          </div>
          <div style="padding: 24px;">
            <h3 style="margin-top: 0; color: #1e293b;">💊 Scheduled Medications for Today</h3>
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
              <thead>
                <tr style="background-color: #f1f5f9; color: #475569;">
                  <th style="padding: 10px 12px;">Medication</th>
                  <th style="padding: 10px 12px;">Time</th>
                  <th style="padding: 10px 12px;">Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${medRows}
              </tbody>
            </table>
            ${aptSection}
            ${refillSection}
            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
              Sent automatically by CarePulse Healthcare Ecosystem • Powered by Google Workspace &amp; Gmail API
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate Urgent Missed Medication Warning email.
   */
  static generateUrgentMissedDoseHtml({ patientName, medication, scheduledTime, minutesOverdue }) {
    const safePatientName = escapeHtml(patientName);
    const safeMedName = escapeHtml(medication?.name || 'Medication');
    const safeDosage = escapeHtml(medication?.dosage || '');
    const safePurpose = escapeHtml(medication?.purpose || 'Prescribed health regimen');
    const safeScheduledTime = escapeHtml(scheduledTime);
    const safeOverdue = escapeHtml(minutesOverdue);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>URGENT: Missed Medication Alert</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fef2f2; padding: 24px;">
        <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border: 2px solid #ef4444; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #dc2626; padding: 20px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 22px;">⚠️ URGENT: Missed Medication Alert</h2>
            <p style="margin: 4px 0 0; font-size: 15px;">Action Required for ${safePatientName}</p>
          </div>
          <div style="padding: 24px; color: #1f2937;">
            <p style="font-size: 16px; line-height: 1.5;">
              <strong>${safePatientName}</strong> has not recorded taking their scheduled dose of 
              <span style="color: #dc2626; font-weight: 700;">${safeMedName} (${safeDosage})</span>.
            </p>
            <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 16px 0;">
              <div><strong>Scheduled Time:</strong> ${safeScheduledTime}</div>
              <div><strong>Status:</strong> Overdue by ~${safeOverdue} minutes</div>
              <div><strong>Purpose:</strong> ${safePurpose}</div>
            </div>
            <p style="font-size: 14px; color: #4b5563;">
              Please check in with ${safePatientName} or their primary caregiver to ensure their wellbeing.
            </p>
            <div style="margin-top: 24px; text-align: center;">
              <a href="tel:+15552345678" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
                📞 Call Caregiver Immediately
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
