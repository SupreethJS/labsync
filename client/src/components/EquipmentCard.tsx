import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { Equipment } from '../types/index.js';
import { EquipmentIllustration } from './EquipmentIllustration.js';

interface EquipmentCardProps {
  equipment: Equipment;
  onBook: (equipmentId: string) => void;
}

const DEPT_BADGE_COLORS: Record<string, string> = {
  'AI & ML': 'bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  'Computer Science': 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'Electronics & ECE': 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  'Mechanical': 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'Robotics': 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onBook }) => {
  const [showSlots, setShowSlots] = useState(false);

  let statusBadge = 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
  if (equipment.status === 'In Use') statusBadge = 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800';
  if (equipment.status === 'Maintenance') statusBadge = 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800';

  const deptStyle = DEPT_BADGE_COLORS[equipment.department] || 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200';

  // Calculate daily schedule slot status (9 AM - 6 PM, 9 1-hour slots)
  const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const slotStatus = HOURS.map((hour) => {
    const isMaintenance = equipment.status === 'Maintenance';
    if (isMaintenance) {
      return { hour, status: 'maintenance', label: `${hour}:00 - ${hour + 1}:00 (Offline Maintenance)` };
    }
    const matchingBooking = equipment.slots.find((s) => {
      const start = parseInt(s.startTime.split(':')[0], 10);
      const end = parseInt(s.endTime.split(':')[0], 10);
      return hour >= start && hour < end;
    });
    if (matchingBooking) {
      return {
        hour,
        status: 'booked',
        label: `${hour}:00 - ${hour + 1}:00: Reserved by ${matchingBooking.studentName} (${matchingBooking.department})`,
      };
    }
    return {
      hour,
      status: 'open',
      label: `${hour}:00 - ${hour + 1}:00: Open for reservation`,
    };
  });

  const openHoursCount = slotStatus.filter((s) => s.status === 'open').length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden group">
      {/* Sleek Top Hardware Illustration Banner */}
      <EquipmentIllustration
        category={equipment.category}
        department={equipment.department}
      />

      <div className="p-4 sm:p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${deptStyle}`}>
              {equipment.department}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              {equipment.category}
            </span>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge}`}>
            {equipment.status}
          </span>
        </div>

        {/* Title & Location */}
        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-2.5 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug break-words">
          {equipment.name}
        </h3>

        <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{equipment.labRoom}</span>
        </div>

        {/* Technical Specs */}
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 leading-relaxed break-words">
          {equipment.specs}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {equipment.tags.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono"
            >
              #{tag}
            </span>
          ))}
          {equipment.tags.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 text-slate-400 dark:text-slate-500">
              +{equipment.tags.length - 4} more
            </span>
          )}
        </div>

        {/* Visual Daily Availability Strip (9 AM - 6 PM) */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Today's Availability</span>
            </span>
            <span
              className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                equipment.status === 'Maintenance'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  : openHoursCount > 0
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}
            >
              {equipment.status === 'Maintenance'
                ? 'Offline'
                : `${openHoursCount} of 9h Open`}
            </span>
          </div>

          {/* Accessible 9 AM - 6 PM Bar */}
          <div
            className="grid grid-cols-9 gap-1 h-3 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5"
            role="img"
            aria-label={`Daily schedule from 9 AM to 6 PM: ${openHoursCount} of 9 hours open today`}
          >
            {slotStatus.map((slot) => (
              <div
                key={slot.hour}
                title={slot.label}
                className={`h-full rounded-xs transition-colors cursor-help ${
                  slot.status === 'open'
                    ? 'bg-emerald-500 dark:bg-emerald-400 hover:bg-emerald-600'
                    : slot.status === 'maintenance'
                    ? 'bg-rose-400 dark:bg-rose-600'
                    : 'bg-amber-400 dark:bg-amber-500 hover:bg-amber-600'
                }`}
              />
            ))}
          </div>

          {/* Time markers & Legend */}
          <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
            <span>9 AM</span>
            <div className="flex items-center space-x-2 font-sans text-[10px]">
              <span className="flex items-center space-x-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Open</span>
              </span>
              <span className="flex items-center space-x-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Booked</span>
              </span>
            </div>
            <span>6 PM</span>
          </div>
        </div>
      </div>

      {/* Booked Slots Toggle & Action Button */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Slot status toggle */}
          {equipment.slots.length > 0 ? (
            <button
              onClick={() => setShowSlots(!showSlots)}
              className="text-xs font-semibold text-teal-800 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 flex items-center space-x-1 min-h-[36px]"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{equipment.slots.length} Booked Slot{equipment.slots.length > 1 ? 's' : ''}</span>
              {showSlots ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 min-h-[36px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Available for reservation</span>
            </span>
          )}

          <button
            onClick={() => onBook(equipment.id)}
            disabled={equipment.status === 'Maintenance'}
            className="w-full sm:w-auto px-4 py-2 min-h-[44px] sm:min-h-[36px] bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Request Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Collapsible Slots View */}
        {showSlots && equipment.slots.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Current Active Bookings:
            </span>
            {equipment.slots.map((slot) => (
              <div
                key={slot.id}
                className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px]"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{slot.studentName}</span>{' '}
                    <span className="text-slate-500 dark:text-slate-400">({slot.department})</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{slot.projectTitle}</p>
                </div>
                <div className="text-right font-medium text-teal-800 dark:text-teal-400 whitespace-nowrap shrink-0">
                  <div>{slot.date}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{slot.startTime} - {slot.endTime}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
