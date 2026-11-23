import React from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';
import { AccessRequest } from '../types/index.js';

interface StudentRequestsViewProps {
  requests: AccessRequest[];
  onOpenBooking: () => void;
  onNavigateToConflict: () => void;
}

export const StudentRequestsView: React.FC<StudentRequestsViewProps> = ({
  requests,
  onOpenBooking,
  onNavigateToConflict,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-teal-700 dark:text-teal-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              My Campus Project Requests
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track status of laboratory access requests, milestone deadlines, and AI-resolved slots.
          </p>
        </div>

        <button
          onClick={onOpenBooking}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] sm:min-h-[36px] bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Equipment Request</span>
        </button>
      </div>

      {/* Requests List */}
      <h2 className="sr-only">Submitted Project Requests</h2>
      {requests.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No project requests submitted yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Browse the specialized equipment catalog or use our GenAI Project Assistant to request laboratory access.
          </p>
          <button
            onClick={onOpenBooking}
            className="mt-4 px-4 py-2 text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 rounded-lg shadow-sm"
          >
            Create Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            let statusStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
            let StatusIcon = Clock;

            if (req.status === 'pending') {
              statusStyle = 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700';
              StatusIcon = Clock;
            } else if (req.status === 'approved') {
              statusStyle = 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
              StatusIcon = CheckCircle2;
            } else if (req.status === 'conflict') {
              statusStyle = 'bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-700 animate-pulse';
              StatusIcon = AlertTriangle;
            } else if (req.status === 'rejected') {
              statusStyle = 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
              StatusIcon = XCircle;
            }

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className={`text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${statusStyle}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{req.status}</span>
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Student: <strong className="text-slate-800 dark:text-slate-200">{req.studentName}</strong> ({req.department})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{req.date} ({req.startTime} - {req.endTime})</span>
                    </div>
                    <div className="flex items-center space-x-1 font-semibold text-rose-700 dark:text-rose-400">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Deadline: {req.projectDeadline}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      "{req.projectTitle}"
                    </h3>
                    <span className="text-xs font-bold text-teal-800 dark:text-teal-400">
                      {req.equipmentName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
                    {req.projectRequirements}
                  </p>

                  {req.facultyRemarks && (
                    <div className="mt-2 text-xs bg-teal-50/70 dark:bg-teal-950/50 p-2.5 rounded-lg border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-300 font-medium">
                      <strong>Remarks:</strong> {req.facultyRemarks}
                    </div>
                  )}

                  {req.status === 'conflict' && (
                    <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center space-x-2 text-xs text-rose-900 dark:text-rose-200 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>Scheduling conflict active. Switch to Faculty View to inspect or apply AI resolution.</span>
                      </div>
                      <button
                        onClick={onNavigateToConflict}
                        className="w-full sm:w-auto px-3.5 py-2 min-h-[44px] sm:min-h-[32px] bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 flex items-center justify-center"
                      >
                        View Conflict
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
