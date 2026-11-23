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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onTabChange(role === 'student' ? 'catalog' : 'faculty-requests')}
              className="flex items-center space-x-2 text-left group focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg p-1"
              aria-label="LabLink Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-800 to-cyan-800 bg-clip-text text-transparent">
                    LabLink
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                    GenAI
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Campus Lab Resource Sharing
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links based on Role */}
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
          <div className="flex items-center space-x-2.5">
            {/* AI Assistant button */}
            <button
              onClick={onOpenAIAssistant}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-teal-900 bg-gradient-to-r from-teal-100 to-cyan-100 hover:from-teal-200 hover:to-cyan-200 border border-teal-300 shadow-xs transition-all group"
              aria-label="Open GenAI Project Assistant"
            >
              <Sparkles className="w-4 h-4 text-teal-700 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline font-semibold">Find Equipment with AI</span>
              <span className="sm:hidden font-semibold">AI Finder</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => onRoleChange('student')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  role === 'student'
                    ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-pressed={role === 'student'}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
              <button
                onClick={() => onRoleChange('faculty')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  role === 'faculty'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-pressed={role === 'faculty'}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Faculty</span>
              </button>
            </div>

            {/* Reset Demo Data button */}
            <button
              onClick={onResetData}
              title="Reset Demo Data (Pre-seeds 2 active conflicts)"
              aria-label="Reset Demo Data"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar for mobile nav & engine status */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-600 font-medium">
            Active Role: <strong className="text-slate-900 capitalize">{role} View</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">
            AI Engine:{' '}
            <strong className={geminiActive ? 'text-teal-700' : 'text-slate-700'}>
              {geminiActive ? 'Gemini 2.5 Flash' : 'Smart Heuristics Fallback'}
            </strong>
          </span>
        </div>

        {/* Mobile Nav Links */}
        <div className="flex md:hidden space-x-2">
          {role === 'student' ? (
            <>
              <button
                onClick={() => onTabChange('catalog')}
                className={`px-2 py-0.5 rounded text-xs ${activeTab === 'catalog' ? 'bg-teal-200 font-bold' : ''}`}
              >
                Catalog
              </button>
              <button
                onClick={() => onTabChange('my-requests')}
                className={`px-2 py-0.5 rounded text-xs ${activeTab === 'my-requests' ? 'bg-teal-200 font-bold' : ''}`}
              >
                My Requests
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onTabChange('faculty-requests')}
                className={`px-2 py-0.5 rounded text-xs ${activeTab === 'faculty-requests' ? 'bg-teal-200 font-bold' : ''}`}
              >
                Approvals
              </button>
              <button
                onClick={() => onTabChange('conflicts')}
                className={`px-2 py-0.5 rounded text-xs font-bold text-rose-700 ${activeTab === 'conflicts' ? 'bg-rose-100' : ''}`}
              >
                Conflicts ({activeConflictCount})
              </button>
              <button
                onClick={() => onTabChange('analytics')}
                className={`px-2 py-0.5 rounded text-xs ${activeTab === 'analytics' ? 'bg-teal-200 font-bold' : ''}`}
              >
                Analytics
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
