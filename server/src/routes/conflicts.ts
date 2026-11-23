import { Router, Request, Response } from 'express';
import { store } from '../services/store.js';
import { conflictService } from '../services/conflictService.js';
import { ApplyPlanBodySchema } from '../schemas/index.js';

export const conflictsRouter = Router();

// GET /api/conflicts
conflictsRouter.get('/', (_req: Request, res: Response) => {
  const conflicts = store.getAllConflicts();
  res.json({
    success: true,
    count: conflicts.length,
    activeCount: conflicts.filter((c) => c.status === 'active').length,
    data: conflicts,
  });
});

// GET /api/conflicts/:id
conflictsRouter.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const conflict = store.getConflictById(id);
  if (!conflict) {
    res.status(404).json({ success: false, error: 'Conflict record not found' });
    return;
  }

  res.json({ success: true, data: conflict });
});

// POST /api/conflicts/:id/resolve (Hero Feature: GenAI Conflict Resolution)
conflictsRouter.post('/:id/resolve', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const resolution = await conflictService.generateResolution(id);
    res.json({
      success: true,
      data: resolution,
      message: 'AI fair allocation plan generated successfully.',
    });
  } catch (err) {
    res.status(404).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/conflicts/:id/apply (One-click Apply Recommended Plan)
conflictsRouter.post('/:id/apply', (req: Request, res: Response) => {
  const id = req.params.id as string;

  const parseResult = ApplyPlanBodySchema.safeParse(req.body || {});
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      issues: parseResult.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const facultyName = parseResult.data.facultyName || (req.headers['x-faculty-name'] as string) || 'Faculty Admin';

  try {
    const result = store.applyConflictResolution(id, facultyName);
    res.json({
      success: true,
      message: 'Recommended AI schedule plan applied live.',
      data: result,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});
