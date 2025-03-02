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

export interface LiquidityPool {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: TokenInfo;
  quoteToken: TokenInfo;
  liquidity: {
    usd: number;
    base: number;
    quote: number;
    meteora: number;
  };
  marketCap: number;
  pairCreatedAt: number;
  txns: Transactions;
}
