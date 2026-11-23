import React, { useState, useEffect } from 'react';
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

  const filtered = requests.filter((r) => {
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    if (filterDept !== 'All' && r.department !== filterDept) return false;
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const conflictCount = requests.filter((r) => r.status === 'conflict').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-teal-700" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Faculty Lab Access & Approval Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review cross-department access justifications, verify academic milestones, and approve equipment slots.
          </p>
        </div>

        {/* Quick stat badges */}
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{pendingCount} Pending</span>
          </div>
          {conflictCount > 0 && (
            <button
              onClick={onNavigateToConflict}
              className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center space-x-1.5 hover:bg-rose-100 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>{conflictCount} Conflicts Flagged</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'pending', 'conflict', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'All' ? 'All Requests' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Department:</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-teal-500"
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
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No requests found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No access requests match the selected status and department filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const isProcessing = actionInProgressId === req.id;

            let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
            if (req.status === 'pending') badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
            if (req.status === 'approved') badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
            if (req.status === 'rejected') badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
            if (req.status === 'conflict') badgeColor = 'bg-rose-50 text-rose-800 border-rose-300 font-bold animate-pulse';

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                        {req.status}
                      </span>
                      {req.isCrossDepartment && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          Inter-Department Access
                        </span>
                      )}
                      <span className="text-xs font-mono text-slate-400">ID: {req.id}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Booked: {req.date} ({req.startTime} - {req.endTime})</span>
                      </div>
                      <div className="flex items-center space-x-1 font-semibold text-rose-700">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span>Deadline: {req.projectDeadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Details */}
                  <div className="mt-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <h3 className="text-base font-extrabold text-slate-900">
                        "{req.projectTitle}"
                      </h3>
                      <span className="text-xs font-bold text-teal-800">
                        Target Equipment: {req.equipmentName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-600 mt-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        <strong>{req.studentName}</strong> ({req.studentEmail}) &bull; Department of{' '}
                        <strong>{req.department}</strong>
                      </span>
                    </div>

                    <div className="mt-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Technical Requirements & Justification:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {req.projectRequirements}
                      </p>
                    </div>

                    {req.facultyRemarks && (
                      <div className="mt-2 text-xs bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 text-blue-900">
                        <strong>Faculty Remarks:</strong> {req.facultyRemarks}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  {req.status === 'conflict' ? (
                    <button
                      onClick={onNavigateToConflict}
                      className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm"
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
                        className="px-3.5 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={isProcessing}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
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
                    <span className="text-xs text-slate-400 italic">
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
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 id="reject-dialog-title" className="text-base font-bold text-slate-900">
              Reject Access Request
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide feedback or academic rationale to help the student adjust their submission.
            </p>

            <div className="mt-4">
              <label htmlFor="reject-remarks" className="block text-xs font-semibold text-slate-700 mb-1">
                Faculty Remarks / Reason
              </label>
              <textarea
                id="reject-remarks"
                rows={3}
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="e.g. Schedule capacity full; please adjust slot to off-peak hours or request alternative equipment..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="mt-4 flex items-center justify-end space-x-2">
              <button
                onClick={() => setRejectingRequestId(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={Boolean(actionInProgressId)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
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
