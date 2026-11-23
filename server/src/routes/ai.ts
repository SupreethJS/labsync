import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService.js';
import { AIDiscoveryQuerySchema } from '../schemas/index.js';

export const aiRouter = Router();

// POST /api/ai/discover
aiRouter.post('/discover', async (req: Request, res: Response) => {
  const parseResult = AIDiscoveryQuerySchema.safeParse(req.body);
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

  const { prompt, department } = parseResult.data;
  try {
    const result = await aiService.discoverEquipment(prompt, department);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});
