import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { SchedulingConflict, AIResolutionPlan } from '../types/index.js';
import { api } from '../api/client.js';

interface ConflictResolutionCenterProps {
  conflicts: SchedulingConflict[];
  onRefreshData: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning', title: string, message?: string) => void;
}

export const ConflictResolutionCenter: React.FC<ConflictResolutionCenterProps> = ({
  conflicts,
  onRefreshData,
  onShowToast,
}) => {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Record<string, AIResolutionPlan>>({});

  const handleResolveWithAI = async (conflictId: string) => {
    setResolvingId(conflictId);
    try {
      const plan = await api.resolveConflict(conflictId);
      setResolutions((prev) => ({ ...prev, [conflictId]: plan }));
      onShowToast(
        'success',
        'AI Fair Resolution Plan Generated',
        `Evaluated deadline urgency, requirements, and hardware alternatives.`
      );
    } catch (err: any) {
      onShowToast('error', 'AI Resolution Failed', err.message);
    } finally {
      setResolvingId(null);
    }
  };

  const handleApplyPlan = async (conflictId: string) => {
    setApplyingId(conflictId);
    try {
      await api.applyConflictResolution(conflictId, 'Prof. Academic Dean');
      onShowToast(
        'success',
        'Schedule Updated Live',
        'Priority allocated and secondary request shifted/reassigned seamlessly.'
      );
      onRefreshData();
    } catch (err: any) {
      onShowToast('error', 'Failed to Apply Resolution', err.message);
    } finally {
      setApplyingId(null);
    }
  };

  const activeConflicts = useMemo(() => conflicts.filter((c) => c.status === 'active'), [conflicts]);
  const resolvedConflicts = useMemo(() => conflicts.filter((c) => c.status === 'resolved'), [conflicts]);

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-5 sm:p-8 text-white shadow-xl border border-teal-800/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Hero Feature &bull; Autonomous Multi-Factor Conflict Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            GenAI Laboratory Conflict Resolution Center
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            When multiple students across 5 engineering departments compete for the same specialized equipment slot,
            the LabSync AI engine analyzes project deadline proximity, thesis criticality, requirement specificity, and alternative hardware availability to generate a mathematically fair, zero-penalty schedule plan.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-300">
            <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>
                <strong>{activeConflicts.length}</strong> Active Conflicts Awaiting Action
              </span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>{resolvedConflicts.length}</strong> Conflicts Resolved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Conflicts List */}
      <h2 className="sr-only">Active Laboratory Conflicts List</h2>
      {activeConflicts.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">All Laboratory Conflicts Resolved!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            There are currently no active booking overlaps. To re-seed the test conflicts for evaluation, click the "Reset Demo Data" button in the top navigation bar.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeConflicts.map((conflict, cIdx) => {
            const plan = resolutions[conflict.id] || conflict.resolution;
            const isResolving = resolvingId === conflict.id;
            const isApplying = applyingId === conflict.id;

            return (
              <div
                key={conflict.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-md overflow-hidden transition-all"
              >
                {/* Conflict Bar Header */}
                <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-white dark:from-rose-950/40 dark:via-amber-950/20 dark:to-slate-900 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-rose-200 dark:border-rose-900/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-sm">
                      #{cIdx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                          High-Demand Overlap
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300">
                          Active Conflict
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {conflict.equipmentName}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{conflict.date}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-800 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Overlap: {conflict.overlappingSlot.startTime} - {conflict.overlappingSlot.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Competing Requests Side-by-Side Comparison */}
                <div className="p-4 sm:p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>Competing Student Access Requests</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Request A */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {conflict.requestA.studentName}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-semibold">
                            {conflict.requestA.department}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-teal-900 dark:text-teal-300 mt-1">
                          "{conflict.requestA.projectTitle}"
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
                          {conflict.requestA.projectRequirements}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            Slot: {conflict.requestA.startTime} - {conflict.requestA.endTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-rose-700 dark:text-rose-400">
                            Deadline: {conflict.requestA.projectDeadline}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Request B */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {conflict.requestB.studentName}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-semibold">
                            {conflict.requestB.department}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mt-1">
                          "{conflict.requestB.projectTitle}"
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
                          {conflict.requestB.projectRequirements}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            Slot: {conflict.requestB.startTime} - {conflict.requestB.endTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">
                            Deadline: {conflict.requestB.projectDeadline}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action / Resolution Output Area */}
                  {!plan ? (
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Click below to run multi-factor heuristic and Gemini reasoning over deadlines, requirements, and hardware alternatives.
                      </p>
                      <button
                        onClick={() => handleResolveWithAI(conflict.id)}
                        disabled={isResolving}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
                      >
                        {isResolving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Analyzing Fairness & Requirements...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Resolve Conflict with AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* AI Structured Recommendation Card */
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300">
                            AI Fairness Recommendation & Allocation Plan
                          </h4>
                        </div>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          Source: {plan.source === 'gemini' ? (plan.modelUsed || 'Gemini 2.5 Flash') : 'Smart Heuristics Fallback'}
                        </span>
                      </div>

                      {/* Summary Banner */}
                      <div className="p-3 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-950 dark:text-teal-200 font-medium leading-relaxed">
                        <strong>Plan Summary:</strong> {plan.recommendedPlanSummary}
                      </div>

                      {/* Two Plan Cards: Priority vs Alternative */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Priority Card */}
                        <div className="p-4 rounded-xl border-2 border-emerald-500 dark:border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                              ✓
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                              Priority Awarded: {plan.priorityRequest.studentName}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 mt-1">
                            "{plan.priorityRequest.projectTitle}"
                          </p>
                          <div className="mt-2 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                            <p>
                              <strong>Allocated Slot:</strong> {plan.priorityRequest.allocatedSlot.date}{' '}
                              ({plan.priorityRequest.allocatedSlot.startTime} -{' '}
                              {plan.priorityRequest.allocatedSlot.endTime})
                            </p>
                            <p className="italic text-emerald-800 dark:text-emerald-400 text-[11px]">
                              <strong>Rationale:</strong> {plan.priorityRequest.rationale}
                            </p>
                          </div>
                        </div>

                        {/* Secondary Card */}
                        <div className="p-4 rounded-xl border-2 border-cyan-500 dark:border-cyan-600 bg-cyan-50/40 dark:bg-cyan-950/30">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                              ⇄
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-cyan-900 dark:text-cyan-300">
                              Fair Accommodation: {plan.secondaryRequest.studentName}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-cyan-950 dark:text-cyan-200 mt-1">
                            "{plan.secondaryRequest.projectTitle}"
                          </p>
                          <div className="mt-2 text-xs text-cyan-900 dark:text-cyan-300 space-y-1">
                            {plan.secondaryRequest.proposedAlternative.type === 'alternative_equipment' ? (
                              <p>
                                <strong>Alternative Kit:</strong>{' '}
                                <span className="font-semibold text-cyan-950 dark:text-cyan-100">
                                  {plan.secondaryRequest.proposedAlternative.alternativeEquipmentName}
                                </span>
                              </p>
                            ) : (
                              <p>
                                <strong>Shifted Open Slot:</strong>{' '}
                                {plan.secondaryRequest.proposedAlternative.allocatedSlot?.date} (
                                {plan.secondaryRequest.proposedAlternative.allocatedSlot?.startTime} -{' '}
                                {plan.secondaryRequest.proposedAlternative.allocatedSlot?.endTime})
                              </p>
                            )}
                            <p className="italic text-cyan-800 dark:text-cyan-400 text-[11px]">
                              <strong>Notes:</strong> {plan.secondaryRequest.proposedAlternative.notes}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Fairness Justification */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-slate-100">Academic Fairness Justification:</strong>{' '}
                        {plan.fairnessJustification}
                      </div>

                      {/* One-Click Apply Button */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
                        <button
                          onClick={() => handleResolveWithAI(conflict.id)}
                          disabled={isResolving}
                          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] sm:min-h-[38px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1 border border-slate-200 dark:border-slate-700 sm:border-transparent"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isResolving ? 'animate-spin' : ''}`} />
                          <span>Re-evaluate</span>
                        </button>

                        <button
                          onClick={() => handleApplyPlan(conflict.id)}
                          disabled={isApplying}
                          className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] sm:min-h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
                        >
                          {isApplying ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Updating Live Schedule...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Apply Recommended Plan Live</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolved Conflicts History */}
      {resolvedConflicts.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Successfully Resolved Conflicts ({resolvedConflicts.length})
            </h2>
          </div>

          <div className="space-y-3">
            {resolvedConflicts.map((conf) => (
              <div
                key={conf.id}
                className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{conf.equipmentName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                      Resolved
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {conf.requestA.studentName} vs {conf.requestB.studentName} &bull; Overlap resolved via AI fair allocation.
                  </p>
                </div>
                <div className="text-slate-400 dark:text-slate-500 text-[11px]">
                  Date: {conf.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
