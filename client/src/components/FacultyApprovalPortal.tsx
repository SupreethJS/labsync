import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  User,
  MessageSquare,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { AccessRequest, RequestStatus } from '../types/index.js';
import { api } from '../api/client.js';

interface FacultyApprovalPortalProps {
  requests: AccessRequest[];
  onRefreshData: () => void;
  onNavigateToConflict: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning', title: string, message?: string) => void;
}

export const FacultyApprovalPortal: React.FC<FacultyApprovalPortalProps> = ({
  requests,
  onRefreshData,
  onNavigateToConflict,
  onShowToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Rejection remarks modal state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');

  // Close rejection modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && rejectingRequestId) {
        setRejectingRequestId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rejectingRequestId]);

  const handleApprove = async (id: string) => {
    setActionInProgressId(id);
    try {
      await api.facultyAction(id, 'approve', 'Approved by Faculty Lab Director.');
      onShowToast('success', 'Request Approved', 'Reservation confirmed and slot booked on equipment.');
      onRefreshData();
    } catch (err: any) {
      onShowToast('error', 'Approval Failed', err.message);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingRequestId) return;
    setActionInProgressId(rejectingRequestId);
    try {
      await api.facultyAction(
        rejectingRequestId,
        'reject',
        rejectRemarks.trim() || 'Laboratory capacity or schedule constraints.'
      );
      onShowToast('warning', 'Request Rejected', 'Student notified with provided remarks.');
      setRejectingRequestId(null);
      setRejectRemarks('');
      onRefreshData();
    } catch (err: any) {
      onShowToast('error', 'Rejection Failed', err.message);
    } finally {
      setActionInProgressId(null);
    }
  };

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (filterStatus !== 'All' && r.status !== filterStatus) return false;
      if (filterDept !== 'All' && r.department !== filterDept) return false;
      return true;
    });
  }, [requests, filterStatus, filterDept]);

  const pendingCount = useMemo(() => requests.filter((r) => r.status === 'pending').length, [requests]);
  const conflictCount = useMemo(() => requests.filter((r) => r.status === 'conflict').length, [requests]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-teal-700 dark:text-teal-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Faculty Lab Access & Approval Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review cross-department access justifications, verify academic milestones, and approve equipment slots.
          </p>
        </div>

        {/* Quick stat badges */}
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{pendingCount} Pending</span>
          </div>
          {conflictCount > 0 && (
            <button
              onClick={onNavigateToConflict}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center space-x-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
              <span>{conflictCount} Conflicts Flagged</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'pending', 'conflict', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st === 'All' ? 'All Requests' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span className="text-slate-500 dark:text-slate-400 font-medium">Department:</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-teal-500"
          >
            <option value="All">All Departments</option>
            <option value="AI & ML">AI & ML</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics & ECE">Electronics & ECE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Robotics">Robotics</option>
          </select>
        </div>
      </div>

      {/* Request Cards List */}
      <h2 className="sr-only">Student Access Requests Evaluation List</h2>
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Layers className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No requests found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No access requests match the selected status and department filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const isProcessing = actionInProgressId === req.id;

            let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
            if (req.status === 'pending') badgeColor = 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700';
            if (req.status === 'approved') badgeColor = 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
            if (req.status === 'rejected') badgeColor = 'bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-700';
            if (req.status === 'conflict') badgeColor = 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-bold animate-pulse';

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                        {req.status}
                      </span>
                      {req.isCrossDepartment && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          Inter-Department Access
                        </span>
                      )}
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500">ID: {req.id}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Booked: {req.date} ({req.startTime} - {req.endTime})</span>
                      </div>
                      <div className="flex items-center space-x-1 font-semibold text-rose-700 dark:text-rose-400">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span>Deadline: {req.projectDeadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Details */}
                  <div className="mt-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        "{req.projectTitle}"
                      </h3>
                      <span className="text-xs font-bold text-teal-800 dark:text-teal-400">
                        Target Equipment: {req.equipmentName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 mt-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        <strong>{req.studentName}</strong> ({req.studentEmail}) &bull; Department of{' '}
                        <strong>{req.department}</strong>
                      </span>
                    </div>

                    <div className="mt-2.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                        Technical Requirements & Justification:
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {req.projectRequirements}
                      </p>
                    </div>

                    {req.facultyRemarks && (
                      <div className="mt-2 text-xs bg-blue-50/70 dark:bg-blue-950/50 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300">
                        <strong>Faculty Remarks:</strong> {req.facultyRemarks}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                  {req.status === 'conflict' ? (
                    <button
                      onClick={onNavigateToConflict}
                      className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] sm:min-h-[36px] bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Resolve Conflict with AI</span>
                    </button>
                  ) : req.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => {
                          setRejectingRequestId(req.id);
                          setRejectRemarks('');
                        }}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-4 py-2 min-h-[44px] sm:min-h-[36px] border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-4 py-2 min-h-[44px] sm:min-h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Request</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic text-center sm:text-right">
                      Action finalized on this request.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Remarks Dialog Modal */}
      {rejectingRequestId && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-[95vw] max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto">
            <h3 id="reject-dialog-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
              Reject Access Request
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Provide feedback or academic rationale to help the student adjust their submission.
            </p>

            <div className="mt-4">
              <label htmlFor="reject-remarks" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Faculty Remarks / Reason
              </label>
              <textarea
                id="reject-remarks"
                rows={3}
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="e.g. Schedule capacity full; please adjust slot to off-peak hours or request alternative equipment..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                onClick={() => setRejectingRequestId(null)}
                className="w-full sm:w-auto px-4 py-2 min-h-[44px] sm:min-h-[36px] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={Boolean(actionInProgressId)}
                className="w-full sm:w-auto px-4 py-2 min-h-[44px] sm:min-h-[36px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
