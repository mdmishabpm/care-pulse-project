/**
 * @file sanitizer.js
 * @description Input sanitization, prototype-pollution protection, and XSS prevention utilities for CarePulse.
 */

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class InputSanitizer {
  /**
   * Sanitize a single string value to prevent XSS and script injection.
   * @param {string} val
   * @returns {string} Sanitized string
   */
  static cleanString(val) {
    if (typeof val !== 'string') return val;
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Recursively sanitize all string fields in an object or array while blocking prototype pollution keys.
   * @param {any} obj
   * @returns {any} Sanitized clone
   */
  static sanitize(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return this.cleanString(obj);
    if (Array.isArray(obj)) return obj.map(item => this.sanitize(item));
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanKey = this.cleanString(key);
        if (FORBIDDEN_KEYS.has(cleanKey)) continue;
        sanitized[cleanKey] = this.sanitize(value);
      }
      return sanitized;
    }
    return obj;
  }
}
