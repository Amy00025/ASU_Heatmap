'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  AreaChart,
  Area,
  LabelList,
} from 'recharts';
import { LocationRecord } from '@/types';
import { BarChart3, TrendingUp, Clock, X } from 'lucide-react';

interface CrowdChartProps {
  locations: LocationRecord[];
  selectedLocation: LocationRecord | null;
  onClearSelection: () => void;
}

export const CrowdChart: React.FC<CrowdChartProps> = ({
  locations,
  selectedLocation,
  onClearSelection,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  // Custom Light Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      const val = dataPoint.value;
      const statusLabel =
        val >= 80 ? 'Peak' : val >= 60 ? 'High' : val >= 40 ? 'Moderate' : 'Low';
      const statusColor =
        val >= 80
          ? 'text-asu-maroon bg-rose-50 border-rose-200'
          : val >= 60
          ? 'text-asu-purple bg-purple-50 border-purple-200'
          : val >= 40
          ? 'text-amber-800 bg-amber-50 border-amber-300'
          : 'text-emerald-700 bg-emerald-50 border-emerald-200';

      return (
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xl text-xs font-sans min-w-[170px]">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="font-extrabold text-slate-900 text-sm truncate">{label}</p>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Live Occupancy:</span>
            <span className="font-extrabold font-mono text-slate-900 text-sm">{val}%</span>
          </div>
          {dataPoint.payload.maxCapacity && (
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Estimated ~{Math.round((val / 100) * dataPoint.payload.maxCapacity)} people
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Gradient ID selector based on occupancy tier
  const getBarFill = (occupancy: number) => {
    if (occupancy >= 80) return 'url(#barGradMaroon)'; // ASU Maroon (Peak)
    if (occupancy >= 60) return 'url(#barGradPurple)'; // Royal Purple (High)
    if (occupancy >= 40) return 'url(#barGradGold)';   // Sun Devil Gold / Amber (Moderate)
    return 'url(#barGradGreen)';                       // Emerald (Low)
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-asu-maroon shrink-0">
            {selectedLocation ? (
              <TrendingUp className="w-4.5 h-4.5" />
            ) : (
              <BarChart3 className="w-4.5 h-4.5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {selectedLocation
                ? `${selectedLocation.shortName} Hourly Curve`
                : 'Campus Occupancy Distribution'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {selectedLocation
                ? 'Hourly projected busyness (8 AM – 10 PM)'
                : 'Real-time crowd traffic across ASU Tempe campus'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {selectedLocation ? (
            <button
              onClick={onClearSelection}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          ) : (
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  chartType === 'bar'
                    ? 'bg-asu-maroon text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  chartType === 'area'
                    ? 'bg-asu-maroon text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Area
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[260px] relative">
        {selectedLocation ? (
          /* Single Location Hourly Trend Curve */
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={selectedLocation.hourlyTrends}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="purpleMaroonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8C1D40" stopOpacity={0.7} />
                  <stop offset="50%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F5F3FF" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="hour"
                stroke="#94A3B8"
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                stroke="#94A3B8"
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                domain={[0, 100]}
                unit="%"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#8C1D40"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#purpleMaroonGrad)"
                activeDot={{ r: 6, fill: '#7C3AED', stroke: '#8C1D40', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : chartType === 'bar' ? (
          /* Live Comparison Bar Chart */
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={locations}
              margin={{ top: 22, right: 10, left: -20, bottom: 0 }}
            >
              {/* Distinct Tiered Gradient Definitions */}
              <defs>
                <linearGradient id="barGradMaroon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8C1D40" />
                  <stop offset="100%" stopColor="#BE123C" />
                </linearGradient>
                <linearGradient id="barGradPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B21A8" />
                  <stop offset="100%" stopColor="#9333EA" />
                </linearGradient>
                <linearGradient id="barGradGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#FFC627" />
                </linearGradient>
                <linearGradient id="barGradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="shortName"
                stroke="#94A3B8"
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                stroke="#94A3B8"
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                domain={[0, 100]}
                unit="%"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="occupancyPercentage" radius={[10, 10, 0, 0]} maxBarSize={68}>
                <LabelList
                  dataKey="occupancyPercentage"
                  position="top"
                  formatter={(val: any) => `${val}%`}
                  style={{ fill: '#334155', fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }}
                  offset={6}
                />
                {locations.map((loc) => (
                  <Cell
                    key={loc.id}
                    fill={getBarFill(loc.occupancyPercentage)}
                    className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          /* Live Comparison Area Chart */
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={locations}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B21A8" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#8C1D40" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="shortName"
                stroke="#94A3B8"
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                stroke="#94A3B8"
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                domain={[0, 100]}
                unit="%"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="occupancyPercentage"
                stroke="#6B21A8"
                strokeWidth={2.5}
                fill="url(#purpleAreaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Differentiated Color Legend & Live Status */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center flex-wrap gap-2">
          <span className="flex items-center space-x-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>&lt;40% Low</span>
          </span>
          <span className="flex items-center space-x-1.5 font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>40-60% Moderate</span>
          </span>
          <span className="flex items-center space-x-1.5 font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>60-80% High</span>
          </span>
          <span className="flex items-center space-x-1.5 font-semibold text-asu-maroon bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-asu-maroon" />
            <span>&gt;80% Peak</span>
          </span>
        </div>

        {selectedLocation && (
          <div className="flex items-center space-x-1.5 text-asu-maroon font-semibold text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{selectedLocation.popularTimesSummary}</span>
          </div>
        )}
      </div>
    </div>
  );
};
