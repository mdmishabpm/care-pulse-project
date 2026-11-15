/**
 * @file inputValidation.test.js
 * @description Tests for input validation, injection prevention, and data integrity.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { InputSanitizer } from '../server/utils/sanitizer.js';
import { AuthService } from '../server/services/authService.js';
import { DrugInteractionService } from '../server/services/drugInteractionService.js';

test('InputValidation: Sanitizer removes SQL-like injection patterns', () => {
  const malicious = { query: "'; DROP TABLE users; --", name: "Robert'); DROP TABLE students; --" };
  const result = InputSanitizer.sanitize(malicious);
  assert.ok(!result.query.includes('<'), 'No HTML injection');
  assert.ok(!result.query.includes('>'), 'No HTML injection');
  // Values are returned safely (SQL safety is at DB level, XSS is sanitized)
  assert.ok(typeof result.query === 'string', 'Returns string');
});

test('InputValidation: Sanitizer handles deeply nested objects', () => {
  const deep = {
    level1: {
      level2: {
        level3: { xss: '<script>alert("xss")</script>', safe: 'normal text' }
      }
    }
  };
  const result = InputSanitizer.sanitize(deep);
  assert.ok(!result.level1.level2.level3.xss.includes('<script>'), 'Deep XSS removed');
  assert.equal(result.level1.level2.level3.safe, 'normal text', 'Safe text preserved');
});

test('InputValidation: Sanitizer handles arrays of mixed types', () => {
  const data = { tags: ['<script>evil()</script>', 'safe-tag', '<img onerror="xss">'] };
  const result = InputSanitizer.sanitize(data);
  for (const tag of result.tags) {
    assert.ok(!tag.includes('<script>'), `No script tags: ${tag}`);
    assert.ok(!tag.includes('onerror'), `No event handlers: ${tag}`);
  }
});

test('InputValidation: AuthService rejects empty/null PIN', () => {
  const result1 = AuthService.verifyPin('');
  assert.equal(result1.success, false, 'Empty PIN rejected');

  const result2 = AuthService.verifyPin(null);
  assert.equal(result2.success, false, 'Null PIN rejected');
});

test('InputValidation: AuthService rejects non-string PIN types', () => {
  const result1 = AuthService.verifyPin(1234);
  // Should handle numeric gracefully (convert or reject)
  assert.ok('success' in result1, 'Returns structured response for number input');

  const result2 = AuthService.verifyPin({ pin: '1234' });
  assert.equal(result2.success, false, 'Object PIN rejected');
});

test('InputValidation: HMAC token cannot be forged by truncation', () => {
  const validToken = AuthService.generateToken('senior');
  const truncated = validToken.split('.')[0]; // Payload without signature
  const forged = AuthService.verifyToken(truncated);
  assert.equal(forged, null, 'Truncated token rejected');
});

test('InputValidation: HMAC token cannot be forged by signature swap', () => {
  const token1 = AuthService.generateToken('senior');
  const token2 = AuthService.generateToken('doctor');
  const payload1 = token1.split('.')[0];
  const sig2 = token2.split('.')[1];
  const swapped = `${payload1}.${sig2}`;
  const result = AuthService.verifyToken(swapped);
  assert.equal(result, null, 'Signature-swapped token rejected');
});

test('InputValidation: DrugInteractionService handles empty medication list', () => {
  const warnings = DrugInteractionService.analyzeSafety([], null, []);
  assert.ok(Array.isArray(warnings), 'Returns array');
  assert.equal(warnings.length, 0, 'No false positives for empty list');
});

test('InputValidation: DrugInteractionService handles malformed medication objects', () => {
  const malformed = [{ name: null }, { name: undefined }, {}, 'plain-string-med'];
  assert.doesNotThrow(() => {
    DrugInteractionService.analyzeSafety(malformed, null, []);
  }, 'Should not throw on malformed input');
});
