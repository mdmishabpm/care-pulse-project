/**
 * @file apiIntegration.test.js
 * @description End-to-end HTTP integration tests exercising the split Express routers over real TCP sockets.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../server/app.js';
import { clearRateLimitState } from '../server/middleware/securityMiddleware.js';
import { AuthService } from '../server/services/authService.js';

async function withServer(fn) {
  clearRateLimitState();
  AuthService.resetRoles();
  const app = createApp();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('HTTP Integration: GET /api/health returns healthy status and OWASP security headers', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    const body = await res.json();
    assert.equal(body.status, 'healthy');
    assert.equal(body.security.pinHashing, 'PBKDF2-SHA256');
  });
});

test('HTTP Integration: Auth verify-pin, RBAC protection, and roles do not leak plaintext PINs', async () => {
  await withServer(async (baseUrl) => {
    // Public roles list must NOT leak plaintext PINs
    const rolesRes = await fetch(`${baseUrl}/api/auth/roles`);
    assert.equal(rolesRes.status, 200);
    const roles = await rolesRes.json();
    assert.ok(roles.length >= 4);
    for (const role of roles) {
      assert.equal(role.pin, undefined, 'Plaintext PIN must never be exposed by /api/auth/roles');
      assert.equal(role.maskedPin, '••••');
    }

    // Invalid PIN format returns 400
    const badPinRes = await fetch(`${baseUrl}/api/auth/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 'abc', role: 'senior' })
    });
    assert.equal(badPinRes.status, 400);

    // Wrong PIN returns 401
    const wrongPinRes = await fetch(`${baseUrl}/api/auth/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '0000', role: 'caretaker' })
    });
    assert.equal(wrongPinRes.status, 401);

    // Unauthenticated audit-log returns 401
    const unauthAudit = await fetch(`${baseUrl}/api/security/audit-log`);
    assert.equal(unauthAudit.status, 401);

    // Senior token cannot access caretaker-only audit-log (403)
    const seniorAuth = await fetch(`${baseUrl}/api/auth/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '1234', role: 'senior' })
    }).then(r => r.json());
    assert.equal(seniorAuth.success, true);

    const forbiddenAudit = await fetch(`${baseUrl}/api/security/audit-log`, {
      headers: { Authorization: `Bearer ${seniorAuth.token}` }
    });
    assert.equal(forbiddenAudit.status, 403);

    // Caretaker token accesses audit-log and creates/updates roles
    const caretakerAuth = await fetch(`${baseUrl}/api/auth/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '8888', role: 'caretaker' })
    }).then(r => r.json());
    assert.equal(caretakerAuth.success, true);

    const auditRes = await fetch(`${baseUrl}/api/security/audit-log`, {
      headers: { Authorization: `Bearer ${caretakerAuth.token}` }
    });
    assert.equal(auditRes.status, 200);
    const logs = await auditRes.json();
    assert.ok(Array.isArray(logs) && logs.length > 0);

    const createRoleRes = await fetch(`${baseUrl}/api/auth/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${caretakerAuth.token}`
      },
      body: JSON.stringify({ name: 'Nurse Maya', pin: '4321', type: 'caretaker' })
    });
    assert.equal(createRoleRes.status, 201);
    const createdRole = await createRoleRes.json();
    assert.equal(createdRole.pin, undefined);

    const newVerify = await fetch(`${baseUrl}/api/auth/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '4321', role: createdRole.id })
    });
    assert.equal(newVerify.status, 200);
  });
});

test('HTTP Integration: Medication CRUD, intake take/skip, adherence, and safety warnings', async () => {
  await withServer(async (baseUrl) => {
    const initialMeds = await fetch(`${baseUrl}/api/medications`).then(r => r.json());
    assert.ok(Array.isArray(initialMeds.medications));
    assert.ok(initialMeds.medications.length >= 1);

    // Invalid medication returns 400
    const badMed = await fetch(`${baseUrl}/api/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' })
    });
    assert.equal(badMed.status, 400);

    // Add Aspirin when Warfarin exists or add Warfarin + Aspirin to trigger warning
    await fetch(`${baseUrl}/api/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Warfarin', dosage: '5mg', time: '08:00', compartment: 'morning' })
    });
    const addAspirinRes = await fetch(`${baseUrl}/api/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Aspirin', dosage: '81mg', time: '08:00', compartment: 'morning' })
    });
    assert.equal(addAspirinRes.status, 201);
    const aspirinData = await addAspirinRes.json();
    assert.ok(aspirinData.medication.id);
    assert.ok(aspirinData.safetyWarnings.length > 0);
    assert.ok(aspirinData.googleCalendarUrl.startsWith('https://calendar.google.com/'));

    // Take medication
    const takeRes = await fetch(`${baseUrl}/api/medications/${aspirinData.medication.id}/take`, {
      method: 'POST'
    });
    assert.equal(takeRes.status, 200);
    const takeData = await takeRes.json();
    assert.equal(takeData.success, true);
    assert.equal(takeData.remainingCount, 29);

    // Skip medication
    const skipRes = await fetch(`${baseUrl}/api/medications/${aspirinData.medication.id}/skip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Doctor held dose' })
    });
    assert.equal(skipRes.status, 200);

    // 404 for unknown medication
    const missingTake = await fetch(`${baseUrl}/api/medications/nonexistent_id/take`, { method: 'POST' });
    assert.equal(missingTake.status, 404);

    // Delete medication
    const delRes = await fetch(`${baseUrl}/api/medications/${aspirinData.medication.id}`, {
      method: 'DELETE'
    });
    assert.equal(delRes.status, 200);

    // Adherence endpoint
    const adhRes = await fetch(`${baseUrl}/api/adherence`);
    assert.equal(adhRes.status, 200);
    const adhData = await adhRes.json();
    assert.ok(typeof adhData.metrics.overallPercentage === 'number');
  });
});

test('HTTP Integration: Patient, Appointments, ICS Export, Nudges, Vitals, SOS, Email Previews, Reset, and 404', async () => {
  await withServer(async (baseUrl) => {
    // Patient GET & PUT
    const patient = await fetch(`${baseUrl}/api/patient`).then(r => r.json());
    assert.ok(patient.name);

    const putPatient = await fetch(`${baseUrl}/api/patient`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Updated clinical note <script>alert(1)</script>' })
    });
    assert.equal(putPatient.status, 200);
    const putData = await putPatient.json();
    assert.equal(putData.patient.notes, 'Updated clinical note');

    // Appointments & ICS
    const aptRes = await fetch(`${baseUrl}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorName: 'Dr. Alice Chen',
        specialty: 'Cardiology',
        clinic: 'Heart Clinic',
        dateTime: '2026-12-01T10:00:00.000Z'
      })
    });
    assert.equal(aptRes.status, 201);

    const icsRes = await fetch(`${baseUrl}/api/calendar/export-ics`);
    assert.equal(icsRes.status, 200);
    assert.ok(icsRes.headers.get('content-type').includes('text/calendar'));
    const icsText = await icsRes.text();
    assert.ok(icsText.includes('BEGIN:VCALENDAR'));

    // Nudges
    const badNudge = await fetch(`${baseUrl}/api/nudges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' })
    });
    assert.equal(badNudge.status, 400);

    const goodNudge = await fetch(`${baseUrl}/api/nudges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'Sarah', message: 'Proud of you!' })
    });
    assert.equal(goodNudge.status, 201);

    // Vitals
    const vitalRes = await fetch(`${baseUrl}/api/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'Blood Pressure', value: '118/76 mmHg', status: 'normal' })
    });
    assert.equal(vitalRes.status, 201);

    // Emergency SOS
    const sosRes = await fetch(`${baseUrl}/api/emergency/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: 'Kitchen' })
    });
    assert.equal(sosRes.status, 201);
    const sosData = await sosRes.json();
    assert.equal(sosData.alert.location, 'Kitchen');

    // Email previews
    const briefingRes = await fetch(`${baseUrl}/api/notifications/preview-briefing`, { method: 'POST' });
    assert.equal(briefingRes.status, 200);
    const briefingData = await briefingRes.json();
    assert.ok(briefingData.htmlPreview.includes('CarePulse Morning Briefing'));

    const urgentRes = await fetch(`${baseUrl}/api/notifications/preview-urgent-alert`, { method: 'POST' });
    assert.equal(urgentRes.status, 200);

    // Prospective safety check validation
    const badSafety = await fetch(`${baseUrl}/api/safety/check-prospective`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(badSafety.status, 400);

    // Demo reset
    const resetRes = await fetch(`${baseUrl}/api/reset`, { method: 'POST' });
    assert.equal(resetRes.status, 200);

    // Unknown API route returns 404 JSON
    const unknownRes = await fetch(`${baseUrl}/api/does-not-exist`);
    assert.equal(unknownRes.status, 404);
    const unknownBody = await unknownRes.json();
    assert.equal(unknownBody.error.code, 'NOT_FOUND');
  });
});
