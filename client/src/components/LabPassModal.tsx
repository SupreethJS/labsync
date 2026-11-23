import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  Copy,
  Check,
  X,
  Cpu,
  QrCode,
  Share2,
} from 'lucide-react';
import { AccessRequest } from '../types/index.js';

interface LabPassModalProps {
  request: AccessRequest | null;
  onClose: () => void;
  onShowToast?: (type: 'success' | 'error' | 'warning', title: string, message?: string) => void;
}

export const LabPassModal: React.FC<LabPassModalProps> = ({ request, onClose, onShowToast }) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && request) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [request, onClose]);

  if (!request) return null;

  const passId = `LS-PASS-${request.id.slice(-8).toUpperCase()}`;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(passId);
      setCopied(true);
      if (onShowToast) {
        onShowToast('success', 'Pass ID Copied', `${passId} copied to clipboard.`);
      }
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-pass-title"
    >
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-[95vw] max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 id="lab-pass-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Digital Lab Access Pass
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official Campus Resource Authorization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close pass dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Pass Badge Body */}
        <div className="mt-4 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-950 p-4 shadow-sm relative overflow-hidden">
          {/* Subtle Watermark Logo */}
          <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
            <Cpu className="w-40 h-40" />
          </div>

          {/* Top Verification Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Verified Faculty Approval
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
              {passId}
            </span>
          </div>

          {/* Equipment & Room */}
          <div className="mt-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Authorized Equipment
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 break-words">
              {request.equipmentName}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 mt-1">
              <span className="font-semibold text-teal-800 dark:text-teal-400">{request.department}</span>
              <span>&bull;</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Reserved Lab Facility</span>
              </span>
            </div>
          </div>

          {/* Student & Project Details Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/80">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">
                Holder
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                {request.studentName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {request.studentEmail}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">
                Reserved Slot
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {request.date}
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                {request.startTime} - {request.endTime}
              </p>
            </div>
          </div>

          {/* Project Title */}
          <div className="mt-3 text-xs">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">
              Project Title
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200 italic mt-0.5 break-words">
              "{request.projectTitle}"
            </p>
          </div>

          {/* Barcode & Security Checksum Strip */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center">
            {/* Multi-Bar Vector Barcode Visual */}
            <div className="w-full flex items-center justify-center space-x-1 py-1" aria-hidden="true">
              {[2, 4, 1, 3, 5, 2, 6, 1, 3, 2, 4, 1, 5, 2, 4, 3, 1, 5, 2, 4, 2, 5, 1, 3, 4].map(
                (w, idx) => (
                  <div
                    key={idx}
                    className="h-9 bg-slate-800 dark:bg-slate-200 rounded-xs"
                    style={{ width: `${w * 1.5}px` }}
                  />
                )
              )}
            </div>
            <span className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-slate-400 mt-1">
              * {passId} *
            </span>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={handleCopyId}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] sm:min-h-[38px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Pass ID Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Pass ID</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] sm:min-h-[38px] bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
