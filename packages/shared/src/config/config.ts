import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ConnectionPool } from '../utils/connection-pool';
import dotenv from 'dotenv';
import { sleep } from '@/utils/utils';

dotenv.config();

// RPC and proxy settings
const RPC_CONFIG = {
  USE_MULTI_RPC: 0, // 0 - a single RPC is used, 1 - multiple RPCs are used
  USE_MULTI_PROXY: 0, // 0 - no proxy is used, 1 - proxy is used
  POOL_SIZE: 5,
};

const RPC_ENDPOINTS = [
  // 'https://api.mainnet-beta.solana.com',
  // 'https://api.testnet.solana.com',
  'https://mainnet.helius-rpc.com/?api-key=999816e7-e8cc-4341-b757-e24c81b9509e',
];

const PROXY_LIST = [
  '0.0.0.0:0000:username:password',
  '0.0.0.0:0000:username:password',
];

const connectionPool = new ConnectionPool(RPC_ENDPOINTS, PROXY_LIST, {
  poolSize: RPC_CONFIG.POOL_SIZE,
  useMultiRPC: RPC_CONFIG.USE_MULTI_RPC === 1,
  useMultiProxy: RPC_CONFIG.USE_MULTI_PROXY === 1,
});

// Exports
export const connection = connectionPool.getConnection();
export const getConnection = async () => {
  await sleep(Math.floor(Math.random() * 1000) + 1000);
  return connectionPool.getConnection();
};
export const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
export const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
export const walletData = {
  privateKey: PRIVATE_KEY,
  description: 'sample wallet 1',
};
export const BLUE_CHIPS = [
  'USDC',
  'SOL',
  'USDT',
  'jitoSOL',
  'bSOL',
  'JupSOL',
  'INF',
  'JLP',
  'JupSOL',
  'WBTC',
  'WETH',
  'bonkSOL',
  'LST',
  'mSOL',
  'zippySOL',
].map((token) => token.toLowerCase());
export const DB_URL = process.env.DB_URL || '';
export const DATA_DIR = process.env.DATA_DIR || '';
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const TELEGRAM_ADMIN_IDS = process.env.TELEGRAM_ADMIN_IDS || '';
