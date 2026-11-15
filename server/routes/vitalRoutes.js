import { Router } from 'express';
import { validateBody, validateVital } from '../utils/inputValidator.js';

export function createVitalRouter(store) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(store.getVitals());
  });

  router.post('/', validateBody(validateVital), (req, res) => {
    const newVital = store.addVital(req.body);
    res.status(201).json(newVital);
  });

  return router;
}
