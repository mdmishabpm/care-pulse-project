/**
 * @file app.js
 * @description Express Application composition with OWASP security headers,
 * input sanitization, modular domain routers, and structured error handling.
 */

import express from 'express';
import cors from 'cors';
import { createStore } from './data/store.js';
import { securityHeaders, sanitizeRequestBody } from './middleware/securityMiddleware.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import { createAuthRouter } from './routes/authRoutes.js';
import { createPatientRouter } from './routes/patientRoutes.js';
import { createMedicationRouter } from './routes/medicationRoutes.js';
import { createSafetyRouter } from './routes/safetyRoutes.js';
import { createAppointmentRouter } from './routes/appointmentRoutes.js';
import { createNudgeRouter } from './routes/nudgeRoutes.js';
import { createVitalRouter } from './routes/vitalRoutes.js';
import { createEmergencyRouter } from './routes/emergencyRoutes.js';
import { createNotificationRouter } from './routes/notificationRoutes.js';
import { createSystemRouter } from './routes/systemRoutes.js';

export function createApp() {
  const app = express();
  const store = createStore();

  // Security headers, CORS, body parser, and XSS input sanitization for /api
  app.use('/api', securityHeaders);
  app.use(cors({ origin: process.env.ALLOWED_ORIGIN || true, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
  app.use(express.json({ limit: '100kb' }));
  app.use(sanitizeRequestBody);

  // Domain Routers
  app.use('/api', createSystemRouter(store));
  app.use('/api', createAuthRouter());
  app.use('/api/patient', createPatientRouter(store));
  app.use('/api', createMedicationRouter(store));
  app.use('/api/safety', createSafetyRouter(store));
  app.use('/api', createAppointmentRouter(store));
  app.use('/api/nudges', createNudgeRouter(store));
  app.use('/api/vitals', createVitalRouter(store));
  app.use('/api/emergency', createEmergencyRouter(store));
  app.use('/api/notifications', createNotificationRouter(store));

  // Centralized 404 & Error Handling for /api
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
