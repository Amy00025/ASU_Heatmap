'use client';

import React from 'react';
import { LocationCategory, FilterState } from '@/types';
import { Search, Dumbbell, BookOpen, Utensils, Building2, Layers, ArrowUpDown, X } from 'lucide-react';

interface FilterBarProps {
  filterState: FilterState;
  onFilterChange: (newState: Partial<FilterState>) => void;
  totalResults: number;
  totalLocations: number;
}

const CATEGORIES: { id: LocationCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'All', label: 'All Venues', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'Fitness', label: 'Fitness', icon: <Dumbbell className="w-3.5 h-3.5" /> },
  { id: 'Study', label: 'Study', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'Dining', label: 'Dining', icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: 'Union', label: 'Union', icon: <Building2 className="w-3.5 h-3.5" /> },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filterState,
  onFilterChange,
  totalResults,
  totalLocations,
}) => {
  const isFiltered = filterState.category !== 'All' || filterState.searchQuery !== '';

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
        {CATEGORIES.map((cat) => {
          const isActive = filterState.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.id })}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 border ${
                isActive
                  ? 'bg-asu-maroon text-white border-asu-maroon shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className={isActive ? 'text-asu-gold' : 'text-slate-400'}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls: Search Input & Sort Dropdown */}
      <div className="flex items-center space-x-2.5">
        {/* Search Input */}
        <div className="relative flex-1 md:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search venue name..."
            value={filterState.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs font-medium rounded-xl pl-9 pr-8 py-2 border border-slate-200/80 focus:outline-none focus:border-asu-maroon focus:ring-2 focus:ring-rose-900/10 transition-all"
          />
          {filterState.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="relative shrink-0">
          <select
            value={filterState.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="bg-slate-50 text-slate-700 text-xs rounded-xl pl-3 pr-7 py-2 border border-slate-200/80 focus:outline-none focus:border-asu-maroon appearance-none cursor-pointer font-semibold"
          >
            <option value="occupancy-desc">Busiest First</option>
            <option value="occupancy-asc">Quietness First</option>
            <option value="name">Name (A–Z)</option>
          </select>
          <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            onClick={() => onFilterChange({ category: 'All', searchQuery: '' })}
            className="text-xs text-asu-maroon hover:underline font-semibold whitespace-nowrap px-1"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
