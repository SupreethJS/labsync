import React from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  BarChart3,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  role: 'student' | 'faculty';
  onRoleChange: (newRole: 'student' | 'faculty') => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAIAssistant: () => void;
  onResetData: () => void;
  activeConflictCount: number;
  pendingRequestCount: number;
  geminiActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  role,
  onRoleChange,
  activeTab,
  onTabChange,
  onOpenAIAssistant,
  onResetData,
  activeConflictCount,
  pendingRequestCount,
  geminiActive,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button
              onClick={() => onTabChange(role === 'student' ? 'catalog' : 'faculty-requests')}
              className="flex items-center space-x-1.5 sm:space-x-2 text-left group focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg p-0.5 sm:p-1"
              aria-label="LabSync Home"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Cpu className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-teal-800 to-cyan-800 bg-clip-text text-transparent">
                    LabSync
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded bg-teal-100 text-teal-800">
                    GenAI
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Campus Lab Resource Sharing
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links based on Role (Desktop only) */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {role === 'student' ? (
              <>
                <button
                  onClick={() => onTabChange('catalog')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'catalog'
                      ? 'bg-teal-50 text-teal-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-current={activeTab === 'catalog' ? 'page' : undefined}
                >
                  <Layers className="w-4 h-4" />
                  <span>Equipment Catalog</span>
                </button>
                <button
                  onClick={() => onTabChange('my-requests')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'my-requests'
                      ? 'bg-teal-50 text-teal-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-current={activeTab === 'my-requests' ? 'page' : undefined}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>My Project Requests</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onTabChange('faculty-requests')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 relative ${
                    activeTab === 'faculty-requests'
                      ? 'bg-teal-50 text-teal-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-current={activeTab === 'faculty-requests' ? 'page' : undefined}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Faculty Approvals</span>
                  {pendingRequestCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white">
                      {pendingRequestCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onTabChange('conflicts')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 relative ${
                    activeTab === 'conflicts'
                      ? 'bg-teal-50 text-teal-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-current={activeTab === 'conflicts' ? 'page' : undefined}
                >
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span className="font-semibold text-rose-700">AI Conflict Center</span>
                  {activeConflictCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full bg-rose-600 text-white animate-pulse">
                      {activeConflictCount} active
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onTabChange('analytics')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'analytics'
                      ? 'bg-teal-50 text-teal-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-current={activeTab === 'analytics' ? 'page' : undefined}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Lab Analytics</span>
                </button>
              </>
            )}
          </nav>

          {/* Action buttons & Role Switcher */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* AI Assistant button */}
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium text-teal-900 bg-gradient-to-r from-teal-100 to-cyan-100 hover:from-teal-200 hover:to-cyan-200 border border-teal-300 shadow-xs transition-all group shrink-0"
              aria-label="Open GenAI Project Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-700 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="hidden sm:inline font-semibold">Find Equipment with AI</span>
              <span className="sm:hidden font-bold text-[11px]">AI</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
              <button
                onClick={() => onRoleChange('student')}
                className={`flex items-center space-x-1 px-1.5 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
                  role === 'student'
                    ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-pressed={role === 'student'}
              >
                <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>Student</span>
              </button>
              <button
                onClick={() => onRoleChange('faculty')}
                className={`flex items-center space-x-1 px-1.5 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
                  role === 'faculty'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-pressed={role === 'faculty'}
              >
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>Faculty</span>
              </button>
            </div>

            {/* Reset Demo Data button */}
            <button
              onClick={onResetData}
              title="Reset Demo Data (Pre-seeds 2 active conflicts)"
              aria-label="Reset Demo Data"
              className="p-1 sm:p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar for mobile nav tabs & engine status */}
      <div className="bg-slate-50 border-t border-slate-200">
        {/* Mobile Navigation Tabs (visible only on mobile < md) */}
        <div className="md:hidden px-2 pt-1.5 pb-1">
          {role === 'student' ? (
            <div className="grid grid-cols-2 gap-1.5" role="tablist" aria-label="Student Mobile Navigation">
              <button
                onClick={() => onTabChange('catalog')}
                className={`min-h-[38px] px-2 py-1 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                aria-current={activeTab === 'catalog' ? 'page' : undefined}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Equipment Catalog</span>
              </button>
              <button
                onClick={() => onTabChange('my-requests')}
                className={`min-h-[38px] px-2 py-1 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  activeTab === 'my-requests'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                aria-current={activeTab === 'my-requests' ? 'page' : undefined}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">My Requests</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1" role="tablist" aria-label="Faculty Mobile Navigation">
              <button
                onClick={() => onTabChange('faculty-requests')}
                className={`min-h-[38px] px-1.5 py-1 rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                  activeTab === 'faculty-requests'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                aria-current={activeTab === 'faculty-requests' ? 'page' : undefined}
              >
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span className="truncate">Approvals</span>
                {pendingRequestCount > 0 && (
                  <span className="ml-0.5 px-1 py-0.2 text-[9px] font-bold rounded-full bg-amber-500 text-white">
                    {pendingRequestCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => onTabChange('conflicts')}
                className={`min-h-[38px] px-1.5 py-1 rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                  activeTab === 'conflicts'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
                }`}
                aria-current={activeTab === 'conflicts' ? 'page' : undefined}
              >
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span className="truncate">Conflicts</span>
                {activeConflictCount > 0 && (
                  <span className="ml-0.5 px-1 py-0.2 text-[9px] font-bold rounded-full bg-rose-600 text-white">
                    {activeConflictCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => onTabChange('analytics')}
                className={`min-h-[38px] px-1.5 py-1 rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                aria-current={activeTab === 'analytics' ? 'page' : undefined}
              >
                <BarChart3 className="w-3 h-3 shrink-0" />
                <span className="truncate">Analytics</span>
              </button>
            </div>
          )}
        </div>

        {/* Engine Status Strip */}
        <div className="px-3 sm:px-4 py-1 border-t border-slate-200/80 text-[10px] sm:text-xs flex items-center justify-between text-slate-500">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="truncate">
              Role: <strong className="text-slate-800 capitalize">{role} View</strong>
            </span>
          </div>

          <div className="flex items-center space-x-1 shrink-0 text-slate-500">
            <span className="hidden xs:inline">Engine:</span>
            <strong className={geminiActive ? 'text-teal-700' : 'text-slate-700'}>
              {geminiActive ? 'Gemini 2.5 Flash' : 'Smart Heuristics'}
            </strong>
          </div>
        </div>
      </div>
    </header>
  );
};
