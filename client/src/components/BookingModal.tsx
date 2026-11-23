import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  Cpu,
  Sparkles,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Equipment, Department, AccessRequest } from '../types/index.js';
import { api } from '../api/client.js';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: Equipment[];
  preselectedEquipmentId?: string;
  onSuccess: (message: string, isConflict: boolean) => void;
}

const DEPARTMENTS: Department[] = [
  'AI & ML',
  'Computer Science',
  'Electronics & ECE',
  'Mechanical',
  'Robotics',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  equipmentList,
  preselectedEquipmentId,
  onSuccess,
}) => {
  const [equipmentId, setEquipmentId] = useState(preselectedEquipmentId || '');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [department, setDepartment] = useState<Department>('AI & ML');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectRequirements, setProjectRequirements] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');

  // Conflict detection state
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictingReqs, setConflictingReqs] = useState<AccessRequest[]>([]);
  const [suggestedOpenSlots, setSuggestedOpenSlots] = useState<
    Array<{ startTime: string; endTime: string }>
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize dates
  useEffect(() => {
    if (preselectedEquipmentId) {
      setEquipmentId(preselectedEquipmentId);
    } else if (equipmentList.length > 0 && !equipmentId) {
      setEquipmentId(equipmentList[0].id);
    }

    // Default dates: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    setDate(tomorrowStr);
    setProjectDeadline(nextWeekStr);
  }, [preselectedEquipmentId, equipmentList]);

  // Live conflict detection debounce
  useEffect(() => {
    if (!equipmentId || !date || !startTime || !endTime || startTime >= endTime) {
      setHasConflict(false);
      setConflictingReqs([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingConflict(true);
      try {
        const res = await api.checkSlotOverlap(equipmentId, date, startTime, endTime);
        setHasConflict(res.hasConflict);
        setConflictingReqs(res.conflictingRequests);

        if (res.hasConflict) {
          const slots = await api.getSuggestedOpenSlots(equipmentId, date);
          setSuggestedOpenSlots(slots);
        } else {
          setSuggestedOpenSlots([]);
        }
      } catch (err) {
        console.warn('Conflict check check failed:', err);
      } finally {
        setCheckingConflict(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [equipmentId, date, startTime, endTime]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedEquipment = equipmentList.find((e) => e.id === equipmentId);

  const handleSubmit = async (allowConflict: boolean) => {
    setError(null);
    if (!studentName.trim() || !studentEmail.trim() || !projectTitle.trim() || !projectRequirements.trim()) {
      setError('Please fill out all required project fields.');
      return;
    }

    if (projectRequirements.length < 10) {
      setError('Project requirements must be at least 10 characters detailing your technical need.');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be strictly after start time.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createRequest({
        equipmentId,
        studentName,
        studentEmail,
        department,
        projectTitle,
        projectRequirements,
        projectDeadline,
        date,
        startTime,
        endTime,
        allowConflictFlag: allowConflict,
      });

      onSuccess(res.message, res.conflictDetected);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="booking-modal-title" className="text-xl font-bold text-slate-900">
              Project Access Request & Slot Reservation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Book high-performance laboratory equipment for academic projects & research milestones.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Equipment Banner */}
        {selectedEquipment && (
          <div className="mt-4 p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-5 h-5 text-teal-700" />
              <div>
                <p className="text-xs font-bold text-teal-900">{selectedEquipment.name}</p>
                <p className="text-[11px] text-teal-700 font-medium">
                  {selectedEquipment.labRoom} &bull; {selectedEquipment.department}
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white text-teal-800 border border-teal-300">
              {selectedEquipment.category}
            </span>
          </div>
        )}

        {/* Form Fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="mt-4 space-y-4"
        >
          {/* Equipment Selector (if not preselected) */}
          <div>
            <label htmlFor="equipment-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Equipment <span className="text-rose-500">*</span>
            </label>
            <select
              id="equipment-select"
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            >
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.department} - {eq.labRoom})
                </option>
              ))}
            </select>
          </div>

          {/* Student Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="student-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Student Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="student-name"
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label htmlFor="student-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Student Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="student-email"
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="e.g. priya@campus.edu"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label htmlFor="student-dept" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                id="student-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="project-title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="project-title"
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Clinical LLM Fine-Tuning or Drone Vision Guidance"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label htmlFor="project-deadline" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                id="project-deadline"
                type="date"
                required
                value={projectDeadline}
                onChange={(e) => setProjectDeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="project-requirements" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Project Requirements & Hardware Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="project-requirements"
              rows={2}
              required
              value={projectRequirements}
              onChange={(e) => setProjectRequirements(e.target.value)}
              placeholder="Explain why this specialized equipment is mandatory for your milestone (e.g. 48GB VRAM needed for 70B model or PA-CF filament required for dyno inspection)..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-none"
            />
          </div>

          {/* Date & Slot Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="slot-date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reservation Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="slot-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label htmlFor="slot-start" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="slot-start"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label htmlFor="slot-end" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                id="slot-end"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Conflict Detector Warning Banner */}
          {checkingConflict && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Verifying live laboratory schedule conflicts...</span>
            </div>
          )}

          {hasConflict && !checkingConflict && (
            <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-900 space-y-3">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Live Schedule Overlap Detected
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Your requested slot ({startTime} - {endTime}) overlaps with an active reservation by{' '}
                    <strong>{conflictingReqs[0]?.studentName || 'another student'}</strong> for "
                    <em>{conflictingReqs[0]?.projectTitle || 'Project Work'}</em>" (
                    {conflictingReqs[0]?.startTime} - {conflictingReqs[0]?.endTime}).
                  </p>
                </div>
              </div>

              {/* AI Suggested Open Slots */}
              {suggestedOpenSlots.length > 0 && (
                <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-900 block mb-1.5 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>AI-Suggested Open Alternative Slots on {date}:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedOpenSlots.map((slot, sIdx) => (
                      <button
                        type="button"
                        key={sIdx}
                        onClick={() => {
                          setStartTime(slot.startTime);
                          setEndTime(slot.endTime);
                        }}
                        className="text-xs px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-md border border-amber-300 transition-colors"
                      >
                        {slot.startTime} - {slot.endTime} (Click to apply)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-amber-700">
                You can switch to an open slot above, or submit as a flagged conflict to let the GenAI Conflict Engine evaluate priority based on deadline urgency!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            {hasConflict ? (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit & Queue for AI Fair Resolution</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Access Request</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
