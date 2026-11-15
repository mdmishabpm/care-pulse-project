import { Router } from 'express';
import { validateBody, validateNudge } from '../utils/inputValidator.js';

export function createNudgeRouter(store) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(store.getNudges());
  });

  router.post('/', validateBody(validateNudge), (req, res) => {
    const newNudge = store.addNudge(req.body);
    res.status(201).json(newNudge);
  });

  return router;
}
