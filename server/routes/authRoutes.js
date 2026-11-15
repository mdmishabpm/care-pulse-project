import { Router } from 'express';
import { AuthService } from '../services/authService.js';
import { rateLimitPinAuth, requireRole } from '../middleware/securityMiddleware.js';
import { validatePinRequest, validateBody, validateRoleCreate, validateRoleUpdate } from '../utils/inputValidator.js';

export function createAuthRouter() {
  const router = Router();

  router.post('/auth/verify-pin', rateLimitPinAuth, validatePinRequest, (req, res) => {
    const { pin, role } = req.body;
    const result = AuthService.verifyPin(pin, role);
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.json(result);
  });

  router.get('/auth/roles', (req, res) => {
    res.json(AuthService.getRoles());
  });

  router.post('/auth/roles', requireRole(['caretaker']), validateBody(validateRoleCreate), (req, res) => {
    const created = AuthService.addRole(req.body);
    res.status(201).json(created);
  });

  router.put('/auth/roles/:id', requireRole(['caretaker']), validateBody(validateRoleUpdate), (req, res) => {
    const updated = AuthService.updateRole(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Role profile not found' });
    }
    res.json(updated);
  });

  router.get('/security/audit-log', requireRole(['caretaker']), (req, res) => {
    res.json(AuthService.getAuditLog());
  });

  return router;
}
