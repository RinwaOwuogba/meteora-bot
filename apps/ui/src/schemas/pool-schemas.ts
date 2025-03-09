import { z } from 'zod';

// Form schema for main form
export const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  timestamp: z.string().min(1, 'Timestamp is required'),
  selectedPool: z.string().optional(),
  searchTerm: z.string().optional(),
});

// Form schema for filter form
export const filterSchema = z.object({
  minLiquidity: z.number().min(0).optional(),
  maxLiquidity: z.number().optional(),
  minMarketCap: z.number().min(0).optional(),
  maxMarketCap: z.number().optional(),
  minAgeDays: z.number().min(0).optional(),
  maxAgeDays: z.number().optional(),
  minTxns24h: z.number().min(0).optional(),
  maxTxns24h: z.number().optional(),
  minVolume24h: z.number().min(0).optional(),
  maxVolume24h: z.number().optional(),
  sortBy: z
    .enum([
      'liquidity_usd',
      'market_cap',
      'pair_created_at',
      'txns_24h',
      'volume_24h',
    ])
    .default('volume_24h'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type FormValues = z.infer<typeof formSchema>;
export type FilterValues = z.infer<typeof filterSchema>;
