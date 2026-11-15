/**
 * @file authService.js
 * @description Enterprise-grade Authentication & Passcode Service.
 * Implements PBKDF2 cryptographic salted hashing, constant-time verification,
 * HMAC-SHA256 tamper-proof session tokens, and security audit trails.
 */

import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 Hours

/**
 * Hash a passcode using PBKDF2 with a cryptographic salt.
 * @param {string} pin Passcode
 * @param {string} salt Cryptographic salt
 * @returns {string} Hex encoded hash
 */
function hashPin(pin, salt) {
  return crypto.pbkdf2Sync(String(pin).trim(), salt, 10000, 32, 'sha256').toString('hex');
}

const DEFAULT_SALTS = {
  senior: 'salt_carepulse_senior_9812',
  caretaker: 'salt_carepulse_caretaker_4523',
  family: 'salt_carepulse_family_7719',
  doctor: 'salt_carepulse_doctor_3391'
};

function createDefaultRoles() {
  return {
    senior: {
      id: 'senior',
      name: 'Arthur (Senior)',
      salt: DEFAULT_SALTS.senior,
      pinHash: hashPin('1234', DEFAULT_SALTS.senior),
      badge: '👴 Simple View & Voice',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      permissions: ['view:schedule', 'log:intake', 'trigger:sos', 'view:nudges'],
      uiMode: 'senior_accessible'
    },
    caretaker: {
      id: 'caretaker',
      name: 'Sarah (Caretaker)',
      salt: DEFAULT_SALTS.caretaker,
      pinHash: hashPin('8888', DEFAULT_SALTS.caretaker),
      badge: '👩‍⚕️ Full Schedule & Alerts',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      permissions: [
        'view:schedule',
        'log:intake',
        'edit:medications',
        'edit:appointments',
        'view:vitals',
        'edit:vitals',
        'export:reports',
        'trigger:sos',
        'send:nudge',
        'manage:profiles'
      ],
      uiMode: 'caretaker_comprehensive'
    },
    family: {
      id: 'family',
      name: 'David (Family)',
      salt: DEFAULT_SALTS.family,
      pinHash: hashPin('5555', DEFAULT_SALTS.family),
      badge: '👨‍👩‍👦 Nudges & Peace of Mind',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      permissions: ['view:schedule', 'view:adherence', 'send:nudge', 'view:nudges'],
      uiMode: 'family_peace_of_mind'
    },
    doctor: {
      id: 'doctor',
      name: 'Dr. Watson (MD)',
      salt: DEFAULT_SALTS.doctor,
      pinHash: hashPin('9999', DEFAULT_SALTS.doctor),
      badge: '🩺 Clinical Review & GCal',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      permissions: ['view:schedule', 'view:adherence', 'view:vitals', 'export:reports', 'edit:appointments'],
      uiMode: 'doctor_clinical'
    }
  };
}

let ROLES = createDefaultRoles();
const auditLog = [];

const UI_MODE_BY_TYPE = {
  senior: 'senior_accessible',
  caretaker: 'caretaker_comprehensive',
  doctor: 'doctor_clinical',
  family: 'family_peace_of_mind'
};

export class AuthService {
  /**
   * Return public role metadata without exposing plaintext PINs.
   */
  static getRoles() {
    return Object.values(ROLES).map(r => ({
      id: r.id,
      name: r.name,
      badge: r.badge,
      color: r.color,
      permissions: r.permissions,
      uiMode: r.uiMode,
      maskedPin: '••••'
    }));
  }

  /**
   * Reset roles to defaults (useful for demo reset and testing).
   */
  static resetRoles() {
    ROLES = createDefaultRoles();
  }

  /**
   * Update role passcode with fresh cryptographic salt.
   */
  static updateRole(roleId, updates) {
    if (!ROLES[roleId]) return null;

    if (updates.pin) {
      const newSalt = crypto.randomBytes(16).toString('hex');
      ROLES[roleId].salt = newSalt;
      ROLES[roleId].pinHash = hashPin(updates.pin, newSalt);
    }

    if (updates.name) ROLES[roleId].name = updates.name;
    if (updates.badge) ROLES[roleId].badge = updates.badge;

    this.logAudit('ROLE_SECURITY_UPDATE', `Updated security credentials for role ${roleId}`);
    return {
      id: ROLES[roleId].id,
      name: ROLES[roleId].name,
      badge: ROLES[roleId].badge,
      color: ROLES[roleId].color,
      permissions: ROLES[roleId].permissions,
      uiMode: ROLES[roleId].uiMode,
      maskedPin: '••••'
    };
  }

