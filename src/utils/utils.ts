import axios, { AxiosError, AxiosResponse } from 'axios';
import { getConnection } from '../config/config';
import { PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { randomBytes } from 'crypto';

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getAccountTokenBalance(
  wallet: PublicKey,
  mintAddress: PublicKey,
): Promise<{ amount: number; decimals: number }> {
  const conn = await getConnection();
  const tokenAccounts = await conn.getParsedTokenAccountsByOwner(wallet, {
    mint: mintAddress,
  });

  if (tokenAccounts.value.length === 0) {
    return { amount: 0, decimals: 0 };
  }

  const { amount, decimals } =
    tokenAccounts.value[0].account.data.parsed.info.tokenAmount;

  return {
    amount: Number(amount),
    decimals,
  };
}

export const modifyPriorityFeeIx = (
  tx: Transaction,
  newPriorityFee: number,
): boolean => {
  for (let ix of tx.instructions) {
    if (ComputeBudgetProgram.programId.equals(ix.programId)) {
      if (ix.data[0] === 3) {
        ix.data = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: newPriorityFee,
        }).data;
        return true;
      }
    }
  }

  tx.instructions.unshift(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: newPriorityFee }),
  );
  return true;
};

export type UnifiedFetcher = (url: string) => Promise<UnifiedResponse>;
export type UnifiedMultiFetcher = (
  url: string[],
) => Promise<AxiosResponse<any, any>[]>;

export interface UnifiedResponse {
  text: () => Promise<string>;
  json: () => Promise<any>;
}

class RateLimitedFetcher {
  private requestTimestamps: Map<number, number> = new Map();

  constructor(
    private requestsPerPeriod: number = 3,
    private periodMs: number = 1000,
  ) {}

  async fetch(url: string): Promise<Response> {
    const now = Date.now();

    // Clean up old timestamps outside the rate-limiting window
    for (const [key, timestamp] of this.requestTimestamps.entries()) {
      if (now - timestamp >= this.periodMs) {
        this.requestTimestamps.delete(key);
      } else {
        break; // Since `Map` iterates in insertion order, we can stop early
      }
    }

    // console.log('===========================================');
    // console.log('requestTimestamps.size', this.requestTimestamps.size);
    // console.log('this.requestsPerPeriod', this.requestsPerPeriod);
    // Check if the limit is reached
    if (this.requestTimestamps.size >= this.requestsPerPeriod) {
      const earliestRequestTime = Array.from(
        this.requestTimestamps.values(),
      )[0];
      const waitTime = this.periodMs - (now - earliestRequestTime);
      console.log('waitTime', waitTime);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // console.log('fetching', url);
    // Add the new request timestamp
    this.requestTimestamps.set(now, now);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as Response);
      }, 1000);
    });
    // return fetch(url);
  }
}

class BurstFriendlyRateLimitedFetcher {
  private lastFetchTimestamps: Map<number, number> = new Map();
  private queue: Array<{
    url: string;
    resolve: (value: AxiosResponse<any, any>) => void;
    reject: (reason?: any) => void;
    retries: number;
  }> = [];
  private currentRequestCount: number = 0;
  private backoffTime: number;
  private isPaused: boolean = false;

  constructor(
    private requestsPerPeriod: number = 3,
    private periodMs: number = 1000,
    private flushIntervalMs: number = 50,
    private initialBackoffTime: number = 60_000,
  ) {
    this.backoffTime = this.initialBackoffTime;

    // Periodically try to flush the queue
    setInterval(() => this.flushQueue(), this.flushIntervalMs);
  }

  public fetch(url: string): Promise<AxiosResponse<any, any>> {
    return new Promise<AxiosResponse<any, any>>((resolve, reject) => {
      this.cleanupTimestamps();

      // 2. Check if we have capacity right now
      if (this.currentRequestCount < this.requestsPerPeriod && !this.isPaused) {
        this.dispatchRequest(url, resolve, reject, 0);
      } else {
        // Otherwise, queue the request for later
        this.queue.push({ url, resolve, reject, retries: 0 });
      }
    });
  }

  private flushQueue(): void {
    // Cleanup old timestamps to free up capacity
    this.cleanupTimestamps();

    // While we have capacity and there are requests queued, dispatch them.
    while (
      this.currentRequestCount < this.requestsPerPeriod &&
      this.queue.length > 0 &&
      !this.isPaused
    ) {
      const { url, resolve, reject, retries } = this.queue.shift()!;
      this.dispatchRequest(url, resolve, reject, retries);
    }
  }

  private async dispatchRequest(
    url: string,
    resolve: (value: AxiosResponse<any, any>) => void,
    reject: (reason?: any) => void,
    retries: number,
  ) {
    // Add a timestamp for this request (consumes "slot" in our window)
    const now = Date.now();
    this.lastFetchTimestamps.set(
      now,
      (this.lastFetchTimestamps.get(now) || 0) + 1,
    );

    this.currentRequestCount++;

    try {
      console.log('Fetching URL:', url.slice(0, 150));
      const res = await axios.get(url);
      resolve(res);
      console.log('Fetched URL:', url.slice(0, 150));
      this.backoffTime = this.initialBackoffTime;
    } catch (err) {
      console.log('Error fetching URL:', url.slice(0, 150));
      console.error((err as AxiosError).response);
      if (retries < 2) {
        console.log('Queueing request for retry:', retries + 1);
        this.queue.push({ url, resolve, reject, retries: retries + 1 });
      } else {
        resolve({} as AxiosResponse<any, any>);
      }
      this.handleFailure();
    }
  }

  private handleFailure(): void {
    this.isPaused = true;
    setTimeout(() => {
      this.isPaused = false;
      this.flushQueue();
    }, this.backoffTime);
    this.backoffTime *= 1.5;
  }

  private cleanupTimestamps(): void {
    const now = Date.now();
    // Remove timestamps older than periodMs
    for (const [timestamp, count] of this.lastFetchTimestamps) {
      if (now - timestamp >= this.periodMs) {
        this.lastFetchTimestamps.delete(timestamp);

        // Decrement the request count by the count of expired timestamps
        this.currentRequestCount -= count;
      } else {
        break; // Timestamps are in order; no need to check further
      }
    }
  }
}

const rateLimitedFetcher = new BurstFriendlyRateLimitedFetcher(4, 1_000, 500);

export async function multiFetch(
  urls: string[],
): Promise<AxiosResponse<any, any>[]> {
  return Promise.all(urls.map((url) => rateLimitedFetcher.fetch(url)));
}

export function generateId(length = 21) {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const bytes = randomBytes(length);
  let id = '';
  for (let i = 0; i < length; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return id;
}
