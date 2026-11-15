import { Router } from 'express';
import { DrugInteractionService } from '../services/drugInteractionService.js';

export function createSafetyRouter(store) {
  const router = Router();

  router.get('/check', (req, res) => {
    const warnings = DrugInteractionService.analyzeSafety(
      store.getMedications(),
      null,
      store.getPatient().allergies
    );
    res.json({ warnings });
  });

  router.post('/check-prospective', (req, res) => {
    const { candidateMedication } = req.body || {};
    if (!candidateMedication || typeof candidateMedication !== 'object') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'candidateMedication object is required.' }
      });
    }
    const warnings = DrugInteractionService.analyzeSafety(
      store.getMedications(),
      candidateMedication,
      store.getPatient().allergies
    );
    res.json({ warnings });
  });

  return router;
}
