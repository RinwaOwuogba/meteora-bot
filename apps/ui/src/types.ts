export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
}

export interface TransactionData {
  buys: number;
  sells: number;
}

export interface Transactions {
  m5: TransactionData;
  h1: TransactionData;
  h6: TransactionData;
  h24: TransactionData;
}

export interface IndexedLiquidityPool {
  id: number;
  pair_address: string;
  base_symbol: string;
  quote_symbol: string;
  chain_id: string;
  dex_id: string;
  liquidity_usd: string;
  market_cap: string;
  pair_created_at: string;
  txns_24h: number;
  buys_24h: number;
  sells_24h: number;
  volume_24h: number;
  // Keep backward compatibility with existing code
  baseToken?: TokenInfo;
  quoteToken?: TokenInfo;
  liquidity?: {
    usd: number;
  };
  marketCap?: number;
  pairCreatedAt?: string;
  txns?: Transactions;
}
