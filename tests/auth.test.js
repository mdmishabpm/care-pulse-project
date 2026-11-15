import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../server/services/authService.js';
import { InputSanitizer } from '../server/utils/sanitizer.js';

test('AuthService: Validates Senior PIN (1234) using PBKDF2 salted hash', () => {
  const result = AuthService.verifyPin("1234", "senior");
  assert.equal(result.success, true);
  assert.equal(result.role.id, "senior");
  assert.ok(result.token);
  assert.ok(result.token.includes('.')); // Payload.Signature format
  assert.ok(result.role.permissions.includes("log:intake"));
});

test('AuthService: Validates Caretaker PIN (8888) with constant-time equality', () => {
  const result = AuthService.verifyPin("8888", "caretaker");
  assert.equal(result.success, true);
  assert.equal(result.role.id, "caretaker");
  assert.ok(result.role.permissions.includes("edit:medications"));
});

test('AuthService: Rejects incorrect PIN', () => {
  const result = AuthService.verifyPin("0000", "senior");
  assert.equal(result.success, false);
  assert.ok(result.error);
});

test('AuthService: Auto-detects role without explicit requestedRole', () => {
  const result = AuthService.verifyPin("5555");
  assert.equal(result.success, true);
  assert.equal(result.role.id, "family");
});

test('AuthService: Generates and verifies HMAC-SHA256 signed session token', () => {
  const result = AuthService.verifyPin("1234");
  assert.ok(result.token);
  const verifiedRole = AuthService.verifyToken(result.token);
  assert.ok(verifiedRole);
  assert.equal(verifiedRole.id, "senior");
});

test('AuthService: Rejects tampered or forged session token', () => {
  const result = AuthService.verifyPin("1234");
  const [payload, sig] = result.token.split('.');
  // Tamper with payload
  const tamperedPayload = Buffer.from(JSON.stringify({ roleId: 'caretaker', expiresAt: Date.now() + 9999999 })).toString('base64url');
  const forgedToken = `${tamperedPayload}.${sig}`;

  const verified = AuthService.verifyToken(forgedToken);
  assert.equal(verified, null, 'Forged token must be rejected');
});

test('InputSanitizer: Strips XSS script tags and event handlers', () => {
  const maliciousInput = {
    name: "Metformin <script>alert('XSS')</script>",
    instructions: "Take with water <img src=x onerror=alert(1)>",
    dosage: "500 mg"
  };

  const cleaned = InputSanitizer.sanitize(maliciousInput);
  assert.equal(cleaned.name, "Metformin");
  assert.equal(cleaned.instructions, "Take with water");
  assert.equal(cleaned.dosage, "500 mg");
});
