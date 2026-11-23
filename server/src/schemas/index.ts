import { z } from 'zod';

export const DepartmentSchema = z.enum([
  'AI & ML',
  'Computer Science',
  'Electronics & ECE',
  'Mechanical',
  'Robotics',
]);

export const CreateRequestSchema = z.object({
  equipmentId: z.string().min(1, 'Equipment ID is required'),
  studentName: z.string().min(2, 'Student Name must be at least 2 characters'),
  studentEmail: z.string().email('Invalid email address'),
  department: DepartmentSchema,
  projectTitle: z.string().min(3, 'Project Title must be at least 3 characters'),
  projectRequirements: z.string().min(10, 'Project Requirements must be at least 10 characters'),
  projectDeadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be in YYYY-MM-DD format'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:mm format'),
  allowConflictFlag: z.boolean().optional().default(false),
}).refine((data) => {
  return data.startTime < data.endTime;
}, {
  message: 'End time must be strictly after start time',
  path: ['endTime'],
});

export const FacultyActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional(),
});

export const AIDiscoveryQuerySchema = z.object({
  prompt: z.string().min(3, 'Prompt must be at least 3 characters').max(1000, 'Prompt cannot exceed 1000 characters'),
  department: DepartmentSchema.optional(),
});

export const ApplyResolutionSchema = z.object({
  conflictId: z.string().min(1, 'Conflict ID is required'),
});

export const ApplyPlanBodySchema = z.object({
  facultyName: z.string().min(2, 'Faculty name must be at least 2 characters').max(100, 'Faculty name cannot exceed 100 characters').optional(),
});

export const CheckOverlapQuerySchema = z.object({
  equipmentId: z.string().min(1, 'equipmentId is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:mm format'),
  excludeRequestId: z.string().optional(),
});

export const OpenSlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export type CreateRequestInput = z.infer<typeof CreateRequestSchema>;
export type FacultyActionInput = z.infer<typeof FacultyActionSchema>;
export type AIDiscoveryQueryInput = z.infer<typeof AIDiscoveryQuerySchema>;
export type ApplyResolutionInput = z.infer<typeof ApplyResolutionSchema>;
export type ApplyPlanBodyInput = z.infer<typeof ApplyPlanBodySchema>;
export type CheckOverlapQueryInput = z.infer<typeof CheckOverlapQuerySchema>;
