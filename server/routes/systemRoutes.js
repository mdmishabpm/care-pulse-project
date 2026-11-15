import { Router } from 'express';
import { AuthService } from '../services/authService.js';

export function createSystemRouter(store) {
  const router = Router();

  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'CarePulse Enterprise Healthcare API',
      security: {
        pinHashing: 'PBKDF2-SHA256',
        sessionTokens: 'HMAC-SHA256',
        xssSanitization: 'Active',
        rateLimiter: 'Active'
      },
      timestamp: new Date().toISOString()
    });
  });

  router.post('/reset', (req, res) => {
    store.reset();
    AuthService.logAudit('DEMO_RESET', 'Reset demo data back to initial state.');
    res.json({ success: true });
  });

  return router;
}
