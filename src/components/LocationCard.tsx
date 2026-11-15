'use client';

import React, { useEffect, useState } from 'react';
import { LocationRecord } from '@/types';
import { getCrowdBadgeColor } from '@/lib/api';
import {
  Clock,
  Users,
  MapPin,
  ChevronRight,
  Dumbbell,
  BookOpen,
  Utensils,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface LocationCardProps {
  location: LocationRecord;
  isSelected: boolean;
  onSelect: (id: string) => void;
  animationDelayMs?: number;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isSelected,
  onSelect,
  animationDelayMs = 0,
}) => {
  const badge = getCrowdBadgeColor(location.crowdLevel);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    setBarWidth(0);
    const preferReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (preferReduced) {
      setBarWidth(Math.min(100, location.occupancyPercentage));
      return;
    }

    const start = window.setTimeout(() => {
      setBarWidth(Math.min(100, location.occupancyPercentage));
    }, 40 + animationDelayMs);

    return () => window.clearTimeout(start);
  }, [location.occupancyPercentage, location.id, animationDelayMs]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fitness':
        return <Dumbbell className="h-3.5 w-3.5" />;
      case 'Study':
        return <BookOpen className="h-3.5 w-3.5" />;
      case 'Dining':
        return <Utensils className="h-3.5 w-3.5" />;
      case 'Union':
      default:
        return <Building2 className="h-3.5 w-3.5" />;
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
      className={`group relative cursor-pointer rounded-2xl border bg-white px-5 py-5 transition-all duration-200 dark:bg-slate-900 sm:px-6 sm:py-5 ${
        isSelected
          ? 'border-asu-maroon bg-rose-50/15 shadow-sm ring-1 ring-asu-maroon/20 dark:bg-rose-950/20'
          : 'border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md dark:border-slate-600 dark:hover:border-slate-500'
      }`}
    >
      {isSelected && (
        <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl bg-asu-maroon" />
      )}

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="flex items-center space-x-1.5 rounded-md border border-slate-200/70 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <span className="text-asu-maroon">{getCategoryIcon(location.category)}</span>
              <span>{location.category}</span>
            </span>
            <span className="font-mono text-[11px] font-medium text-slate-400">
              {location.lastUpdated}
            </span>
          </div>
          <h4 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-asu-maroon dark:text-white">
            {location.name}
          </h4>
        </div>

        <div
          className={`mt-0.5 flex shrink-0 items-center space-x-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.bg} ${badge.text} ${badge.border}`}
        >
          <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${badge.indicator}`} />
          <span>{location.crowdLevel}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Live Occupancy</span>
          <span
            className={`rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${
              location.occupancyPercentage >= 80
                ? 'border-rose-200/80 bg-rose-50 text-asu-maroon dark:border-rose-900 dark:bg-rose-950/40'
                : location.occupancyPercentage >= 50
                  ? 'border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40'
            }`}
          >
            {location.occupancyPercentage}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full border border-slate-200/80 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-1000 ease-out ${getProgressBarGradient(
              location.occupancyPercentage
            )}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-200 py-3.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <div className="flex items-center space-x-1.5">
          <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">
            Capacity:{' '}
            <strong className="font-mono font-semibold text-slate-800 dark:text-slate-100">
              {location.currentCapacity}
            </strong>{' '}
            / {location.maxCapacity}
          </span>
        </div>

        <div className="flex items-center justify-end space-x-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>
            Avg Visit:{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">
              {location.averageVisitDurationMinutes}m
            </strong>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3.5 text-[11px] font-semibold dark:border-slate-700">
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex max-w-[68%] min-w-0 items-center space-x-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-slate-600 transition-all hover:bg-slate-100 hover:text-asu-maroon dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          title={`Open Google Maps directions for ${location.name}`}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-asu-maroon" />
          <span className="truncate underline decoration-slate-300 underline-offset-2">
            {location.address}
          </span>
          <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
        </a>

        <div className="flex shrink-0 items-center space-x-1 py-1.5 text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:text-asu-maroon dark:text-slate-400">
          <span>{isSelected ? 'Selected' : 'View Trend'}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
};
