import { Router, Request, Response } from 'express';
import { store } from '../services/store.js';
import { conflictService } from '../services/conflictService.js';
import { CreateRequestSchema, FacultyActionSchema, CheckOverlapQuerySchema } from '../schemas/index.js';

export const requestsRouter = Router();

// GET /api/requests
requestsRouter.get('/', (req: Request, res: Response) => {
  const { status, department, studentEmail } = req.query;

  const requests = store.getAllRequests({
    status: typeof status === 'string' ? status : undefined,
    department: typeof department === 'string' ? department : undefined,
    studentEmail: typeof studentEmail === 'string' ? studentEmail : undefined,
  });

  res.json({ success: true, count: requests.length, data: requests });
});

// GET /api/requests/check-overlap?equipmentId=...&date=...&startTime=...&endTime=...
requestsRouter.get('/check-overlap', (req: Request, res: Response) => {
  const parseResult = CheckOverlapQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: 'Invalid query parameters',
      issues: parseResult.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const { equipmentId, date, startTime, endTime, excludeRequestId } = parseResult.data;

  const check = conflictService.checkOverlap(
    equipmentId,
    date,
    startTime,
    endTime,
    excludeRequestId
  );

  res.json({
    success: true,
    hasConflict: check.hasConflict,
    conflictingRequests: check.conflictingRequests,
  });
});

// POST /api/requests
requestsRouter.post('/', (req: Request, res: Response) => {
  const parseResult = CreateRequestSchema.safeParse(req.body);
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

  try {
    const { request, conflict, overlappingWith } = store.createRequest(parseResult.data);
    res.status(201).json({
      success: true,
      data: request,
      conflictDetected: Boolean(conflict),
      conflict,
      overlappingWith,
      message: conflict
        ? 'Request submitted with scheduling conflict flagged. AI resolution available.'
        : 'Access request successfully registered for faculty review.',
    });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
});

// POST /api/requests/:id/action (Faculty approve / reject)
requestsRouter.post('/:id/action', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const parseResult = FacultyActionSchema.safeParse(req.body);
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

  const { action, remarks } = parseResult.data;
  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  try {
    const updated = store.updateRequestStatus(
      id,
      newStatus,
      remarks,
      (req.headers['x-faculty-name'] as string) || 'Faculty Approver'
    );
    res.json({ success: true, data: updated, message: `Request successfully ${newStatus}.` });
  } catch (err) {
    res.status(404).json({ success: false, error: (err as Error).message });
  }
});
