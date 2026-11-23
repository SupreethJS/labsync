import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Layers,
  X,
  Cpu,
} from 'lucide-react';
import { Equipment, Department, EquipmentCategory } from '../types/index.js';
import { EquipmentCard } from './EquipmentCard.js';

interface EquipmentCatalogProps {
  equipmentList: Equipment[];
  onOpenBooking: (equipmentId: string) => void;
  onOpenAIAssistant: () => void;
}

const DEPARTMENTS: Array<'All' | Department> = [
  'All',
  'AI & ML',
  'Computer Science',
  'Electronics & ECE',
  'Mechanical',
  'Robotics',
];

const CATEGORIES = [
  'All',
  'Edge AI & Embedded',
  'High-Performance Compute',
  'Rapid Prototyping',
  'Testing & Measurement',
  'FPGA & VLSI',
  'Autonomous Systems',
  'Robotics & Automation',
  'IoT & Sensors',
  'Fabrication & CNC',
];

export const EquipmentCatalog: React.FC<EquipmentCatalogProps> = ({
  equipmentList,
  onOpenBooking,
  onOpenAIAssistant,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<'All' | Department>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Filter items using memoization for maximum rendering efficiency
  const filtered = useMemo(() => {
    return equipmentList.filter((eq) => {
      if (selectedDept !== 'All' && eq.department !== selectedDept) return false;
      if (selectedCategory !== 'All' && eq.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && eq.status !== selectedStatus) return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = eq.name.toLowerCase().includes(q);
        const matchSpecs = eq.specs.toLowerCase().includes(q);
        const matchLab = eq.labRoom.toLowerCase().includes(q);
        const matchTags = eq.tags.some((t) => t.toLowerCase().includes(q));
        return matchName || matchSpecs || matchLab || matchTags;
      }

      return true;
    });
  }, [equipmentList, selectedDept, selectedCategory, selectedStatus, search]);

  return (
    <div className="space-y-6">
      {/* Page Header (WCAG AA Strict Heading Hierarchy) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
          <Layers className="w-6 h-6 text-teal-700" />
          <span>Cross-Department Equipment Discovery & Reservation</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore specialized laboratory instruments across 5 engineering departments, check live slot availability, and reserve equipment for your research project.
        </p>
      </div>
      {/* Top AI Promotion Banner */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/5 p-5 rounded-2xl border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Not sure which equipment meets your research requirements?
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Ask our GenAI Project Assistant in plain English to recommend compatible instruments across all 5 departments.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAIAssistant}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] sm:min-h-[36px] bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>Find Equipment with AI</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative sm:col-span-2">
            <label htmlFor="catalog-search" className="sr-only">
              Search specialized laboratory equipment
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="catalog-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by equipment name, GPU, FPGA, sensor specs, room number..."
              className="w-full rounded-xl border border-slate-300 pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-teal-600 rounded p-0.5"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-2">
            <label htmlFor="catalog-category-filter" className="sr-only">
              Filter by equipment category
            </label>
            <select
              id="catalog-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">
              Department:
            </span>
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`min-h-[34px] sm:min-h-[28px] px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                  selectedDept === dept
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong>{filtered.length}</strong> of {equipmentList.length} items
          </div>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No equipment matches your search</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing department filters, or using the GenAI Project Assistant.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDept('All');
              setSelectedCategory('All');
              setSelectedStatus('All');
            }}
            className="mt-4 px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((item) => (
            <EquipmentCard key={item.id} equipment={item} onBook={onOpenBooking} />
          ))}
        </div>
      )}
    </div>
  );
};
