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

interface EquipmentCardProps {
  equipment: Equipment;
  onBook: (equipmentId: string) => void;
}

const DEPT_BADGE_COLORS: Record<string, string> = {
  'AI & ML': 'bg-teal-100 text-teal-800 border-teal-200',
  'Computer Science': 'bg-blue-100 text-blue-800 border-blue-200',
  'Electronics & ECE': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Mechanical': 'bg-amber-100 text-amber-800 border-amber-200',
  'Robotics': 'bg-rose-100 text-rose-800 border-rose-200',
};

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onBook }) => {
  const [showSlots, setShowSlots] = useState(false);

  let statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (equipment.status === 'In Use') statusBadge = 'bg-amber-100 text-amber-900 border-amber-300';
  if (equipment.status === 'Maintenance') statusBadge = 'bg-rose-100 text-rose-900 border-rose-300';

  const deptStyle = DEPT_BADGE_COLORS[equipment.department] || 'bg-slate-100 text-slate-800';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${deptStyle}`}>
              {equipment.department}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
              {equipment.category}
            </span>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge}`}>
            {equipment.status}
          </span>
        </div>

        {/* Title & Location */}
        <h3 className="text-base font-extrabold text-slate-900 mt-2.5 group-hover:text-teal-700 transition-colors leading-snug">
          {equipment.name}
        </h3>

        <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{equipment.labRoom}</span>
        </div>

        {/* Technical Specs */}
        <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
          {equipment.specs}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {equipment.tags.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-mono"
            >
              #{tag}
            </span>
          ))}
          {equipment.tags.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
              +{equipment.tags.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Booked Slots Toggle & Action Button */}
      <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          {/* Slot status toggle */}
          {equipment.slots.length > 0 ? (
            <button
              onClick={() => setShowSlots(!showSlots)}
              className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center space-x-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{equipment.slots.length} Booked Slot{equipment.slots.length > 1 ? 's' : ''}</span>
              {showSlots ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="text-xs font-medium text-emerald-700 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Available for reservation</span>
            </span>
          )}

          <button
            onClick={() => onBook(equipment.id)}
            disabled={equipment.status === 'Maintenance'}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Request Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Collapsible Slots View */}
        {showSlots && equipment.slots.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Active Bookings:
            </span>
            {equipment.slots.map((slot) => (
              <div
                key={slot.id}
                className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-[11px]"
              >
                <div>
                  <span className="font-bold text-slate-800">{slot.studentName}</span>{' '}
                  <span className="text-slate-500">({slot.department})</span>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{slot.projectTitle}</p>
                </div>
                <div className="text-right font-medium text-teal-800 whitespace-nowrap">
                  <div>{slot.date}</div>
                  <div className="text-[10px] text-slate-500">{slot.startTime} - {slot.endTime}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
