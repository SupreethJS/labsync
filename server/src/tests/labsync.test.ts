import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { store } from '../services/store.js';
import { conflictService } from '../services/conflictService.js';

const app = createApp();

describe('LabSync Comprehensive Audit Test Suite', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health returns 200 with healthy status and metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('LabSync API');
      expect(typeof res.body.geminiConfigured).toBe('boolean');
      expect(res.body.model).toBeDefined();
    });
  });

  describe('2. Equipment Discovery, Filtering & AI Assistant', () => {
    it('GET /api/equipment returns all 14 pre-seeded items across 5 departments', async () => {
      const res = await request(app).get('/api/equipment');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(14);
    });

    it('filters equipment by department (Mechanical)', async () => {
      const res = await request(app).get('/api/equipment?department=Mechanical');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.every((e: { department: string }) => e.department === 'Mechanical')).toBe(true);
    });

    it('filters equipment by category and status', async () => {
      const res = await request(app).get('/api/equipment?category=Testing %26 Measurement');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.every((e: { category: string }) => e.category === 'Testing & Measurement')).toBe(true);
    });

    it('filters equipment by text search keyword', async () => {
      const res = await request(app).get('/api/equipment?search=Orin');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toContain('Jetson Orin');
    });

    it('GET /api/equipment/:id returns 404 for non-existent equipment', async () => {
      const res = await request(app).get('/api/equipment/non-existent-id');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/equipment/:id/open-slots returns available slots for a date', async () => {
      const res = await request(app).get('/api/equipment/eq-tektronix-dpo/open-slots?date=2026-11-28');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.openSlots)).toBe(true);
      expect(res.body.openSlots.length).toBeGreaterThan(0);
    });

    it('GET /api/equipment/:id/open-slots returns 400 for invalid date format', async () => {
      const res = await request(app).get('/api/equipment/eq-tektronix-dpo/open-slots?date=invalid-date');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/ai/discover returns ranked recommendations for drone vision model', async () => {
      const res = await request(app)
        .post('/api/ai/discover')
        .send({
          prompt: 'I need to train a vision model and deploy it on a drone before Friday',
          department: 'Robotics',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.recommendations.length).toBeGreaterThanOrEqual(2);
      expect(data.source).toBeDefined();

      const topRec = data.recommendations[0];
      expect(topRec.matchScore).toBeGreaterThanOrEqual(75);
      expect(topRec.equipmentName).toBeDefined();
      expect(topRec.highlightedSpecs.length).toBeGreaterThan(0);
    });

    it('POST /api/ai/discover returns high-VRAM GPU for large LLM fine-tuning', async () => {
      const res = await request(app)
        .post('/api/ai/discover')
        .send({
          prompt: 'Fine-tuning 70B parameter medical LLM on clinical records',
          department: 'AI & ML',
        });

      expect(res.status).toBe(200);
      const data = res.body.data;
      const recNames = data.recommendations.map((r: { equipmentName: string }) => r.equipmentName);
      expect(recNames.some((n: string) => n.includes('A6000') || n.includes('Mac Studio'))).toBe(true);
    });
  });

  describe('3. Slot Overlap & Conflict Detection Math', () => {
    // Existing booked slot on eq-rtx-a6000: 2026-11-24, 14:00 - 18:00
    it('detects exact overlap (14:00 - 18:00)', () => {
      const check = conflictService.checkOverlap('eq-rtx-a6000', '2026-11-24', '14:00', '18:00');
      expect(check.hasConflict).toBe(true);
      expect(check.conflictingRequests.length).toBeGreaterThan(0);
    });

    it('detects partial overlap when new slot starts inside existing (16:00 - 19:00)', () => {
      const check = conflictService.checkOverlap('eq-rtx-a6000', '2026-11-24', '16:00', '19:00');
      expect(check.hasConflict).toBe(true);
    });

    it('detects partial overlap when new slot ends inside existing (12:00 - 16:00)', () => {
      const check = conflictService.checkOverlap('eq-rtx-a6000', '2026-11-24', '12:00', '16:00');
      expect(check.hasConflict).toBe(true);
    });

    it('detects enclosing overlap when new slot encloses existing (12:00 - 20:00)', () => {
      const check = conflictService.checkOverlap('eq-rtx-a6000', '2026-11-24', '12:00', '20:00');
      expect(check.hasConflict).toBe(true);
    });

    it('allows adjacent non-overlapping slot that starts immediately when previous ends (18:00 - 21:00)', () => {
      const check = conflictService.checkOverlap('eq-rtx-a6000', '2026-11-24', '18:00', '21:00');
      expect(check.hasConflict).toBe(false);
    });

    it('allows adjacent non-overlapping slot that ends immediately when next starts (10:00 - 14:00)', () => {
      const check = conflictService.checkOverlap('eq-rtx-a6000', '2026-11-24', '10:00', '14:00');
      expect(check.hasConflict).toBe(false);
    });

    it('allows same time slot on different equipment (eq-tektronix-dpo vs eq-rtx-a6000)', () => {
      const check = conflictService.checkOverlap('eq-tektronix-dpo', '2026-11-24', '14:00', '18:00');
      expect(check.hasConflict).toBe(false);
    });

    it('allows same time slot on different date (2026-11-29 vs 2026-11-24)', () => {
      const check = conflictService.checkOverlap('eq-rtx-a6000', '2026-11-29', '14:00', '18:00');
      expect(check.hasConflict).toBe(false);
    });

    it('GET /api/requests/check-overlap returns conflict status via HTTP', async () => {
      const res = await request(app).get(
        '/api/requests/check-overlap?equipmentId=eq-rtx-a6000&date=2026-11-24&startTime=14:00&endTime=18:00'
      );
      expect(res.status).toBe(200);
      expect(res.body.hasConflict).toBe(true);
    });
  });

  describe('4. Strict Security & Input Validation (Zod)', () => {
    it('rejects missing body with 400', async () => {
      const res = await request(app).post('/api/requests').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.issues.length).toBeGreaterThan(0);
    });

    it('rejects invalid email address with 400', async () => {
      const res = await request(app).post('/api/requests').send({
        equipmentId: 'eq-rtx-a6000',
        studentName: 'Valid Name',
        studentEmail: 'not-an-email',
        department: 'AI & ML',
        projectTitle: 'Valid Title',
        projectRequirements: 'Detailed enough requirement specifications',
        projectDeadline: '2026-12-01',
        date: '2026-12-01',
        startTime: '10:00',
        endTime: '12:00',
      });
      expect(res.status).toBe(400);
      expect(res.body.issues.some((i: { path: string }) => i.path === 'studentEmail')).toBe(true);
    });

    it('rejects invalid date format (not YYYY-MM-DD) with 400', async () => {
      const res = await request(app).post('/api/requests').send({
        equipmentId: 'eq-rtx-a6000',
        studentName: 'Valid Name',
        studentEmail: 'valid@campus.edu',
        department: 'AI & ML',
        projectTitle: 'Valid Title',
        projectRequirements: 'Detailed enough requirement specifications',
        projectDeadline: '2026/12/01', // Bad delimiter
        date: '2026-12-01',
        startTime: '10:00',
        endTime: '12:00',
      });
      expect(res.status).toBe(400);
      expect(res.body.issues.some((i: { path: string }) => i.path === 'projectDeadline')).toBe(true);
    });

    it('rejects endTime <= startTime with 400', async () => {
      const res = await request(app).post('/api/requests').send({
        equipmentId: 'eq-rtx-a6000',
        studentName: 'Valid Name',
        studentEmail: 'valid@campus.edu',
        department: 'AI & ML',
        projectTitle: 'Valid Title',
        projectRequirements: 'Detailed enough requirement specifications',
        projectDeadline: '2026-12-01',
        date: '2026-12-01',
        startTime: '14:00',
        endTime: '14:00', // Equal!
      });
      expect(res.status).toBe(400);
      expect(res.body.issues.some((i: { path: string }) => i.path === 'endTime')).toBe(true);
    });

    it('rejects invalid department not in enum with 400', async () => {
      const res = await request(app).post('/api/requests').send({
        equipmentId: 'eq-rtx-a6000',
        studentName: 'Valid Name',
        studentEmail: 'valid@campus.edu',
        department: 'Civil Engineering', // Not in 5 campus departments
        projectTitle: 'Valid Title',
        projectRequirements: 'Detailed enough requirement specifications',
        projectDeadline: '2026-12-01',
        date: '2026-12-01',
        startTime: '10:00',
        endTime: '12:00',
      });
      expect(res.status).toBe(400);
    });

    it('rejects invalid faculty action with 400', async () => {
      const res = await request(app)
        .post('/api/requests/req-hist-4/action')
        .send({ action: 'postpone' }); // invalid enum
      expect(res.status).toBe(400);
    });

    it('rejects AI discovery query with prompt less than 3 chars with 400', async () => {
      const res = await request(app).post('/api/ai/discover').send({ prompt: 'hi' });
      expect(res.status).toBe(400);
    });
  });

  describe('5. GenAI Conflict Resolution Engine (Hero Feature)', () => {
    it('evaluates pre-seeded conflict conf-1 and gives priority to urgent thesis defense', async () => {
      const res = await request(app).post('/api/conflicts/conf-1/resolve');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const plan = res.body.data;
      expect(plan.conflictId).toBe('conf-1');
      expect(plan.priorityRequest.requestId).toBe('req-c1-a');
      expect(plan.priorityRequest.studentName).toBe('Priya Sharma');
      expect(plan.secondaryRequest.requestId).toBe('req-c1-b');
      expect(plan.secondaryRequest.studentName).toBe('Rohan Verma');
      expect(plan.fairnessJustification).toBeDefined();
    });

    it('evaluates pre-seeded conflict conf-2 on 3D printer and prioritizes racecar safety dyno part', async () => {
      const res = await request(app).post('/api/conflicts/conf-2/resolve');
      expect(res.status).toBe(200);
      const plan = res.body.data;
      expect(plan.priorityRequest.requestId).toBe('req-c2-a');
      expect(plan.priorityRequest.studentName).toBe('Maya Patel');
      expect(plan.secondaryRequest.requestId).toBe('req-c2-b');
      expect(plan.secondaryRequest.studentName).toBe('Kevin Chen');
    });

    it('returns 404 when attempting to resolve a non-existent conflict', async () => {
      const res = await request(app).post('/api/conflicts/conf-invalid-999/resolve');
      expect(res.status).toBe(404);
    });

    it('applying a resolution plan live updates requests to approved and marks conflict resolved', async () => {
      // Step 1: generate resolution
      await request(app).post('/api/conflicts/conf-1/resolve');

      // Step 2: apply resolution
      const res = await request(app).post('/api/conflicts/conf-1/apply').send({
        facultyName: 'Dean of Engineering',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.conflict.status).toBe('resolved');
      expect(res.body.data.priorityReq.status).toBe('approved');
      expect(res.body.data.secondaryReq.status).toBe('approved');

      // Step 3: verify persisted state in store
      const conflict = store.getConflictById('conf-1');
      expect(conflict?.status).toBe('resolved');
    });

    it('returns 400 when attempting to apply a resolution before generating one', async () => {
      // Reset store so conflict has no resolution yet
      store.reset();
      const res = await request(app).post('/api/conflicts/conf-1/apply').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('6. Faculty Approval & Rejection Flow', () => {
    it('approves a pending request and attaches slot to equipment', async () => {
      const res = await request(app)
        .post('/api/requests/req-hist-4/action')
        .send({
          action: 'approve',
          remarks: 'Approved by Dr. Turing for systems benchmarking.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('approved');
      expect(res.body.data.facultyRemarks).toContain('Approved by Dr. Turing');

      const eq = store.getEquipmentById('eq-mac-studio-cluster');
      expect(eq?.slots.some((s) => s.requestId === 'req-hist-4')).toBe(true);
    });

    it('rejects a pending request with faculty remarks', async () => {
      const res = await request(app)
        .post('/api/requests/req-hist-4/action')
        .send({
          action: 'reject',
          remarks: 'Hardware undergoes scheduled calibration this weekend.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('rejected');
      expect(res.body.data.facultyRemarks).toContain('scheduled calibration');
    });

    it('returns 404 when acting on non-existent request', async () => {
      const res = await request(app)
        .post('/api/requests/req-non-existent/action')
        .send({ action: 'approve' });
      expect(res.status).toBe(404);
    });
  });

  describe('7. Resource Utilization Analytics', () => {
    it('calculates comprehensive utilization and interdisciplinary sharing metrics', async () => {
      const res = await request(app).get('/api/analytics');
      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.overallUtilizationRate).toBeGreaterThanOrEqual(40);
      expect(data.totalEquipmentCount).toBe(14);
      expect(data.crossDepartmentBookingsCount).toBeGreaterThan(0);
      expect(data.departmentUsage.length).toBe(5);
      expect(data.underutilizedEquipment.length).toBeGreaterThan(0);
      expect(data.recentAuditLogs.length).toBeGreaterThan(0);
    });

    it('POST /api/analytics/reset restores all pre-seeded equipment and 2 active conflicts', async () => {
      // Apply conflict 1 to change state
      await request(app).post('/api/conflicts/conf-1/resolve');
      await request(app).post('/api/conflicts/conf-1/apply').send({});

      // Reset
      const res = await request(app).post('/api/analytics/reset');
      expect(res.status).toBe(200);

      const conflicts = store.getAllConflicts();
      const active = conflicts.filter((c) => c.status === 'active');
      expect(active.length).toBe(2);
    });
  });
});
