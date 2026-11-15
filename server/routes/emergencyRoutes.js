import { Router } from 'express';
import { AuthService } from '../services/authService.js';

export function createEmergencyRouter(store) {
  const router = Router();

  router.post('/sos', (req, res) => {
    const location = typeof req.body?.location === 'string' ? req.body.location : undefined;
    const alert = store.addEmergencyAlert(location);
    AuthService.logAudit('EMERGENCY_SOS_TRIGGERED', `EMERGENCY SOS triggered for ${store.getPatient().name}`);
    res.status(201).json({ success: true, alert });
  });

  return router;
}
