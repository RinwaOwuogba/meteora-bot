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
  created_at: ColumnType<Date, string | undefined, never>;
}

export type Metric = Selectable<MetricsTable>;
export type NewMetric = Insertable<MetricsTable>;
export type MetricUpdate = Updateable<MetricsTable>;
