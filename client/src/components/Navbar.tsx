import React, { useState } from 'react';
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
  Sun,
  Moon,
  Menu,
  X,
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
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2">
          {/* Logo */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            <button
              onClick={() => onTabChange(role === 'student' ? 'catalog' : 'faculty-requests')}
              className="flex items-center space-x-1.5 sm:space-x-2 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg p-0.5 sm:p-1"
              aria-label="LabSync Home"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Cpu className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-teal-800 dark:from-teal-300 to-cyan-800 dark:to-cyan-300 bg-clip-text text-transparent">
                    LabSync
                  </span>
                  <span className="hidden xs:inline text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    GenAI
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
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
                      ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
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
                      ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
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
                      ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
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
                      ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  aria-current={activeTab === 'conflicts' ? 'page' : undefined}
                >
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span className="font-semibold text-rose-700 dark:text-rose-400">AI Conflict Center</span>
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
                      ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
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
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* AI Assistant button (Tablet & Desktop) */}
            <button
              onClick={onOpenAIAssistant}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-teal-900 dark:text-teal-200 bg-gradient-to-r from-teal-100 dark:from-teal-900/60 to-cyan-100 dark:to-cyan-900/60 hover:from-teal-200 hover:to-cyan-200 border border-teal-300 dark:border-teal-700 shadow-xs transition-all group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Open GenAI Project Assistant"
            >
              <Sparkles className="w-4 h-4 text-teal-700 dark:text-teal-300 group-hover:rotate-12 transition-transform shrink-0" />
              <span>Find Equipment with AI</span>
            </button>

            {/* Role Switcher */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 min-h-[40px]">
              <button
                onClick={() => onRoleChange('student')}
                className={`min-h-[34px] sm:min-h-[36px] flex items-center space-x-1 px-1.5 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                  role === 'student'
                    ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                aria-pressed={role === 'student'}
                aria-label="Switch to Student view"
              >
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">Student</span>
              </button>
              <button
                onClick={() => onRoleChange('faculty')}
                className={`min-h-[34px] sm:min-h-[36px] flex items-center space-x-1 px-1.5 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                  role === 'faculty'
                    ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                aria-pressed={role === 'faculty'}
                aria-label="Switch to Faculty view"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">Faculty</span>
              </button>
            </div>

            {/* Theme Toggle Button (Light / Dark) - Always visible in top bar on Mobile and Desktop */}
            <button
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={theme === 'dark'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="min-h-[40px] min-w-[40px] h-10 w-10 inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              )}
            </button>

            {/* Mobile Menu Button - Directly next to Theme Toggle on Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="md:hidden min-h-[40px] min-w-[40px] h-10 w-10 inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              )}
            </button>

            {/* Reset Demo Data button (Desktop only; on mobile it is in the mobile menu) */}
            <button
              onClick={onResetData}
              title="Reset Demo Data (Pre-seeds 2 active conflicts)"
              aria-label="Reset Demo Data"
              className="hidden md:inline-flex min-h-[40px] min-w-[40px] h-10 w-10 items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer (Toggled by Mobile Menu button) */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-3 space-y-2.5 shadow-lg transition-colors"
        >
          {/* Quick AI search button for mobile */}
          <button
            onClick={() => {
              onOpenAIAssistant();
              setIsMobileMenuOpen(false);
            }}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-teal-900 dark:text-teal-200 bg-gradient-to-r from-teal-100 dark:from-teal-900/60 to-cyan-100 dark:to-cyan-900/60 hover:from-teal-200 hover:to-cyan-200 border border-teal-300 dark:border-teal-700 shadow-xs flex items-center justify-center space-x-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-teal-700 dark:text-teal-300" />
            <span>Find Equipment with GenAI</span>
          </button>

          {/* Navigation Links */}
          <div className="space-y-1" role="tablist" aria-label="Mobile Drawer Navigation">
            {role === 'student' ? (
              <>
                <button
                  onClick={() => {
                    onTabChange('catalog');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                    activeTab === 'catalog'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  aria-current={activeTab === 'catalog' ? 'page' : undefined}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Equipment Catalog</span>
                </button>
                <button
                  onClick={() => {
                    onTabChange('my-requests');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                    activeTab === 'my-requests'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  aria-current={activeTab === 'my-requests' ? 'page' : undefined}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>My Project Requests</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onTabChange('faculty-requests');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'faculty-requests'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  aria-current={activeTab === 'faculty-requests' ? 'page' : undefined}
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Faculty Approvals</span>
                  </div>
                  {pendingRequestCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                      {pendingRequestCount} pending
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onTabChange('conflicts');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeTab === 'conflicts'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                  aria-current={activeTab === 'conflicts' ? 'page' : undefined}
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>AI Conflict Resolution Center</span>
                  </div>
                  {activeConflictCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-600 text-white animate-pulse">
                      {activeConflictCount} active
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onTabChange('analytics');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  aria-current={activeTab === 'analytics' ? 'page' : undefined}
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>Lab Resource Analytics</span>
                </button>
              </>
            )}
          </div>

          {/* Reset Demo Data button for mobile */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                onResetData();
                setIsMobileMenuOpen(false);
              }}
              className="w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Demo Data (Pre-seeds Conflicts)</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-bar for mobile nav tabs & engine status */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800">
        {/* Mobile Navigation Tabs (visible only on mobile < md) */}
        <div className="md:hidden px-2 pt-1.5 pb-1">
          {role === 'student' ? (
            <div className="grid grid-cols-2 gap-1.5" role="tablist" aria-label="Student Mobile Navigation">
              <button
                onClick={() => onTabChange('catalog')}
                className={`min-h-[40px] px-2 py-1 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-current={activeTab === 'catalog' ? 'page' : undefined}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Equipment Catalog</span>
              </button>
              <button
                onClick={() => onTabChange('my-requests')}
                className={`min-h-[40px] px-2 py-1 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  activeTab === 'my-requests'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                className={`min-h-[40px] px-1 py-1 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-0.5 transition-all ${
                  activeTab === 'faculty-requests'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                className={`min-h-[40px] px-1 py-1 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-0.5 transition-all ${
                  activeTab === 'conflicts'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
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
                className={`min-h-[40px] px-1 py-1 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-0.5 transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
        <div className="px-3 sm:px-4 py-1 border-t border-slate-200/80 dark:border-slate-800 text-[10px] sm:text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="truncate">
              Role: <strong className="text-slate-800 dark:text-slate-200 capitalize">{role} View</strong>
            </span>
          </div>

          <div className="flex items-center space-x-1 shrink-0 text-slate-500 dark:text-slate-400">
            <span className="hidden xs:inline">Engine:</span>
            <strong className={geminiActive ? 'text-teal-700 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}>
              {geminiActive ? 'Gemini 2.5 Flash' : 'Smart Heuristics'}
            </strong>
          </div>
        </div>
      </div>
    </header>
  );
};
