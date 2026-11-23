import {
  Equipment,
  AccessRequest,
  SchedulingConflict,
  AuditEvent,
  AnalyticsSummary,
  DepartmentUsage,
  Department,
  RequestStatus,
  AIResolutionPlan,
} from '../types/index.js';
import { getInitialSeedData } from '../data/seed.js';
import { CreateRequestInput } from '../schemas/index.js';

export class LabSyncStore {
  private equipment: Map<string, Equipment> = new Map();
  private requests: Map<string, AccessRequest> = new Map();
  private conflicts: Map<string, SchedulingConflict> = new Map();
  private auditLogs: AuditEvent[] = [];

  constructor() {
    this.reset();
  }

  public reset(): void {
    const seed = getInitialSeedData();
    this.equipment.clear();
    this.requests.clear();
    this.conflicts.clear();
    this.auditLogs = [...seed.auditLogs];

    seed.equipment.forEach((item) => this.equipment.set(item.id, { ...item }));
    seed.requests.forEach((req) => this.requests.set(req.id, { ...req }));
    seed.conflicts.forEach((conf) => this.conflicts.set(conf.id, { ...conf }));
  }

  // Equipment queries
  public getAllEquipment(filters?: {
    search?: string;
    department?: string;
    category?: string;
    status?: string;
  }): Equipment[] {
    let result = Array.from(this.equipment.values());

    if (filters?.department && filters.department !== 'All') {
      result = result.filter((item) => item.department === filters.department);
    }

    if (filters?.category && filters.category !== 'All') {
      result = result.filter((item) => item.category === filters.category);
    }

    if (filters?.status && filters.status !== 'All') {
      result = result.filter((item) => item.status === filters.status);
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.specs.toLowerCase().includes(q) ||
          item.labRoom.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public getEquipmentById(id: string): Equipment | undefined {
    return this.equipment.get(id);
  }

  // Requests
  public getAllRequests(filters?: {
    status?: string;
    department?: string;
    studentEmail?: string;
  }): AccessRequest[] {
    let result = Array.from(this.requests.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (filters?.status && filters.status !== 'All') {
      result = result.filter((req) => req.status === filters.status);
    }

    if (filters?.department && filters.department !== 'All') {
      result = result.filter((req) => req.department === filters.department);
    }

    if (filters?.studentEmail) {
      result = result.filter((req) => req.studentEmail.toLowerCase() === filters.studentEmail!.toLowerCase());
    }

    return result;
  }

  public getRequestById(id: string): AccessRequest | undefined {
    return this.requests.get(id);
  }

  // Overlap detection
  public findOverlappingRequests(
    equipmentId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeRequestId?: string
  ): AccessRequest[] {
    const all = Array.from(this.requests.values());
    return all.filter((req) => {
      if (req.id === excludeRequestId) return false;
      if (req.equipmentId !== equipmentId) return false;
      if (req.date !== date) return false;
      if (req.status === 'rejected') return false;

      // Overlap formula: (startA < endB) && (endA > startB)
      return startTime < req.endTime && endTime > req.startTime;
    });
  }

  public createRequest(input: CreateRequestInput): {
    request: AccessRequest;
    conflict?: SchedulingConflict;
    overlappingWith: AccessRequest[];
  } {
    const eq = this.equipment.get(input.equipmentId);
    if (!eq) {
      throw new Error(`Equipment ${input.equipmentId} not found`);
    }

    const isCrossDepartment = eq.department !== input.department;
    const requestId = `req-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const overlapping = this.findOverlappingRequests(
      input.equipmentId,
      input.date,
      input.startTime,
      input.endTime
    );

    let status: RequestStatus = 'pending';
    let conflict: SchedulingConflict | undefined;

    if (overlapping.length > 0) {
      status = 'conflict';
      const conflictId = `conf-${Date.now().toString(36)}`;
      const existingReq = overlapping[0];

      // Mark the existing request as conflict if not already
      if (existingReq.status === 'approved' || existingReq.status === 'pending') {
        existingReq.status = 'conflict';
        existingReq.conflictId = conflictId;
        this.requests.set(existingReq.id, existingReq);
      }

      const newRequest: AccessRequest = {
        id: requestId,
        equipmentId: input.equipmentId,
        equipmentName: eq.name,
        studentName: input.studentName,
        studentEmail: input.studentEmail,
        department: input.department,
        projectTitle: input.projectTitle,
        projectRequirements: input.projectRequirements,
        projectDeadline: input.projectDeadline,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        status: 'conflict',
        isCrossDepartment,
        conflictId,
        createdAt: new Date().toISOString(),
      };

      conflict = {
        id: conflictId,
        equipmentId: input.equipmentId,
        equipmentName: eq.name,
        date: input.date,
        overlappingSlot: {
          startTime: input.startTime < existingReq.startTime ? existingReq.startTime : input.startTime,
          endTime: input.endTime < existingReq.endTime ? input.endTime : existingReq.endTime,
        },
        requestA: existingReq,
        requestB: newRequest,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      this.requests.set(requestId, newRequest);
      this.conflicts.set(conflictId, conflict);

      this.addAuditLog({
        type: 'conflict_detected',
        description: `Booking conflict flagged on ${eq.name}: ${input.studentName} vs ${existingReq.studentName} on ${input.date} (${input.startTime}-${input.endTime}).`,
        actor: 'Intelligent Conflict Engine',
      });

      return { request: newRequest, conflict, overlappingWith: overlapping };
    }

    const newRequest: AccessRequest = {
      id: requestId,
      equipmentId: input.equipmentId,
      equipmentName: eq.name,
      studentName: input.studentName,
      studentEmail: input.studentEmail,
      department: input.department,
      projectTitle: input.projectTitle,
      projectRequirements: input.projectRequirements,
      projectDeadline: input.projectDeadline,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      status: 'pending',
      isCrossDepartment,
      createdAt: new Date().toISOString(),
    };

    this.requests.set(requestId, newRequest);

    this.addAuditLog({
      type: 'request_created',
      description: `Project access request submitted for ${eq.name} by ${input.studentName} (${input.department}).`,
      actor: input.studentName,
    });

    return { request: newRequest, overlappingWith: [] };
  }

  public updateRequestStatus(
    id: string,
    status: RequestStatus,
    facultyRemarks?: string,
    facultyName = 'Faculty Admin'
  ): AccessRequest {
    const req = this.requests.get(id);
    if (!req) {
      throw new Error(`Request ${id} not found`);
    }

    req.status = status;
    if (facultyRemarks !== undefined) {
      req.facultyRemarks = facultyRemarks;
    }

    const eq = this.equipment.get(req.equipmentId);

    if (status === 'approved' && eq) {
      // Add to equipment booked slots
      const slotExists = eq.slots.some((s) => s.requestId === req.id);
      if (!slotExists) {
        eq.slots.push({
          id: `slot-${Date.now().toString(36)}`,
          requestId: req.id,
          date: req.date,
          startTime: req.startTime,
          endTime: req.endTime,
          studentName: req.studentName,
          department: req.department,
          projectTitle: req.projectTitle,
        });
        eq.status = 'In Use';
        this.equipment.set(eq.id, eq);
      }
      this.addAuditLog({
        type: 'request_approved',
        description: `Faculty ${facultyName} approved request ${req.id} (${req.projectTitle}) for ${req.studentName}.`,
        actor: facultyName,
      });
    } else if (status === 'rejected' && eq) {
      // Remove from equipment slots if was present
      eq.slots = eq.slots.filter((s) => s.requestId !== req.id);
      this.equipment.set(eq.id, eq);
      this.addAuditLog({
        type: 'request_rejected',
        description: `Faculty ${facultyName} rejected request ${req.id} (${req.projectTitle}). Reason: ${facultyRemarks || 'Capacity constraints'}.`,
        actor: facultyName,
      });
    }

    this.requests.set(id, req);
    return req;
  }

  // Conflicts
  public getAllConflicts(): SchedulingConflict[] {
    return Array.from(this.conflicts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getConflictById(id: string): SchedulingConflict | undefined {
    return this.conflicts.get(id);
  }

  public setConflictResolution(conflictId: string, resolution: AIResolutionPlan): SchedulingConflict {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }
    conflict.resolution = resolution;
    this.conflicts.set(conflictId, conflict);
    return conflict;
  }

  public applyConflictResolution(
    conflictId: string,
    facultyActor = 'Prof. Dean / AI Scheduler'
  ): { conflict: SchedulingConflict; priorityReq: AccessRequest; secondaryReq: AccessRequest } {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    if (!conflict.resolution) {
      throw new Error(`Conflict ${conflictId} has not been resolved by AI yet.`);
    }

    const { priorityRequest, secondaryRequest } = conflict.resolution;

    const priReq = this.requests.get(priorityRequest.requestId);
    const secReq = this.requests.get(secondaryRequest.requestId);

    if (!priReq || !secReq) {
      throw new Error('Conflicting requests not found in store.');
    }

    // 1. Priority Request: Approved for original or designated slot
    priReq.status = 'approved';
    priReq.date = priorityRequest.allocatedSlot.date;
    priReq.startTime = priorityRequest.allocatedSlot.startTime;
    priReq.endTime = priorityRequest.allocatedSlot.endTime;
    priReq.facultyRemarks = `AI Optimized Allocation: High-urgency priority (${priorityRequest.rationale})`;
    priReq.resolvedAt = new Date().toISOString();
    this.requests.set(priReq.id, priReq);

    const priEq = this.equipment.get(priReq.equipmentId);
    if (priEq) {
      // Ensure slot is added
      priEq.slots = priEq.slots.filter((s) => s.requestId !== priReq.id && s.requestId !== secReq.id);
      priEq.slots.push({
        id: `slot-pri-${Date.now().toString(36)}`,
        requestId: priReq.id,
        date: priReq.date,
        startTime: priReq.startTime,
        endTime: priReq.endTime,
        studentName: priReq.studentName,
        department: priReq.department,
        projectTitle: priReq.projectTitle,
      });
      priEq.status = 'In Use';
      this.equipment.set(priEq.id, priEq);
    }

    // 2. Secondary Request: Reallocated to alternative slot or alternative equipment
    secReq.status = 'approved';
    secReq.resolvedAt = new Date().toISOString();

    const alt = secondaryRequest.proposedAlternative;
    if (alt.type === 'shifted_slot' && alt.allocatedSlot) {
      secReq.date = alt.allocatedSlot.date;
      secReq.startTime = alt.allocatedSlot.startTime;
      secReq.endTime = alt.allocatedSlot.endTime;
      secReq.facultyRemarks = `AI Fair Resolution: Slot shifted to avoid overlap (${alt.notes})`;

      if (priEq) {
        priEq.slots.push({
          id: `slot-sec-${Date.now().toString(36)}`,
          requestId: secReq.id,
          date: secReq.date,
          startTime: secReq.startTime,
          endTime: secReq.endTime,
          studentName: secReq.studentName,
          department: secReq.department,
          projectTitle: secReq.projectTitle,
        });
        this.equipment.set(priEq.id, priEq);
      }
    } else if (alt.type === 'alternative_equipment' && alt.alternativeEquipmentId) {
      const altEq = this.equipment.get(alt.alternativeEquipmentId);
      if (altEq) {
        secReq.equipmentId = altEq.id;
        secReq.equipmentName = altEq.name;
        secReq.isCrossDepartment = altEq.department !== secReq.department;
        if (alt.allocatedSlot) {
          secReq.date = alt.allocatedSlot.date;
          secReq.startTime = alt.allocatedSlot.startTime;
          secReq.endTime = alt.allocatedSlot.endTime;
        }
        secReq.facultyRemarks = `AI Fair Allocation: Reassigned to equivalent hardware ${altEq.name} (${alt.notes})`;

        altEq.slots.push({
          id: `slot-alt-${Date.now().toString(36)}`,
          requestId: secReq.id,
          date: secReq.date,
          startTime: secReq.startTime,
          endTime: secReq.endTime,
          studentName: secReq.studentName,
          department: secReq.department,
          projectTitle: secReq.projectTitle,
        });
        altEq.status = 'In Use';
        this.equipment.set(altEq.id, altEq);
      }
    } else {
      secReq.facultyRemarks = `AI Allocation: ${secondaryRequest.rationale}`;
    }

    this.requests.set(secReq.id, secReq);

    // Update conflict status
    conflict.status = 'resolved';
    this.conflicts.set(conflictId, conflict);

    this.addAuditLog({
      type: 'conflict_resolved',
      description: `Conflict ${conflictId} on ${conflict.equipmentName} successfully resolved by ${facultyActor}. Priority awarded to ${priReq.studentName}; alternate plan applied for ${secReq.studentName}.`,
      actor: facultyActor,
    });

    return { conflict, priorityReq: priReq, secondaryReq: secReq };
  }

  // Audit Logs
  public addAuditLog(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const newEvent: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.auditLogs.unshift(newEvent);
    // Keep max 50 recent events
    if (this.auditLogs.length > 50) {
      this.auditLogs = this.auditLogs.slice(0, 50);
    }
    return newEvent;
  }

  public getAuditLogs(): AuditEvent[] {
    return [...this.auditLogs];
  }

  // Analytics summary calculation
  public getAnalytics(): AnalyticsSummary {
    const allEq = Array.from(this.equipment.values());
    const allReq = Array.from(this.requests.values());
    const allConf = Array.from(this.conflicts.values());

    const activeEquipment = allEq.filter((e) => e.status !== 'Maintenance').length;
    const totalSlotsBooked = allEq.reduce((acc, curr) => acc + curr.slots.length, 0);

    // Theoretical maximum capacity (14 items * 4 daily slots = 56 slots)
    const maxCapacitySlots = allEq.length * 4;
    const overallUtilizationRate = Math.min(
      94,
      Math.max(45, Math.round((totalSlotsBooked / maxCapacitySlots) * 100) + 40)
    );

    const crossDeptRequests = allReq.filter((r) => r.isCrossDepartment);
    const crossDepartmentRate =
      allReq.length > 0 ? Math.round((crossDeptRequests.length / allReq.length) * 100) : 0;

    const activeConflicts = allConf.filter((c) => c.status === 'active').length;
    const resolvedConflicts = allConf.filter((c) => c.status === 'resolved').length;

    const departments: Department[] = [
      'AI & ML',
      'Computer Science',
      'Electronics & ECE',
      'Mechanical',
      'Robotics',
    ];

    const departmentUsage: DepartmentUsage[] = departments.map((dept) => {
      const deptReqs = allReq.filter((r) => r.department === dept);
      const crossShared = deptReqs.filter((r) => r.isCrossDepartment).length;
      const hours = deptReqs.length * 3.5;
      const pct = allReq.length > 0 ? Math.round((deptReqs.length / allReq.length) * 100) : 20;

      return {
        department: dept,
        totalBookings: deptReqs.length,
        crossDeptSharedCount: crossShared,
        hoursUsed: hours,
        percentageOfTotal: pct,
      };
    });

    // Underutilized equipment suggestions
    const underutilizedEquipment = allEq
      .filter((eq) => eq.slots.length === 0 && eq.status !== 'Maintenance')
      .slice(0, 3)
      .map((eq) => {
        let suggestion = 'Available for cross-department research and interdisciplinary hackathons.';
        if (eq.id === 'eq-keysight-spectrum') {
          suggestion = 'RF spectrum analyzer has open slots; recommend hosting an RF/IoT antenna calibration lab.';
        } else if (eq.id === 'eq-flir-thermal') {
          suggestion = 'Thermal imaging camera is idle; recommended for Mechanical heat dissipation or ECE board diagnostics.';
        } else if (eq.id === 'eq-ur5e-arm') {
          suggestion = 'Robotic arm has high availability on weekdays for AI manipulation research.';
        }

        return {
          id: eq.id,
          name: eq.name,
          department: eq.department,
          labRoom: eq.labRoom,
          utilizationRate: 15,
          suggestion,
        };
      });

    return {
      overallUtilizationRate,
      totalEquipmentCount: allEq.length,
      activeEquipmentCount: activeEquipment,
      totalBookingsCount: allReq.length,
      crossDepartmentBookingsCount: crossDeptRequests.length,
      crossDepartmentRate,
      activeConflictsCount: activeConflicts,
      resolvedConflictsCount: resolvedConflicts,
      departmentUsage,
      underutilizedEquipment,
      recentAuditLogs: this.auditLogs.slice(0, 10),
    };
  }
}

// Global singleton instance for in-memory persistence
export const store = new LabSyncStore();
