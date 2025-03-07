import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add composite index for fetch_time_id and id to optimize the pools query with pagination
  await db.schema
    .createIndex('idx_fetch_time_id_id')
    .on('pools')
    .columns(['fetch_time_id', 'id'])
    .execute();

  // Add composite indexes for token symbols and addresses to optimize filtering
  await db.schema
    .createIndex('idx_base_quote_symbols')
    .on('pools')
    .columns(['base_symbol', 'quote_symbol'])
    .execute();

  // Add index for liquidity_usd to optimize sorting by liquidity
  await db.schema
    .createIndex('idx_liquidity_usd')
    .on('pools')
    .column('liquidity_usd')
    .execute();

  // Add index for market_cap to optimize sorting by market cap
  await db.schema
    .createIndex('idx_market_cap')
    .on('pools')
    .column('market_cap')
    .execute();

  // Add index for pair_created_at to optimize sorting by age
  await db.schema
    .createIndex('idx_pair_created_at')
    .on('pools')
    .column('pair_created_at')
    .execute();

  // Add index for txns_24h to optimize sorting by transaction volume
  await db.schema
    .createIndex('idx_txns_24h')
    .on('pools')
    .column('txns_24h')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop all the indexes created in the up function
  await db.schema.dropIndex('idx_fetch_time_id_id').execute();
  await db.schema.dropIndex('idx_base_quote_symbols').execute();
  await db.schema.dropIndex('idx_liquidity_usd').execute();
  await db.schema.dropIndex('idx_market_cap').execute();
  await db.schema.dropIndex('idx_pair_created_at').execute();
  await db.schema.dropIndex('idx_txns_24h').execute();
}
