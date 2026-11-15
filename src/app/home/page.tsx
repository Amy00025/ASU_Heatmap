'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LocationRecord, FilterState } from '@/types';
import { fetchCrowdData, FetchResult } from '@/lib/api';
import { mockLocations } from '@/data/mockData';
import { AsuHeatMap } from '@/components/AsuHeatMap';
import { CrowdChart } from '@/components/CrowdChart';
import { FilterBar } from '@/components/FilterBar';
import { LocationCard } from '@/components/LocationCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import {
  Flame,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  AlertCircle,
  Database,
  Clock,
  Zap,
  ShieldCheck,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const [locations, setLocations] = useState<LocationRecord[]>(mockLocations);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<FetchResult | null>({
    locations: mockLocations,
    isLive: true,
    source: 'live',
    lastSynced: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    message: 'Live Google Scrape Stream Active',
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [filterState, setFilterState] = useState<FilterState>({
    category: 'All',
    searchQuery: '',
    sortBy: 'occupancy-desc',
  });

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);

    try {
      const res = await fetchCrowdData();
      if (res.locations && res.locations.length > 0) {
        setLocations(res.locations);
      }
      setApiResult(res);
    } catch (err) {
      console.error('Failed to load crowd data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 12000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleFilterChange = (newState: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...newState }));
  };

  const filteredLocations = useMemo(() => {
    return locations
      .filter((loc) => {
        const matchesCategory =
          filterState.category === 'All' || loc.category === filterState.category;
        const matchesSearch =
          loc.name.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
          loc.shortName.toLowerCase().includes(filterState.searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (filterState.sortBy === 'occupancy-desc') {
          return b.occupancyPercentage - a.occupancyPercentage;
        } else if (filterState.sortBy === 'occupancy-asc') {
          return a.occupancyPercentage - b.occupancyPercentage;
        } else {
          return a.name.localeCompare(b.name);
        }
      });
  }, [locations, filterState]);

  const selectedLocation = useMemo(() => {
    return locations.find((l) => l.id === selectedLocationId) || null;
  }, [locations, selectedLocationId]);

  const stats = useMemo(() => {
    if (!locations.length) {
      return { avgOccupancy: 0, busiest: null, quietest: null, totalPeople: 0 };
    }
    const totalAcc = locations.reduce((sum, loc) => sum + loc.occupancyPercentage, 0);
    const avg = Math.round(totalAcc / locations.length);

    const sortedByOcc = [...locations].sort(
      (a, b) => b.occupancyPercentage - a.occupancyPercentage
    );
    const totalPeople = locations.reduce((sum, loc) => sum + loc.currentCapacity, 0);

    return {
      avgOccupancy: avg,
      busiest: sortedByOcc[0],
      quietest: sortedByOcc[sortedByOcc.length - 1],
      totalPeople,
    };
  }, [locations]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70 font-sans text-slate-900 minimal-grid dark:bg-slate-950 dark:text-slate-100">
      <div className="h-1 w-full bg-gradient-to-r from-asu-maroon via-asu-gold to-asu-maroon" />

      <header className="sticky top-0 z-[500] border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-asu-maroon shadow-xs">
              <Flame className="h-5 w-5 text-asu-gold" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Sun Devil <span className="text-asu-maroon dark:text-rose-400">Crowd</span>{' '}
                  Tracker
                </h1>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">
                  ASU Tempe
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="font-semibold italic text-asu-maroon dark:text-rose-300">
                  &ldquo;By the student, For the student.&rdquo;
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="inline-flex items-center space-x-1 rounded-md border border-slate-200/80 bg-slate-100 px-2 py-0.5 font-bold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  <span>Team Delta Y</span>
                </span>
                <span className="hidden text-slate-300 sm:inline dark:text-slate-600">•</span>
                <span className="hidden font-medium text-slate-600 sm:inline dark:text-slate-400">
                  Arizona State University
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {apiResult && (
              <div
                className={`flex items-center space-x-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  apiResult.source === 'live'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : apiResult.source === 'cache'
                      ? 'border-purple-200 bg-purple-50 text-asu-purple dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                      : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                }`}
                title={apiResult.message}
              >
                {apiResult.source === 'live' ? (
                  <>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    <span>Live Telemetry</span>
                  </>
                ) : apiResult.source === 'cache' ? (
                  <>
                    <Database className="h-3.5 w-3.5 text-asu-purple" />
                    <span>Cache</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            )}

            <ThemeToggle />

            {apiResult?.lastSynced && (
              <span className="hidden font-mono text-xs text-slate-400 sm:inline dark:text-slate-500">
                {apiResult.lastSynced}
              </span>
            )}

            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Refresh Live Crowd Data"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-asu-maroon ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Average Campus Crowd
              </p>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats.avgOccupancy}%
                </span>
                <span className="text-xs font-medium text-slate-400">overall</span>
              </div>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200/70 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Peak Busyness Venue
              </p>
              <p className="mt-1 max-w-[150px] truncate text-sm font-bold text-asu-maroon dark:text-rose-400">
                {stats.busiest?.shortName || 'N/A'}
              </p>
              <p className="font-mono text-xs text-slate-400">
                {stats.busiest?.occupancyPercentage}% capacity
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200/70 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40">
              <Flame className="h-5 w-5 text-asu-maroon" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quietest Space
              </p>
              <p className="mt-1 max-w-[150px] truncate text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {stats.quietest?.shortName || 'N/A'}
              </p>
              <p className="font-mono text-xs text-slate-400">
                {stats.quietest?.occupancyPercentage}% occupancy
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200/70 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Estimated Visitors
              </p>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats.totalPeople.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-400">people</span>
              </div>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-200/70 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/40">
              <Users className="h-5 w-5 text-asu-purple" />
            </div>
          </div>
        </div>

        <FilterBar
          filterState={filterState}
          onFilterChange={handleFilterChange}
          totalResults={filteredLocations.length}
          totalLocations={locations.length}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <div className="h-[480px] w-full">
              <AsuHeatMap
                locations={filteredLocations}
                selectedLocationId={selectedLocationId}
                onSelectLocation={(id) => setSelectedLocationId(id)}
              />
            </div>

            <CrowdChart
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onClearSelection={() => setSelectedLocationId(null)}
            />
          </div>

          <div className="space-y-3.5 lg:col-span-5 xl:col-span-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Building2 className="h-4 w-4 text-asu-maroon" />
                <span>Tracked Venues ({filteredLocations.length})</span>
              </h3>
              {selectedLocationId && (
                <button
                  onClick={() => setSelectedLocationId(null)}
                  className="text-xs font-semibold text-asu-maroon hover:underline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="max-h-[840px] space-y-3 overflow-y-auto pr-0.5">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc, index) => (
                  <LocationCard
                    key={loc.id}
                    location={loc}
                    isSelected={loc.id === selectedLocationId}
                    onSelect={(id) => setSelectedLocationId(id)}
                    animationDelayMs={index * 80}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-xs dark:border-slate-700 dark:bg-slate-900">
                  <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No matching venues found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Try adjusting your search query or category filter.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="space-y-5 rounded-2xl border border-slate-300/90 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-asu-maroon dark:border-rose-900 dark:bg-rose-950/40">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  <span>Campus Flow & Dwell Intelligence</span>
                  <span className="rounded-full border border-rose-200/60 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-asu-maroon dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                    Volume vs. Dwell Paradigm
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time dwell dynamics, traffic turnover velocity, and optimal student visit
                  windows
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>100% Anonymized Telemetry</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2.5 rounded-xl border border-slate-300/80 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  SDFC Fitness Complex
                </span>
                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  ~65m Dwell
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Cyclic workout traffic with heavy evening peaks (4 PM – 7 PM). Morning shifts (6 AM
                – 10:30 AM) offer up to 45% lower congestion for lifting racks.
              </p>
              <div className="flex items-center pt-1 text-[11px] font-semibold text-asu-maroon dark:text-rose-300">
                <Zap className="mr-1 h-3.5 w-3.5 shrink-0 text-asu-gold" />
                <span>Prime Window: 6:00 AM – 10:30 AM</span>
              </div>
            </div>

            <div className="space-y-2.5 rounded-xl border border-slate-300/80 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Hayden Library Study
                </span>
                <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                  ~120m Dwell
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Deep study zone characterized by long dwell sessions and low turnover. Floor 2 and
                Concourse pods maintain consistent quietness during mid-day blocks.
              </p>
              <div className="flex items-center pt-1 text-[11px] font-semibold text-asu-maroon dark:text-rose-300">
                <Clock className="mr-1 h-3.5 w-3.5 shrink-0 text-purple-600" />
                <span>Quietest Floors: Level 2 & 3 Pods</span>
              </div>
            </div>

            <div className="space-y-2.5 rounded-xl border border-slate-300/80 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Memorial Union & Dining
                </span>
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  ~30m Dwell
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Rapid velocity grab-and-go hub. Peak lines hit between 12:15 PM and 1:30 PM. Tooker
                & Barrett Dining offer fastest seat turnover outside rush peak.
              </p>
              <div className="flex items-center pt-1 text-[11px] font-semibold text-asu-maroon dark:text-rose-300">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>Fastest Flow: Before 11:45 AM or after 2 PM</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-slate-200/80 bg-white py-6 text-center text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center space-x-2">
            <span className="font-bold text-asu-maroon">ASU Sun Devil Crowd Tracker</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-600 dark:text-slate-400">
              Arizona State University · Tempe Campus
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-semibold italic text-asu-maroon">
              &ldquo;By the student, For the student.&rdquo;
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>
              Team <strong className="font-bold text-slate-800 dark:text-slate-200">Delta Y</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
