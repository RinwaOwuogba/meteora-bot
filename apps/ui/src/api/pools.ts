import type { IndexedLiquidityPool } from '@/types';

// API endpoints for pools
const API_BASE_URL = 'http://localhost:3001';

// Types for API responses
export type DateRange = {
  startDate: string;
  endDate: string;
};

export type FetchTime = {
  id: number;
  timestamp: string;
  query_key: string;
};

export type PoolsResponse = {
  pools: IndexedLiquidityPool[];
  pagination: {
    hasMore: boolean;
    nextCursor: string;
  };
};

export type FilterValues = {
  minLiquidity?: number;
  maxLiquidity?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minAgeDays?: number;
  maxAgeDays?: number;
  minTxns24h?: number;
  maxTxns24h?: number;
  minVolume24h?: number;
  maxVolume24h?: number;
  sortBy:
    | 'liquidity_usd'
    | 'market_cap'
    | 'pair_created_at'
    | 'txns_24h'
    | 'volume_24h';
  sortOrder: 'asc' | 'desc';
};

// API functions
export const fetchDateRange = async (): Promise<DateRange> => {
  const response = await fetch(`${API_BASE_URL}/pools/date-range`);
  if (!response.ok) {
    throw new Error('Failed to fetch date range');
  }
  return response.json();
};

export const fetchTimestamps = async (date: string): Promise<FetchTime[]> => {
  if (!date) return [];
  const response = await fetch(
    `${API_BASE_URL}/pools/dates/${date}/fetch-times`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch timestamps');
  }
  return response.json();
};

export const fetchPools = async (
  fetchTime: string,
  searchTerm?: string,
  filters?: FilterValues,
): Promise<PoolsResponse> => {
  if (!fetchTime)
    return { pools: [], pagination: { hasMore: false, nextCursor: '' } };

  // Build query parameters
  const params = new URLSearchParams();
  params.append('fetch_time', fetchTime);

  // Add search term if provided
  if (searchTerm) {
    params.append('search', searchTerm);
  }

  // Add filters if provided
  if (filters) {
    if (filters.minLiquidity !== undefined)
      params.append('min_liquidity', filters.minLiquidity.toString());
    if (filters.maxLiquidity !== undefined)
      params.append('max_liquidity', filters.maxLiquidity.toString());
    if (filters.minMarketCap !== undefined)
      params.append('min_market_cap', filters.minMarketCap.toString());
    if (filters.maxMarketCap !== undefined)
      params.append('max_market_cap', filters.maxMarketCap.toString());
    if (filters.minAgeDays !== undefined)
      params.append('min_age_days', filters.minAgeDays.toString());
    if (filters.maxAgeDays !== undefined)
      params.append('max_age_days', filters.maxAgeDays.toString());
    if (filters.minTxns24h !== undefined)
      params.append('min_txns_24h', filters.minTxns24h.toString());
    if (filters.maxTxns24h !== undefined)
      params.append('max_txns_24h', filters.maxTxns24h.toString());
    if (filters.minVolume24h !== undefined)
      params.append('min_volume_24h', filters.minVolume24h.toString());
    if (filters.maxVolume24h !== undefined)
      params.append('max_volume_24h', filters.maxVolume24h.toString());
    params.append('sort_by', filters.sortBy);
    params.append('sort_order', filters.sortOrder);
  }

  const response = await fetch(`${API_BASE_URL}/pools?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pools');
  }
  return response.json();
};
