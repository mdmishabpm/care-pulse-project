/**
 * @file securityMiddleware.js
 * @description Enterprise-grade security headers, rate-limiting, and input sanitization middleware.
 */

import { InputSanitizer } from '../utils/sanitizer.js';
import { AuthService } from '../services/authService.js';

const failedAttempts = new Map();
const LOCKOUT_THRESHOLD = 4;
const LOCKOUT_DURATION_MS = 30 * 1000;

export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(self), camera=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; object-src 'none'; base-uri 'self';"
  );
  next();
};

export const sanitizeRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = InputSanitizer.sanitize(req.body);
  }
  next();
};

export const rateLimitPinAuth = (req, res, next) => {
  const ip = req.ip || req.socket?.remoteAddress || 'client_ip';
  const now = Date.now();

  // Prune expired lockouts to prevent unbounded map growth
  for (const [key, rec] of failedAttempts.entries()) {
    if (rec.lockedUntil && rec.lockedUntil <= now && rec.count === 0) {
      failedAttempts.delete(key);
    }
  }

  const attemptRecord = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };

  if (attemptRecord.lockedUntil > now) {
    const secondsRemaining = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
    AuthService.logAudit('SECURITY_LOCKOUT', `Brute-force lockout enforced for IP: ${ip}`);
    return res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_FAILED_ATTEMPTS',
        message: `Too many failed PIN attempts. For senior safety, this terminal is locked for ${secondsRemaining}s.`,
        secondsRemaining
      }
    });
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && body.success === false) {
      attemptRecord.count += 1;
      if (attemptRecord.count >= LOCKOUT_THRESHOLD) {
        attemptRecord.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        attemptRecord.count = 0;
        AuthService.logAudit('SECURITY_BRUTE_FORCE_TRIGGERED', `Lockout triggered after ${LOCKOUT_THRESHOLD} consecutive failures.`);
      }
      failedAttempts.set(ip, attemptRecord);
    } else if (body && body.success === true) {
      failedAttempts.delete(ip);
    }
    return originalJson(body);
  };

  next();
};

export const clearRateLimitState = () => {
  failedAttempts.clear();
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required.' }
      });
    }

    const token = authHeader.split(' ')[1];
    const role = AuthService.verifyToken(token);

    if (!role) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Session token expired or tampered with.' }
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role.id)) {
      AuthService.logAudit('ACCESS_DENIED', `Role ${role.id} attempted unauthorized access to ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient role permissions for this operation.' }
      });
    }

    req.user = role;
    next();
  };
};
