import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create 'fetch_times' table
  await db.schema
    .createTable('fetch_times')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('timestamp', 'text', (col) => col.notNull())
    .addColumn('date', 'text', (col) => col.notNull())
    .addColumn('query_key', 'text', (col) => col.notNull())
    .addColumn('meta_data', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn('updated_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();

  // Create 'pools' table
  await db.schema
    .createTable('pools')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('pair_address', 'text', (col) => col.notNull())
    .addColumn('chain_id', 'text', (col) => col.notNull())
    .addColumn('dex_id', 'text', (col) => col.notNull())
    .addColumn('fetch_time_id', 'integer', (col) =>
      col.references('fetch_times.id').onDelete('cascade').notNull(),
    )
    .addColumn('liquidity_usd', 'numeric', (col) => col.notNull())
    .addColumn('market_cap', 'numeric', (col) => col.notNull())
    .addColumn('fdv', 'numeric', (col) => col.notNull())
    .addColumn('pair_created_at', 'text', (col) => col.notNull())
    .addColumn('txns_24h', 'integer', (col) => col.notNull())
    .addColumn('buys_24h', 'integer', (col) => col.notNull())
    .addColumn('sells_24h', 'integer', (col) => col.notNull())
    .addColumn('volume_24h', 'numeric', (col) => col.notNull())
    .addColumn('price_change_24h', 'numeric', (col) => col.notNull())
    .addColumn('txns_6h', 'integer', (col) => col.notNull())
    .addColumn('buys_6h', 'integer', (col) => col.notNull())
    .addColumn('sells_6h', 'integer', (col) => col.notNull())
    .addColumn('volume_6h', 'numeric', (col) => col.notNull())
    .addColumn('price_change_6h', 'numeric', (col) => col.notNull())
    .addColumn('txns_1h', 'integer', (col) => col.notNull())
    .addColumn('buys_1h', 'integer', (col) => col.notNull())
    .addColumn('sells_1h', 'integer', (col) => col.notNull())
    .addColumn('volume_1h', 'numeric', (col) => col.notNull())
    .addColumn('price_change_1h', 'numeric', (col) => col.notNull())
    .addColumn('txns_5m', 'integer', (col) => col.notNull())
    .addColumn('buys_5m', 'integer', (col) => col.notNull())
    .addColumn('sells_5m', 'integer', (col) => col.notNull())
    .addColumn('volume_5m', 'numeric', (col) => col.notNull())
    .addColumn('price_change_5m', 'numeric', (col) => col.notNull())
    .addColumn('raw_data', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn('updated_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();

  // Add indexes to 'fetch_times' table
  await db.schema
    .createIndex('idx_timestamp')
    .on('fetch_times')
    .column('timestamp')
    .execute();

  await db.schema
    .createIndex('idx_date')
    .on('fetch_times')
    .column('date')
    .execute();

  await db.schema
    .createIndex('idx_query_key')
    .on('fetch_times')
    .column('query_key')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes from 'fetch_times' table
  await db.schema.dropIndex('idx_timestamp').execute();
  await db.schema.dropIndex('idx_date').execute();
  await db.schema.dropIndex('idx_query_key').execute();

  // Drop 'pools' table
  await db.schema.dropTable('pools').execute();

  // Drop 'fetch_times' table
  await db.schema.dropTable('fetch_times').execute();
}
