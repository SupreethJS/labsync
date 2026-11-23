import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Sparkles,
  Clock,
  Activity,
  Lightbulb,
} from 'lucide-react';
import { AnalyticsSummary } from '../types/index.js';

interface AnalyticsDashboardProps {
  analytics: AnalyticsSummary | null;
  onSelectEquipmentForBooking: (equipmentId: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
  onSelectEquipmentForBooking,
}) => {
  if (!analytics) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Loading campus laboratory analytics...
      </div>
    );
  }

  const deptColors: Record<string, string> = {
    'AI & ML': 'bg-teal-500',
    'Computer Science': 'bg-blue-500',
    'Electronics & ECE': 'bg-indigo-500',
    'Mechanical': 'bg-amber-500',
    'Robotics': 'bg-rose-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-teal-700 dark:text-teal-400" />
          <span>Campus Resource Utilization & Cross-Sharing Analytics</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics tracking interdisciplinary equipment sharing, conflict resolutions, and bench efficiency.
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Lab Utilization */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Overall Utilization</span>
            <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {analytics.overallUtilizationRate}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Peak Capacity</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.overallUtilizationRate}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Cross-Dept Sharing */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Interdisciplinary Sharing</span>
            <Share2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-purple-900 dark:text-purple-300">
              {analytics.crossDepartmentBookingsCount}
            </span>
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
              ({analytics.crossDepartmentRate}% of total)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Students accessing instruments outside their home department.
          </p>
        </div>

        {/* Metric 3: Conflicts Resolved */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Conflicts Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-300">
              {analytics.resolvedConflictsCount}
            </span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              ({analytics.activeConflictsCount} pending)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Fair schedule reorganizations managed via GenAI multi-factor engine.
          </p>
        </div>

        {/* Metric 4: Total Inventory */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Catalog Assets</span>
            <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {analytics.totalEquipmentCount}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ({analytics.activeEquipmentCount} online)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            High-tier research equipment across 5 engineering departments.
          </p>
        </div>
      </div>

      {/* Department Breakdown & Underutilized Equipment Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Department Usage Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Departmental Resource Allocation</span>
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">Hours & Booking Ratio</span>
          </div>

          <div className="space-y-4">
            {analytics.departmentUsage.map((dept) => {
              const colorClass = deptColors[dept.department] || 'bg-slate-500';

              return (
                <div key={dept.department}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.department}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      <strong>{dept.totalBookings}</strong> requests &bull;{' '}
                      <strong>{dept.hoursUsed} hrs</strong> ({dept.percentageOfTotal}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className={`${colorClass} h-full transition-all duration-500`}
                      style={{ width: `${Math.max(8, dept.percentageOfTotal)}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {dept.crossDeptSharedCount} cross-department reservations hosted
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations for Underutilized Equipment */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                AI Optimization Insights & Underutilized Assets
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              The AI scheduler identifies underutilized specialized hardware and surfaces interdisciplinary sharing opportunities.
            </p>

            <div className="space-y-3">
              {analytics.underutilizedEquipment.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                        {item.department}
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-200 mt-1 font-medium leading-relaxed">
                      💡 {item.suggestion}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectEquipmentForBooking(item.id)}
                    className="w-full sm:w-auto px-3.5 py-2 min-h-[44px] sm:min-h-[32px] bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center justify-center"
                  >
                    Book Slot
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
            Automated recommendations updated in real-time as student requests are booked.
          </div>
        </div>
      </div>

      {/* Real-Time Audit Log Timeline */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Live Campus Laboratory Audit Trail
            </h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">Transparency & Scheduling Events</span>
        </div>

        <div className="space-y-3">
          {analytics.recentAuditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-3 text-xs"
            >
              <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 break-words">{log.description}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Actor: <strong className="text-slate-700 dark:text-slate-300">{log.actor}</strong>
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap font-mono shrink-0 pl-4 sm:pl-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
