import express, { Request, Response } from 'express';
import { db } from '@meteora-bot-monorepo/shared';
import { BLUE_CHIPS } from '@meteora-bot-monorepo/shared/dist/config/config';

const router = express.Router();
const dbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/meteora';
const dbConn = db.createPostgresDBConnection(dbUrl);

// GET /pools/date-range
// Returns the start and end dates of the data in the database
router.get('/date-range', async (req: Request, res: Response) => {
  try {
    const result = await dbConn
      .selectFrom('fetch_times')
      .select([
        dbConn.fn.min('date').as('start_date'),
        dbConn.fn.max('date').as('end_date'),
      ])
      .executeTakeFirst();

    res.json({
      startDate: result?.start_date,
      endDate: result?.end_date,
    });
  } catch (error) {
    console.error('Error fetching date range:', error);
    res.status(500).json({ error: 'Failed to fetch date range' });
  }
});

// GET /pools/dates/:date/fetch-times
// Returns the fetch times for a given date
router.get('/dates/:date/fetch-times', async (req: Request, res: Response) => {
  try {
    const { date } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res
        .status(400)
        .json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const fetchTimes = await dbConn
      .selectFrom('fetch_times')
      .select(['id', 'timestamp', 'query_key'])
      .where('date', '=', date as any as Date)
      .orderBy('timestamp', 'asc')
      .execute();

    res.json(fetchTimes);
  } catch (error) {
    console.error(
      `Error fetching fetch times for date ${req.params.date}:`,
      error,
    );
    res.status(500).json({ error: 'Failed to fetch fetch times' });
  }
});

// GET /pools?fetch_time=2025-01-29T17:34:39.662Z
// Returns all the pools for a given fetch time with cursor-based pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      fetch_time,
      cursor,
      limit = '20',
      search,
      sort_by = 'volume_24h',
      sort_order = 'desc',
      min_liquidity,
      max_liquidity,
      min_market_cap,
      max_market_cap,
      min_age_days,
      max_age_days,
      min_txns_24h,
      max_txns_24h,
      min_volume_24h,
      max_volume_24h,
    } = req.query;

    if (!fetch_time) {
      return res
        .status(400)
        .json({ error: 'fetch_time parameter is required' });
    }

    // Parse the limit to a number
    const limitNum = parseInt(limit as string, 10);

    // Validate limit
    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }

    // Find the fetch_time_id from the timestamp
    const fetchTimeRecord = await dbConn
      .selectFrom('fetch_times')
      .select(['id'])
      .where(
        'timestamp',
        '=',
        new Date(fetch_time as string).toISOString() as any as Date,
      )
      .executeTakeFirst();

    if (!fetchTimeRecord) {
      return res.status(404).json({ error: 'Fetch time not found' });
    }

    // Base query
    let query = dbConn
      .selectFrom('pools')
      .select([
        'id',
        'pair_address',
        'base_symbol',
        'quote_symbol',
        'base_address',
        'quote_address',
        'chain_id',
        'dex_id',
        'liquidity_usd',
        'market_cap',
        'pair_created_at',
        'txns_24h',
        'buys_24h',
        'sells_24h',
        'volume_24h',
      ])
      .where('fetch_time_id', '=', fetchTimeRecord.id);

    // Apply search if provided
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query = query.where((eb) =>
        eb.or([
          eb('base_symbol', 'ilike', searchTerm),
          eb('quote_symbol', 'ilike', searchTerm),
          eb('pair_address', 'ilike', searchTerm),
          eb('base_address', 'ilike', searchTerm),
          eb('quote_address', 'ilike', searchTerm),
        ]),
      );
    }

    // Apply filters for liquidity
    if (min_liquidity) {
      const minLiquidity = parseFloat(min_liquidity as string);
      if (!isNaN(minLiquidity)) {
        query = query.where('liquidity_usd', '>=', minLiquidity);
      }
    }

    if (max_liquidity) {
      const maxLiquidity = parseFloat(max_liquidity as string);
      if (!isNaN(maxLiquidity)) {
        query = query.where('liquidity_usd', '<=', maxLiquidity);
      }
    }

    // Apply filters for market cap
    if (min_market_cap) {
      const minMarketCap = parseFloat(min_market_cap as string);
      if (!isNaN(minMarketCap)) {
        query = query.where('market_cap', '>=', minMarketCap);
      }
    }

    if (max_market_cap) {
      const maxMarketCap = parseFloat(max_market_cap as string);
      if (!isNaN(maxMarketCap)) {
        query = query.where('market_cap', '<=', maxMarketCap);
      }
    }

    // Apply filters for pair age
    if (min_age_days) {
      const minAgeDays = parseInt(min_age_days as string, 10);
      if (!isNaN(minAgeDays)) {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() - minAgeDays);
        query = query.where(
          'pair_created_at',
          '<=',
          maxDate.toISOString() as any,
        );
      }
    }

    if (max_age_days) {
      const maxAgeDays = parseInt(max_age_days as string, 10);
      if (!isNaN(maxAgeDays)) {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - maxAgeDays);
        query = query.where(
          'pair_created_at',
          '>=',
          minDate.toISOString() as any,
        );
      }
    }

    // Apply filters for 24h transactions
    if (min_txns_24h) {
      const minTxns = parseInt(min_txns_24h as string, 10);
      if (!isNaN(minTxns)) {
        query = query.where('txns_24h', '>=', minTxns);
      }
    }

    if (max_txns_24h) {
      const maxTxns = parseInt(max_txns_24h as string, 10);
      if (!isNaN(maxTxns)) {
        query = query.where('txns_24h', '<=', maxTxns);
      }
    }

    // Apply filters for 24h volume
    if (min_volume_24h) {
      const minVolume = parseFloat(min_volume_24h as string);
      if (!isNaN(minVolume)) {
        query = query.where('volume_24h', '>=', minVolume);
      }
    }

    if (max_volume_24h) {
      const maxVolume = parseFloat(max_volume_24h as string);
      if (!isNaN(maxVolume)) {
        query = query.where('volume_24h', '<=', maxVolume);
      }
    }

    // Apply cursor if provided
    if (cursor) {
      query = query.where('id', '>', parseInt(cursor as string, 10));
    }

    // Apply sorting
    const validSortFields = [
      'id',
      'liquidity_usd',
      'market_cap',
      'pair_created_at',
      'txns_24h',
      'volume_24h',
    ];

    const sortField = validSortFields.includes(sort_by as string)
      ? (sort_by as string)
      : 'volume_24h';

    const order = sort_order === 'asc' ? 'asc' : 'desc';

    query = query.orderBy(sortField as any, order as any);

    // Add secondary sort by id for consistent pagination
    if (sortField !== 'id') {
      query = query.orderBy('id', 'asc');
    }

    // Execute the query with limit
    query = query.limit(limitNum + 1); // Get one extra to determine if there are more results
    const pools = await query.execute();

    // Determine if there are more results
    const hasMore = pools.length > limitNum;
    if (hasMore) {
      pools.pop(); // Remove the extra item
    }

    // Get the next cursor
    const nextCursor = hasMore ? pools[pools.length - 1].id.toString() : null;

    res.json({
      pools,
      pagination: {
        hasMore,
        nextCursor,
      },
    });
  } catch (error) {
    console.error('Error fetching pools:', error);
    res.status(500).json({ error: 'Failed to fetch pools' });
  }
});

export default router;
