import { store } from './store.js';
import { aiService } from './aiService.js';
import { AIResolutionPlan, SchedulingConflict, AccessRequest } from '../types/index.js';

export class ConflictService {
  /**
   * Evaluates slot temporal overlap against active reservations on the specified equipment.
   * Uses standard interval intersection algebra: (newStart < existingEnd) && (newEnd > existingStart).
   *
   * @param equipmentId Target laboratory equipment identifier
   * @param date Reservation date (YYYY-MM-DD)
   * @param startTime Requested slot start time (HH:mm)
   * @param endTime Requested slot end time (HH:mm)
   * @param excludeRequestId Optional request ID to bypass (e.g. when updating existing booking)
   * @returns Object containing boolean collision flag and list of conflicting requests
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
   * Proposes candidate open slots for an instrument on a specific date.
   * Evaluates standard campus academic blocks (09-12, 12-15, 15-18, 18-21) and filters
   * out any window that intersects with approved or pending bookings.
   *
   * @param equipmentId Target laboratory equipment identifier
   * @param date Target reservation date (YYYY-MM-DD)
   * @param slotDurationHours Standard allocation duration in hours (defaults to 3)
   * @returns Array of non-conflicting time ranges
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
   * Triggers the GenAI conflict resolution pipeline for competing student requests.
   * Delegates reasoning to Gemini with fallback to transparent deadline-fairness scoring,
   * then caches the generated allocation plan on the conflict record.
   *
   * @param conflictId Unique conflict identifier
   * @returns Structured AI resolution plan with priority assignment and fairness rationale
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
   * Applies the approved AI schedule plan to live in-memory state.
   * Commits the priority request to its requested/designated slot, reroutes or shifts
   * the secondary request, marks the conflict as resolved, and registers an audit log event.
   *
   * @param conflictId Unique conflict identifier
   * @param facultyActor Name of the faculty member or administrator applying the resolution
   * @returns Updated conflict record, priority request, and reallocated secondary request
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
