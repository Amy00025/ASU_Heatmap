import { mockLocations } from '@/data/mockData';
import { ApiCrowdResponse, LocationRecord } from '@/types';

export interface FetchResult {
  locations: LocationRecord[];
  isLive: boolean;
  source: 'live' | 'cache' | 'mock';
  lastSynced: string;
  message?: string;
}

export async function fetchCrowdData(): Promise<FetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch('/api/crowd-data', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`API server returned HTTP ${res.status}`);

    const result: ApiCrowdResponse = await res.json();
    
    const rawData = Array.isArray(result) ? result : result.data || mockLocations;

    const normalizedData: LocationRecord[] = rawData.map((item: any) => ({
      ...item,
      occupancyPercentage: item.occupancyPercentage ?? item.currentBusyness ?? 50,
      currentBusyness: item.currentBusyness ?? item.occupancyPercentage ?? 50,
      lat: item.lat ?? item.coordinates?.lat ?? 33.4187,
      lng: item.lng ?? item.coordinates?.lng ?? -111.9335,
      lastUpdated: item.lastUpdated ?? item.updatedAt ?? 'Just now',
      hourlyTrends: (item.hourlyTrends || []).map((t: any) => ({
        hour: t.hour,
        percentage: t.percentage ?? t.busyness ?? 0,
        busyness: t.busyness ?? t.percentage ?? 0,
      })),
    }));

    const source = (result as any).meta?.source || 'live';

    return {
      locations: normalizedData,
      isLive: true,
      source: source === 'cache' ? 'cache' : 'live',
      lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: source === 'cache' ? 'Serving from 15-min Redis Cache' : 'Live Google Scrape Feed',
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Fallback data fetch notice:', error);
    return {
      locations: mockLocations,
      isLive: false,
      source: 'mock',
      lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: 'Backend offline. Running in local Mock Mode.',
    };
  }
}

export function getCrowdBadgeColor(crowdLevel: string): { bg: string; text: string; border: string; indicator: string } {
  switch (crowdLevel) {
    case 'Low':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700 font-semibold',
        border: 'border-emerald-200',
        indicator: 'bg-emerald-500',
      };
    case 'Moderate':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700 font-semibold',
        border: 'border-purple-200',
        indicator: 'bg-purple-600',
      };
    case 'High':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800 font-semibold',
        border: 'border-amber-200',
        indicator: 'bg-amber-600',
      };
    case 'Very Busy':
    default:
      return {
        bg: 'bg-rose-50',
        text: 'text-asu-maroon font-bold',
        border: 'border-rose-200',
        indicator: 'bg-asu-maroon',
      };
  }
}