  /**
   * Add a new profile with salted credentials.
   */
  static addRole(roleData) {
    const id = roleData.id || `user_${Date.now()}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const pin = roleData.pin || '0000';

    ROLES[id] = {
      id,
      name: roleData.name || 'Family Member',
      salt,
      pinHash: hashPin(pin, salt),
      badge: roleData.badge || '👤 Custom User',
      color: roleData.color || 'bg-indigo-100 text-indigo-800 border-indigo-300',
      permissions: roleData.permissions || ['view:schedule', 'send:nudge'],
      uiMode: roleData.uiMode || UI_MODE_BY_TYPE[roleData.type] || 'family_peace_of_mind'
    };

    this.logAudit('ROLE_CREATED', `Registered new profile ${ROLES[id].name} (${id})`);
    return {
      id: ROLES[id].id,
      name: ROLES[id].name,
      badge: ROLES[id].badge,
      color: ROLES[id].color,
      permissions: ROLES[id].permissions,
      uiMode: ROLES[id].uiMode,
      maskedPin: '••••'
    };
  }

  /**
   * Verify entered PIN using constant-time cryptographic hash comparison.
   */
  static verifyPin(pin, requestedRole = null) {
    if (!pin || typeof pin !== 'string') {
      return { success: false, error: 'Invalid PIN format. 4 digits required.' };
    }

    const cleanPin = pin.trim();

    const checkRoleHash = (role) => {
      const candidateHash = hashPin(cleanPin, role.salt);
      const bufA = Buffer.from(candidateHash, 'hex');
      const bufB = Buffer.from(role.pinHash, 'hex');
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    };

    if (requestedRole && ROLES[requestedRole]) {
      const role = ROLES[requestedRole];
      if (checkRoleHash(role)) {
        this.logAudit('AUTH_SUCCESS', `Role ${requestedRole} authenticated successfully.`);
        return {
          success: true,
          role: { id: role.id, name: role.name, permissions: role.permissions, uiMode: role.uiMode },
          token: this.generateToken(role.id)
        };
      }
      this.logAudit('AUTH_FAILURE', `Failed PIN attempt for role ${requestedRole}.`);
      return { success: false, error: 'Incorrect PIN for selected role.' };
    }

    for (const [roleKey, role] of Object.entries(ROLES)) {
      if (checkRoleHash(role)) {
        this.logAudit('AUTH_SUCCESS', `Role ${roleKey} auto-authenticated via PIN.`);
        return {
          success: true,
          role: { id: role.id, name: role.name, permissions: role.permissions, uiMode: role.uiMode },
          token: this.generateToken(role.id)
        };
      }
    }

    this.logAudit('AUTH_FAILURE', 'Invalid PIN entered.');
    return { success: false, error: 'Unrecognized PIN. Please try again.' };
  }

  static generateToken(roleId) {
    const now = Date.now();
    const payload = JSON.stringify({
      roleId,
      issuedAt: now,
      expiresAt: now + TOKEN_EXPIRY_MS,
      nonce: crypto.randomBytes(8).toString('hex')
    });
    const payloadBase64 = Buffer.from(payload).toString('base64url');
    const signature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadBase64)
      .digest('hex');

    return `${payloadBase64}.${signature}`;
  }

  static verifyToken(token) {
    try {
      if (!token || typeof token !== 'string') return null;
      const parts = token.split('.');
      if (parts.length !== 2) return null;

      const [payloadBase64, providedSig] = parts;

      const expectedSig = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(payloadBase64)
        .digest('hex');

      const bufProvided = Buffer.from(providedSig, 'hex');
      const bufExpected = Buffer.from(expectedSig, 'hex');

      if (bufProvided.length !== bufExpected.length) return null;
      if (!crypto.timingSafeEqual(bufProvided, bufExpected)) return null;

      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));

      if (Date.now() > payload.expiresAt) {
        this.logAudit('SESSION_EXPIRED', `Expired session token for role: ${payload.roleId}`);
        return null;
      }

      const role = ROLES[payload.roleId];
      if (!role) return null;

      return {
        id: role.id,
        name: role.name,
        permissions: role.permissions,
        uiMode: role.uiMode
      };
    } catch {
      return null;
    }
  }

  static logAudit(action, details) {
    const entry = {
      id: `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
      action,
      details
    };
    auditLog.push(entry);
    if (auditLog.length > 500) auditLog.shift();
    return entry;
  }

  static getAuditLog() {
    return [...auditLog];
  }
}
