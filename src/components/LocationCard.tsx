'use client';

import React from 'react';
import { LocationRecord } from '@/types';
import { getCrowdBadgeColor } from '@/lib/api';
import { Clock, Users, MapPin, ChevronRight, Dumbbell, BookOpen, Utensils, Building2, ExternalLink } from 'lucide-react';

interface LocationCardProps {
  location: LocationRecord;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isSelected,
  onSelect,
}) => {
  const badge = getCrowdBadgeColor(location.crowdLevel);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fitness':
        return <Dumbbell className="w-3.5 h-3.5" />;
      case 'Study':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Dining':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'Union':
      default:
        return <Building2 className="w-3.5 h-3.5" />;
    }
  };

  const getProgressBarGradient = (percentage: number) => {
    if (percentage >= 80) return 'from-asu-gold via-purple-600 to-asu-maroon';
    if (percentage >= 60) return 'from-asu-gold via-purple-500 to-purple-700';
    if (percentage >= 40) return 'from-amber-400 via-asu-gold to-purple-500';
    return 'from-emerald-400 to-teal-500';
  };

  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${location.name}, ${location.address}`
  )}`;

  return (
    <div
      onClick={() => onSelect(location.id)}
      className={`group relative bg-white border rounded-2xl p-4.5 pb-4.5 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-asu-maroon ring-1 ring-asu-maroon/20 bg-rose-50/15 shadow-sm'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs shadow-none'
      }`}
    >
      {/* Selection Left Accent Bar */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-asu-maroon rounded-l-2xl" />
      )}

      {/* Header Row: Title & Badge */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70">
              <span className="text-asu-maroon">{getCategoryIcon(location.category)}</span>
              <span>{location.category}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono font-medium">{location.lastUpdated}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-asu-maroon transition-colors line-clamp-1">
            {location.name}
          </h4>
        </div>

        {/* Crowd Badge */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${badge.indicator} animate-pulse`} />
          <span>{location.crowdLevel}</span>
        </div>
      </div>

      {/* Occupancy Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-slate-500">Live Occupancy</span>
          <span
            className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md border ${
              location.occupancyPercentage >= 80
                ? 'text-asu-maroon bg-rose-50 border-rose-200/80'
                : location.occupancyPercentage >= 50
                ? 'text-slate-800 bg-slate-100 border-slate-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}
          >
            {location.occupancyPercentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${getProgressBarGradient(
              location.occupancyPercentage
            )}`}
            style={{ width: `${Math.min(100, location.occupancyPercentage)}%` }}
          />
        </div>
      </div>

      {/* Details Footer Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 text-xs text-slate-600 font-medium">
        <div className="flex items-center space-x-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            Capacity: <strong className="text-slate-800 font-mono font-semibold">{location.currentCapacity}</strong> / {location.maxCapacity}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 justify-end">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Avg Visit: <strong className="text-slate-800 font-semibold">{location.averageVisitDurationMinutes}m</strong>
          </span>
        </div>
      </div>

      {/* Clickable Google Maps Directions Link & Card CTA */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] font-semibold">
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center space-x-1.5 py-1 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 hover:text-asu-maroon transition-all max-w-[68%] min-w-0"
          title={`Open Google Maps directions for ${location.name}`}
        >
          <MapPin className="w-3.5 h-3.5 text-asu-maroon shrink-0" />
          <span className="truncate underline decoration-slate-300 underline-offset-2">{location.address}</span>
          <ExternalLink className="w-3 h-3 text-slate-400 hover:text-asu-maroon shrink-0" />
        </a>

        <div className="flex items-center space-x-1 text-slate-500 group-hover:text-asu-maroon group-hover:translate-x-0.5 transition-all shrink-0 py-1">
          <span>{isSelected ? 'Selected' : 'View Trend'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
