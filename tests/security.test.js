import test from 'node:test';
import assert from 'node:assert/strict';
import { securityHeaders, rateLimitPinAuth } from '../server/middleware/securityMiddleware.js';

test('SecurityMiddleware: Injects OWASP protection headers', () => {
  const headers = {};
  const mockReq = {};
  const mockRes = {
    setHeader: (key, val) => { headers[key] = val; }
  };

  securityHeaders(mockReq, mockRes, () => {});

  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['X-XSS-Protection'], '1; mode=block');
  assert.ok(headers['Strict-Transport-Security']);
  assert.ok(headers['Content-Security-Policy']);
});

test('SecurityMiddleware: Enforces rate-limiting lockout after repeated failures', () => {
  const ip = '192.168.1.100';
  const mockReq = { ip };
  let statusCode = 200;
  let responseBody = null;

  const createMockRes = () => ({
    status: (code) => {
      statusCode = code;
      return {
        json: (b) => { responseBody = b; return b; }
      };
    },
    json: (b) => { responseBody = b; return b; }
  });

  // Simulate 4 failed attempts
  for (let i = 0; i < 4; i++) {
    const res = createMockRes();
    rateLimitPinAuth(mockReq, res, () => {});
    res.json({ success: false, error: 'Incorrect PIN' });
  }

  // 5th attempt should be locked out with HTTP 429
  const res5 = createMockRes();
  let nextCalled = false;
  rateLimitPinAuth(mockReq, res5, () => { nextCalled = true; });

  assert.equal(statusCode, 429);
  assert.equal(responseBody.error.code, 'TOO_MANY_FAILED_ATTEMPTS');
  assert.equal(nextCalled, false);
});
