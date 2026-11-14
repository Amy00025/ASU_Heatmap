'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LocationRecord, FilterState } from '@/types';
import { fetchCrowdData, FetchResult } from '@/lib/api';
import { mockLocations } from '@/data/mockData';
import { AsuHeatMap } from '@/components/AsuHeatMap';
import { CrowdChart } from '@/components/CrowdChart';
import { FilterBar } from '@/components/FilterBar';
import { LocationCard } from '@/components/LocationCard';
import {
  Flame,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  AlertCircle,
  Database,
  Radio,
  Clock,
  Compass,
  Zap,
  ShieldCheck,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function CrowdTrackerDashboard() {
  const [locations, setLocations] = useState<LocationRecord[]>(mockLocations);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<FetchResult | null>({
    locations: mockLocations,
    isLive: true,
    source: 'live',
    lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    message: 'Live Google Scrape Stream Active',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      setIsLoading(false);
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
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans minimal-grid">
      {/* Top Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-asu-maroon via-asu-gold to-asu-maroon" />

      {/* Clean Minimalist Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-asu-maroon flex items-center justify-center border border-amber-400/40 shadow-xs shrink-0">
              <Flame className="w-5 h-5 text-asu-gold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Sun Devil <span className="text-asu-maroon">Crowd</span> Tracker
                </h1>
                <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ASU Tempe
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-x-2 text-xs text-slate-500 font-medium mt-0.5">
                <span className="text-asu-maroon font-semibold italic">
                  &ldquo;By the student, For the student.&rdquo;
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center space-x-1 text-slate-800 font-bold bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                  <span>Team Delta Y</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">Arizona State University</span>
              </div>
            </div>
          </div>

          {/* Status & Refresh Controls */}
          <div className="flex items-center space-x-2.5">
            {apiResult && (
              <div
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  apiResult.source === 'live'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : apiResult.source === 'cache'
                    ? 'bg-purple-50 text-asu-purple border-purple-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
                title={apiResult.message}
              >
                {apiResult.source === 'live' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Telemetry</span>
                  </>
                ) : apiResult.source === 'cache' ? (
                  <>
                    <Database className="w-3.5 h-3.5 text-asu-purple" />
                    <span>Cache</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            )}

            {apiResult?.lastSynced && (
              <span className="hidden sm:inline text-xs text-slate-400 font-mono">
                {apiResult.lastSynced}
              </span>
            )}

            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold transition-all shadow-2xs hover:border-slate-300"
              title="Refresh Live Crowd Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-asu-maroon ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Minimalist KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Average Campus Crowd */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Average Campus Crowd
              </p>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {stats.avgOccupancy}%
                </span>
                <span className="text-xs text-slate-400 font-medium">overall</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          {/* Peak Busyness Venue */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Peak Busyness Venue
              </p>
              <p className="mt-1 text-sm font-bold text-asu-maroon truncate max-w-[150px]">
                {stats.busiest?.shortName || 'N/A'}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {stats.busiest?.occupancyPercentage}% capacity
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-asu-maroon" />
            </div>
          </div>

          {/* Quietest Study Zone */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quietest Space
              </p>
              <p className="mt-1 text-sm font-bold text-emerald-700 truncate max-w-[150px]">
                {stats.quietest?.shortName || 'N/A'}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {stats.quietest?.occupancyPercentage}% occupancy
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Active Visitors */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Estimated Visitors
              </p>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {stats.totalPeople.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-medium">people</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/70 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-asu-purple" />
            </div>
          </div>
        </div>

        {/* Minimalist Filter Bar */}
        <FilterBar
          filterState={filterState}
          onFilterChange={handleFilterChange}
          totalResults={filteredLocations.length}
          totalLocations={locations.length}
        />

        {/* Main Section: Interactive Map + Analytics Chart on Left, Sidebar Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Map & Analytics Chart (8 Cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Interactive Heatmap Container */}
            <div className="w-full h-[480px]">
              <AsuHeatMap
                locations={filteredLocations}
                selectedLocationId={selectedLocationId}
                onSelectLocation={(id) => setSelectedLocationId(id)}
              />
            </div>

            {/* Analytics Bar & Area Chart */}
            <CrowdChart
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onClearSelection={() => setSelectedLocationId(null)}
            />
          </div>

          {/* Right Column: Venue Status Cards Sidebar (4 Cols) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-asu-maroon" />
                <span>Tracked Venues ({filteredLocations.length})</span>
              </h3>
              {selectedLocationId && (
                <button
                  onClick={() => setSelectedLocationId(null)}
                  className="text-xs text-asu-maroon hover:underline font-semibold"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Cards Scrollable List */}
            <div className="space-y-3 max-h-[840px] overflow-y-auto pr-0.5">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <LocationCard
                    key={loc.id}
                    location={loc}
                    isSelected={loc.id === selectedLocationId}
                    onSelect={(id) => setSelectedLocationId(id)}
                  />
                ))
              ) : (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-500 shadow-xs">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No matching venues found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your search query or category filter.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CountMatters-Inspired Campus Zone Flow & Dwell Intelligence */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-asu-maroon shrink-0">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Campus Flow & Dwell Intelligence</span>
                  <span className="text-[10px] font-semibold text-asu-maroon bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
                    Volume vs. Dwell Paradigm
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time dwell dynamics, traffic turnover velocity, and optimal student visit windows
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Anonymized Telemetry</span>
            </div>
          </div>

          {/* 3 Intelligence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SDFC Fitness Card */}
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">SDFC Fitness Complex</span>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  ~65m Dwell
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cyclic workout traffic with heavy evening peaks (4 PM – 7 PM). Morning shifts (6 AM – 10:30 AM) offer up to 45% lower congestion for lifting racks.
              </p>
              <div className="pt-1 flex items-center text-[11px] font-semibold text-asu-maroon">
                <Zap className="w-3.5 h-3.5 mr-1 text-asu-gold shrink-0" />
                <span>Prime Window: 6:00 AM – 10:30 AM</span>
              </div>
            </div>

            {/* Hayden Library Card */}
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Hayden Library Study</span>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                  ~120m Dwell
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deep study zone characterized by long dwell sessions and low turnover. Floor 2 and Concourse pods maintain consistent quietness during mid-day blocks.
              </p>
              <div className="pt-1 flex items-center text-[11px] font-semibold text-asu-maroon">
                <Clock className="w-3.5 h-3.5 mr-1 text-purple-600 shrink-0" />
                <span>Quietest Floors: Level 2 & 3 Pods</span>
              </div>
            </div>

            {/* Memorial Union & Dining Card */}
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Memorial Union & Dining</span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  ~30m Dwell
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rapid velocity grab-and-go hub. Peak lines hit between 12:15 PM and 1:30 PM. Tooker & Barrett Dining offer fastest seat turnover outside rush peak.
              </p>
              <div className="pt-1 flex items-center text-[11px] font-semibold text-asu-maroon">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
                <span>Fastest Flow: Before 11:45 AM or after 2 PM</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="mt-12 border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-asu-maroon">ASU Sun Devil Crowd Tracker</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Arizona State University · Tempe Campus</span>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <span className="italic text-asu-maroon font-semibold">&ldquo;By the student, For the student.&rdquo;</span>
            <span className="text-slate-300">•</span>
            <span>Team <strong className="text-slate-800 font-bold">Delta Y</strong></span>
            <span className="text-slate-300">•</span>
            <span>Arizona State University</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
