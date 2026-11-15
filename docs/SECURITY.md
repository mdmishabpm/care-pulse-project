# 🛡️ CarePulse Enterprise Security Architecture

CarePulse is engineered following Defense-in-Depth principles to safeguard senior health information and sensitive medication schedules against unauthorized access, tampering, and brute-force intrusion.

---

## 1. Cryptographic Authentication & Passcode Security

### PBKDF2 Salted Hashing
- Senior and caregiver passcodes are never stored in plaintext.
- Passcodes are hashed using **PBKDF2 with HMAC-SHA256** and 10,000 iterations:
  $$\text{Hash} = \text{PBKDF2-HMAC-SHA256}(\text{PIN}, \text{Salt}, \text{iterations}=10000, \text{length}=32)$$
- Each user role is assigned a unique cryptographic salt.

### Constant-Time Hash Comparison
- Passcode validation utilizes `crypto.timingSafeEqual` to eliminate side-channel timing attacks that could otherwise leak passcode characters through microsecond response variations.

### Brute-Force Rate Limiting & Cooldown Lockout
- The authentication middleware tracks failed attempts per IP and role.
- If **4 consecutive failed PIN attempts** occur, the terminal enforces an exponential 30-second security cooldown lockout (HTTP `429 Too Many Requests`).
- Every failed attempt and lockout is recorded in the tamper-evident security audit log.

---

## 2. Session Integrity & Tamper-Proof Tokens

### HMAC-SHA256 Signed Tokens
- CarePulse does not use forgeable Base64 tokens.
- Session tokens are signed using **HMAC-SHA256** with an ephemeral server secret:
  $$\text{Signature} = \text{HMAC-SHA256}(\text{Payload}_{\text{base64url}}, \text{Secret})$$
- Format: `<Payload_Base64URL>.<Signature_Hex>`
- If any attacker alters the role from `senior` to `caretaker`, the signature verification fails in constant time and access is immediately revoked.

### Expiration & Automatic Invalidation
- Tokens expire strictly after **24 hours**. Expired tokens are immediately purged.

---

## 3. Defense Against Web Attacks (OWASP Compliance)

### Automated Input Sanitization (XSS Defense)
- All incoming request bodies pass through `InputSanitizer`, which recursively strips:
  - `<script>` tags and JavaScript execution vectors
  - Inline HTML event handlers (`onload=`, `onerror=`)
  - `javascript:` pseudo-protocols
  - Dangerous DOM payloads in medicine names, instructions, and caregiver notes.

### HTTP Security Headers
Every response includes hardened security headers:
- `X-Content-Type-Options: nosniff` (Prevents MIME sniffing attacks)
- `X-Frame-Options: DENY` (Prevents clickjacking)
- `X-XSS-Protection: 1; mode=block` (Enforces legacy browser XSS filtering)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (Enforces TLS/HTTPS)
- `Content-Security-Policy: default-src 'self' ...` (Restricts unauthorized script origins)
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 4. Role-Based Access Control (RBAC) Matrix

| Resource / Endpoint | Senior (`1234`) | Caretaker (`8888`) | Family (`5555`) | Doctor (`9999`) |
| :--- | :---: | :---: | :---: | :---: |
| **View Today's Pills** | ✅ | ✅ | ✅ | ✅ |
| **Log Medication Taken** | ✅ | ✅ | ❌ (Read-only) | ❌ |
| **Add / Edit / Delete Prescriptions** | ❌ | ✅ | ❌ | ❌ |
| **View Drug Interaction Alerts** | ❌ | ✅ | ❌ | ✅ |
| **Schedule Doctor Appointments** | ❌ | ✅ | ❌ | ✅ |
| **Send Love Nudges** | ❌ | ✅ | ✅ | ❌ |
| **Trigger Emergency SOS** | ✅ | ✅ | ❌ | ❌ |
| **Security Audit Logs** | ❌ | ✅ | ❌ | ❌ |

---

## 5. Security Verification
All security controls are verified by automated unit tests:
```bash
node --test tests/auth.test.js tests/security.test.js
```
- PBKDF2 hash verification: **PASS**
- Constant-time comparison: **PASS**
- Token signature forgery rejection: **PASS**
- XSS input sanitization: **PASS**
- Brute-force lockout enforcement: **PASS**
