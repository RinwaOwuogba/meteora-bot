import { Database, NewFetchTime, NewPool } from '../../db/types';
import { Kysely } from 'kysely';
import { DexScreenerPairEnriched } from '../meteora/get-dlmm-opportunities';

export class DataIndexer {
  private db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }

  async indexData(
    data: DexScreenerPairEnriched[],
    date: Date,
    queryKey: string,
  ): Promise<void> {
    // Create fetch time entry
    const timestamp = date.toISOString();
    const dateSegment = timestamp.split('T')[0];

    const fetchTime: NewFetchTime = {
      timestamp,
      date: dateSegment,
      query_key: queryKey,
      meta_data: JSON.stringify({
        query_params: {},
        status: 'success',
      }),
    };

    // Insert fetch time and get ID
    const [fetchTimeResult] = await this.db
      .insertInto('fetch_times')
      .values(fetchTime)
      .returning('id')
      .execute();

    // Map data to pool records
    const poolRecords: NewPool[] = data.map((item) => ({
      pair_address: item.pairAddress,
      chain_id: item.chainId,
      dex_id: item.dexId,
      fetch_time_id: fetchTimeResult.id,
      liquidity_usd: item.liquidity?.usd ?? 0,
      market_cap: (item as any)?.marketCap ?? 0,
      fdv: item.fdv ?? 0,
      pair_created_at: item.pairCreatedAt
        ? new Date(item.pairCreatedAt).toISOString()
        : new Date().toISOString(),

      // Token data
      base_symbol: item.baseToken?.symbol || null,
      quote_symbol: item.quoteToken?.symbol || null,
      base_address: item.baseToken?.address || null,
      quote_address: item.quoteToken?.address || null,

      // 24h metrics
      txns_24h: (item.txns?.h24?.buys ?? 0) + (item.txns?.h24?.sells ?? 0),
      buys_24h: item.txns?.h24?.buys ?? 0,
      sells_24h: item.txns?.h24?.sells ?? 0,
      volume_24h: item.volume?.h24 ?? 0,
      price_change_24h: item.priceChange?.h24 ?? 0,

      // 6h metrics
      txns_6h: (item.txns?.h6?.buys ?? 0) + (item.txns?.h6?.sells ?? 0),
      buys_6h: item.txns?.h6?.buys ?? 0,
      sells_6h: item.txns?.h6?.sells ?? 0,
      volume_6h: item.volume?.h6 ?? 0,
      price_change_6h: item.priceChange?.h6 ?? 0,

      // 1h metrics
      txns_1h: (item.txns?.h1?.buys ?? 0) + (item.txns?.h1?.sells ?? 0),
      buys_1h: item.txns?.h1?.buys ?? 0,
      sells_1h: item.txns?.h1?.sells ?? 0,
      volume_1h: item.volume?.h1 ?? 0,
      price_change_1h: item.priceChange?.h1 ?? 0,

      // 5m metrics
      txns_5m: (item.txns?.m5?.buys ?? 0) + (item.txns?.m5?.sells ?? 0),
      buys_5m: item.txns?.m5?.buys ?? 0,
      sells_5m: item.txns?.m5?.sells ?? 0,
      volume_5m: item.volume?.m5 ?? 0,
      price_change_5m: item.priceChange?.m5 ?? 0,

      raw_data: JSON.stringify(item),
    }));

    // Batch insert pool records
    const INSERT_BATCH_SIZE = 2_000;

    for (let i = 0; i < poolRecords.length; i += INSERT_BATCH_SIZE) {
      const batch = poolRecords.slice(i, i + INSERT_BATCH_SIZE);
      await this.db.insertInto('pools').values(batch).execute();
    }
  }

  async checkIfIndexed(timestamp: string): Promise<boolean> {
    const result = await this.db
      .selectFrom('fetch_times')
      .select('timestamp')
      .where(
        'timestamp',
        '=',
        new Date(parseInt(timestamp)).toISOString() as any,
      )
      .execute();

    return result.length > 0;
  }
}
