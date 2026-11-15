# 📡 CarePulse REST API Specification

Base URL: `http://localhost:3001`  
All requests accept and return `application/json; charset=utf-8`.

---

## 1. Authentication Endpoints

### `POST /api/auth/verify-pin`
Verifies a 4-digit passcode against PBKDF2 salted hash in constant time.
- **Security:** Protected by brute-force rate-limiting (locks after 4 failed attempts).
- **Request Body:**
  ```json
  {
    "pin": "1234",
    "role": "senior" // optional
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "role": {
      "id": "senior",
      "name": "Arthur (Senior)",
      "permissions": ["view:schedule", "log:intake", "trigger:sos", "view:nudges"],
      "uiMode": "senior_accessible"
    },
    "token": "eyJyb2xlSWQiOiJzZW5pb3IifQ.5f1a9c..."
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
    "success": false,
    "error": "Incorrect PIN for selected role."
  }
  ```

---

## 2. Medication Management Endpoints

### `GET /api/medications`
Returns all active prescriptions, today's schedule evaluated against the current time, and refill alerts.

### `POST /api/medications`
Adds a new medication prescription and analyzes potential drug interactions.
- **Request Body:**
  ```json
  {
    "name": "Warfarin",
    "dosage": "5 mg",
    "purpose": "Blood thinning",
    "compartment": "morning",
    "time": "08:00",
    "instructions": "Take with water",
    "shape": "round",
    "color": "yellow",
    "totalQuantity": 30,
    "refillThreshold": 7
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "medication": { "id": "med_12345", "name": "Warfarin", ... },
    "safetyWarnings": [
      {
        "type": "DRUG_INTERACTION",
        "severity": "HIGH",
        "title": "Severe Bleeding Risk",
        "description": "Combining Aspirin with Warfarin significantly amplifies anticoagulant effects."
      }
    ],
    "googleCalendarUrl": "https://calendar.google.com/calendar/render?action=TEMPLATE..."
  }
  ```

### `POST /api/medications/:id/take`
Records that a medication dose was administered.
- Decrements bottle inventory by 1.
- Evaluates adherence percentage and updates streaks.
- Retrieves unread family Love Nudges.

---

## 3. Google Services Endpoints

### `GET /api/appointments`
Returns upcoming doctor visits with Google Calendar Web Intent sync URLs.

### `GET /api/calendar/export-ics`
Downloads a standard RFC-5545 iCalendar (`.ics`) file for universal calendar imports.

### `POST /api/notifications/preview-briefing`
Renders responsive HTML morning briefing email suitable for Gmail API dispatch.

### `POST /api/notifications/preview-urgent-alert`
Renders urgent missed-dose email alert triggered when doses are overdue.
