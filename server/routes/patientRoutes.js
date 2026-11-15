import { Router } from 'express';
import { AuthService } from '../services/authService.js';
import { validateBody, validatePatientUpdate } from '../utils/inputValidator.js';

export function createPatientRouter(store) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(store.getPatient());
  });

  router.put('/', validateBody(validatePatientUpdate), (req, res) => {
    const patient = store.updatePatient(req.body);
    AuthService.logAudit('PATIENT_UPDATE', 'Updated patient medical information.');
    res.json({ success: true, patient });
  });

  return router;
}
