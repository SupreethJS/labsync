import { Router, Request, Response } from 'express';
import { store } from '../services/store.js';
import { conflictService } from '../services/conflictService.js';
import { OpenSlotsQuerySchema } from '../schemas/index.js';

export const equipmentRouter = Router();

// GET /api/equipment
equipmentRouter.get('/', (req: Request, res: Response) => {
  const { search, department, category, status } = req.query;

  const items = store.getAllEquipment({
    search: typeof search === 'string' ? search : undefined,
    department: typeof department === 'string' ? department : undefined,
    category: typeof category === 'string' ? category : undefined,
    status: typeof status === 'string' ? status : undefined,
  });

  res.json({
    success: true,
    count: items.length,
    data: items,
  });
});

// GET /api/equipment/:id
equipmentRouter.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const item = store.getEquipmentById(id);
  if (!item) {
    res.status(404).json({ success: false, error: 'Equipment not found' });
    return;
  }

  res.json({ success: true, data: item });
});

// GET /api/equipment/:id/open-slots?date=YYYY-MM-DD
equipmentRouter.get('/:id/open-slots', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const parseResult = OpenSlotsQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: 'Query parameter "date" (YYYY-MM-DD) is required and must be valid',
      issues: parseResult.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const { date } = parseResult.data;

  const item = store.getEquipmentById(id);
  if (!item) {
    res.status(404).json({ success: false, error: 'Equipment not found' });
    return;
  }

  const openSlots = conflictService.getSuggestedOpenSlots(id, date);
  res.json({ success: true, equipmentId: id, date, openSlots });
});
