import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from 'kysely';

export interface Database {
  users: UsersTable;
  wallets: WalletsTable;
  positions: PositionsTable;
  fees: FeesTable;
  position_logs: PositionLogsTable;
  metrics: MetricsTable;
  pools: PoolsTable;
  fetch_times: FetchTimeTable;
}

// Users Table
export interface UsersTable {
  id: Generated<number>;
  telegram_id: string | null;
  telegram_username: string | null;
  is_admin: number;

  meta_data: JSONColumnType<{
    login_at?: string;
    ip?: string | null;
    agent?: string | null;
    preferences?: Record<string, any>;
  }>;

  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

// Wallets Table
export interface WalletsTable {
  id: Generated<number>;
  user_id: number;
  telegram_id: string;
  wallet_address: string;

  meta_data: JSONColumnType<{
    label?: string;
    connected_at?: string;
  }>;

  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type Wallet = Selectable<WalletsTable>;
export type NewWallet = Insertable<WalletsTable>;
export type WalletUpdate = Updateable<WalletsTable>;

// Positions Table
export interface PositionsTable {
  id: Generated<number>;
  user_id: number;
  wallet_id: number;

  meta_data: JSONColumnType<{
    trade_details?: Record<string, any>;
    risk_level?: 'low' | 'medium' | 'high';
  }>;

  status: 'open' | 'closed';

  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type Position = Selectable<PositionsTable>;
export type NewPosition = Insertable<PositionsTable>;
export type PositionUpdate = Updateable<PositionsTable>;

// Fees Table
export interface FeesTable {
  id: Generated<number>;
  user_id: number;
  wallet_id: number;
  position_id: number;

  meta_data: JSONColumnType<{
    amount: number;
    currency: string;
    settled_at?: string;
  }>;

  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type Fee = Selectable<FeesTable>;
export type NewFee = Insertable<FeesTable>;
export type FeeUpdate = Updateable<FeesTable>;

// Position Logs Table
export interface PositionLogsTable {
  id: Generated<number>;
  user_id: number;
  wallet_id: number;
  position_id: number;

  action: 'create' | 'update' | 'delete';

  meta_data: JSONColumnType<{
    changes?: Record<string, any>;
    performed_by?: string;
  }>;

  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type PositionLog = Selectable<PositionLogsTable>;
export type NewPositionLog = Insertable<PositionLogsTable>;
export type PositionLogUpdate = Updateable<PositionLogsTable>;

// Metrics Table
export interface MetricsTable {
  id: Generated<number>;
  start_time: string;
  end_time: string;
  key: string;
  meta_data: string;
  created_at: ColumnType<string | undefined>;
}

export type Metric = Selectable<MetricsTable>;
export type NewMetric = Insertable<MetricsTable>;
export type MetricUpdate = Updateable<MetricsTable>;

// Pools Table
export interface PoolsTable {
  id: Generated<number>;
  pair_address: string;
  chain_id: string;
  dex_id: string;
  fetch_time_id: number;

  // Core metrics
  liquidity_usd: number;
  market_cap: number;
  fdv: number;
  pair_created_at: ColumnType<Date, string | undefined, never>;

  // 24H metrics
  txns_24h: number;
  buys_24h: number;
  sells_24h: number;
  volume_24h: number;
  price_change_24h: number;

  // 6H metrics
  txns_6h: number;
  buys_6h: number;
  sells_6h: number;
  volume_6h: number;
  price_change_6h: number;

  // 1H metrics
  txns_1h: number;
  buys_1h: number;
  sells_1h: number;
  volume_1h: number;
  price_change_1h: number;

  // 5M metrics
  txns_5m: number;
  buys_5m: number;
  sells_5m: number;
  volume_5m: number;
  price_change_5m: number;

  // Store complete raw data
  raw_data: JSONColumnType<any>;

  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type Pool = Selectable<PoolsTable>;
export type NewPool = Insertable<PoolsTable>;
export type PoolUpdate = Updateable<PoolsTable>;

// Fetch Time Table
export interface FetchTimeTable {
  id: Generated<number>;
  timestamp: ColumnType<Date, string | undefined, never>;
  date: ColumnType<Date, string | undefined, never>;
  query_key: string;

  meta_data: JSONColumnType<{
    query_params?: Record<string, any>;
    status?: 'success' | 'error';
    error?: string;
  }>;

  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, never>;
}

export type FetchTime = Selectable<FetchTimeTable>;
export type NewFetchTime = Insertable<FetchTimeTable>;
export type FetchTimeUpdate = Updateable<FetchTimeTable>;
