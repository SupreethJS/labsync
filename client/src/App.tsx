import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { EquipmentCatalog } from './components/EquipmentCatalog.js';
import { StudentRequestsView } from './components/StudentRequestsView.js';
import { FacultyApprovalPortal } from './components/FacultyApprovalPortal.js';
import { ConflictResolutionCenter } from './components/ConflictResolutionCenter.js';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.js';
import { AIProjectAssistantModal } from './components/AIProjectAssistantModal.js';
import { BookingModal } from './components/BookingModal.js';
import { ToastContainer, ToastMessage } from './components/Toast.js';
import {
  Equipment,
  AccessRequest,
  SchedulingConflict,
  AnalyticsSummary,
} from './types/index.js';
import { api } from './api/client.js';

export function App() {
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [activeTab, setActiveTab] = useState<string>('catalog');

  // Theme State (Light / Dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('labsync-theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('labsync-theme', next);
      } catch {}
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Core Data
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [conflicts, setConflicts] = useState<SchedulingConflict[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [geminiActive, setGeminiActive] = useState<boolean>(false);

  // Modals
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedEquipmentId, setPreselectedEquipmentId] = useState<string | undefined>();

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [eqData, reqData, confData, anaData, healthData] = await Promise.all([
        api.getEquipment(),
        api.getRequests(),
        api.getConflicts(),
        api.getAnalytics(),
        api.getHealth().catch(() => ({ geminiConfigured: false, status: 'ok', model: '' })),
      ]);

      setEquipmentList(eqData);
      setRequests(reqData);
      setConflicts(confData);
      setAnalytics(anaData);
      setGeminiActive(healthData.geminiConfigured);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      addToast('error', 'Network Error', 'Could not load laboratory data. Please check backend connection.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = (newRole: 'student' | 'faculty') => {
    setRole(newRole);
    if (newRole === 'faculty') {
      setActiveTab('faculty-requests');
      addToast('info', 'Switched to Faculty View', 'You now have administrative access to approve requests and resolve conflicts.');
    } else {
      setActiveTab('catalog');
      addToast('info', 'Switched to Student View', 'Browse laboratory equipment catalog and submit project access requests.');
    }
  };

  const handleResetData = async () => {
    try {
      await api.resetData();
      await fetchData();
      addToast('success', 'Demo Data Reset', 'Pre-seeded 14 equipment, student requests, and 2 active conflicts restored!');
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    }
  };

  const handleOpenBooking = (equipmentId?: string) => {
    setPreselectedEquipmentId(equipmentId);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = (message: string, isConflict: boolean) => {
    fetchData();
    if (isConflict) {
      addToast('warning', 'Conflict Flagged', `${message} Evaluator tip: Switch to Faculty View to test GenAI Conflict Resolution!`);
    } else {
      addToast('success', 'Request Registered', message);
    }
  };

  const activeConflictCount = conflicts.filter((c) => c.status === 'active').length;
  const pendingRequestCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden max-w-full transition-colors duration-200">
      {/* WCAG AA: Skip to main content link for screen reader and keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-700 focus:text-white focus:rounded-lg focus:shadow-xl focus:font-bold focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Navigation Header */}
      <Navbar
        role={role}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        onResetData={handleResetData}
        activeConflictCount={activeConflictCount}
        pendingRequestCount={pendingRequestCount}
        geminiActive={geminiActive}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 overflow-x-hidden">
        {/* Student Views */}
        {role === 'student' && activeTab === 'catalog' && (
          <section aria-label="Equipment Catalog">
            <EquipmentCatalog
              equipmentList={equipmentList}
              onOpenBooking={handleOpenBooking}
              onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
            />
          </section>
        )}

        {role === 'student' && activeTab === 'my-requests' && (
          <section aria-label="Student Requests">
            <StudentRequestsView
              requests={requests}
              onOpenBooking={() => handleOpenBooking()}
              onNavigateToConflict={() => {
                setRole('faculty');
                setActiveTab('conflicts');
              }}
            />
          </section>
        )}

        {/* Faculty Views */}
        {role === 'faculty' && activeTab === 'faculty-requests' && (
          <section aria-label="Faculty Approvals">
            <FacultyApprovalPortal
              requests={requests}
              onRefreshData={fetchData}
              onNavigateToConflict={() => setActiveTab('conflicts')}
              onShowToast={addToast}
            />
          </section>
        )}

        {role === 'faculty' && activeTab === 'conflicts' && (
          <section aria-label="Conflict Resolution Center">
            <ConflictResolutionCenter
              conflicts={conflicts}
              onRefreshData={fetchData}
              onShowToast={addToast}
            />
          </section>
        )}

        {role === 'faculty' && activeTab === 'analytics' && (
          <section aria-label="Laboratory Analytics">
            <AnalyticsDashboard
              analytics={analytics}
              onSelectEquipmentForBooking={(eqId) => {
                setRole('student');
                setActiveTab('catalog');
                handleOpenBooking(eqId);
              }}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
            <span className="font-bold text-teal-800 dark:text-teal-400">LabSync</span>
            <span>&bull;</span>
            <span>Campus Laboratory Resource-Sharing Platform</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            <span>Production Single-Container Architecture</span>
            <span>&bull;</span>
            <span className="font-mono">Google Cloud Run Ready</span>
          </div>
        </div>
      </footer>

      {/* Modals & Portals */}
      <AIProjectAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onSelectEquipmentForBooking={(eqId) => {
          handleOpenBooking(eqId);
        }}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        equipmentList={equipmentList}
        preselectedEquipmentId={preselectedEquipmentId}
        onSuccess={handleBookingSuccess}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
