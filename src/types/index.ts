export type LocationCategory = 'All' | 'Fitness' | 'Study' | 'Dining' | 'Union';

export type CrowdLevel = 'Low' | 'Moderate' | 'High' | 'Very Busy';

export interface HourlyTrend {
  hour: string; // e.g. "8 AM", "9 AM", "10:00"
  percentage?: number; // 0 - 100
  busyness?: number;   // 0 - 100
  label?: string;
}

export interface LocationRecord {
  id: string;
  name: string;
  shortName: string;
  category: Exclude<LocationCategory, 'All'>;
  occupancyPercentage: number;
  currentBusyness?: number;
  crowdLevel: CrowdLevel;
  currentCapacity: number;
  maxCapacity: number;
  averageVisitDurationMinutes: number;
  avgTimeSpent?: string;
  lastUpdated: string;
  updatedAt?: string;
  lat: number;
  lng: number;
  coordinates?: { lat: number; lng: number };
  heatWeight: number; // Normalized weight 0 - 100 for heatmaps
  hourlyTrends: HourlyTrend[];
  description: string;
  address: string;
  popularTimesSummary: string;
}

export interface ApiCrowdResponse {
  status: 'success' | 'mock' | 'error';
  meta?: {
    source: 'live' | 'cache' | 'mock';
    totalLocations?: number;
  };
  isMockMode?: boolean;
  data: LocationRecord[];
  lastSynced?: string;
  message?: string;
}

export interface FilterState {
  category: LocationCategory;
  searchQuery: string;
  sortBy: 'occupancy-desc' | 'occupancy-asc' | 'name';
}
