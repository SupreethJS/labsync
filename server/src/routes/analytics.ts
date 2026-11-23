import { Router, Request, Response } from 'express';
import { store } from '../services/store.js';

export const analyticsRouter = Router();

// GET /api/analytics
analyticsRouter.get('/', (_req: Request, res: Response) => {
  const summary = store.getAnalytics();
  res.json({
    success: true,
    data: summary,
  });
});

// POST /api/analytics/reset (Evaluator / test helper)
analyticsRouter.post('/reset', (_req: Request, res: Response) => {
  store.reset();
  res.json({
    success: true,
    message: 'LabLink store reset to initial seed state with 2 active conflicts.',
    data: store.getAnalytics(),
  });
});
