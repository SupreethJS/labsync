import { store } from './store.js';
import { aiService } from './aiService.js';
import { AIResolutionPlan, SchedulingConflict, AccessRequest } from '../types/index.js';

export class ConflictService {
  /**
   * Check whether a requested slot overlaps with any active bookings on that equipment.
   */
  public checkOverlap(
    equipmentId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeRequestId?: string
  ): { hasConflict: boolean; conflictingRequests: AccessRequest[] } {
    const overlapping = store.findOverlappingRequests(
      equipmentId,
      date,
      startTime,
      endTime,
      excludeRequestId
    );
    return {
      hasConflict: overlapping.length > 0,
      conflictingRequests: overlapping,
    };
  }

  /**
   * Suggest open slots on a given date for an equipment
   */
  public getSuggestedOpenSlots(
    equipmentId: string,
    date: string,
    slotDurationHours = 3
  ): Array<{ startTime: string; endTime: string }> {
    const standardSlots = [
      { startTime: '09:00', endTime: '12:00' },
      { startTime: '12:00', endTime: '15:00' },
      { startTime: '15:00', endTime: '18:00' },
      { startTime: '18:00', endTime: '21:00' },
    ];

    return standardSlots.filter((slot) => {
      const { hasConflict } = this.checkOverlap(
        equipmentId,
        date,
        slot.startTime,
        slot.endTime
      );
      return !hasConflict;
    });
  }

  /**
   * Run AI Conflict Resolution on an active conflict.
   */
  public async generateResolution(conflictId: string): Promise<AIResolutionPlan> {
    const conflict = store.getConflictById(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    const plan = await aiService.resolveConflict(conflict);
    store.setConflictResolution(conflictId, plan);
    return plan;
  }

  /**
   * Apply recommended AI resolution plan live to the database/store.
   */
  public applyResolution(conflictId: string, facultyActor?: string): {
    conflict: SchedulingConflict;
    priorityReq: AccessRequest;
    secondaryReq: AccessRequest;
  } {
    return store.applyConflictResolution(conflictId, facultyActor);
  }
}

export const conflictService = new ConflictService();
