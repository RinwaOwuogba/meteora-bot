import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add new columns to the pools table
  await db.schema
    .alterTable('pools')
    .addColumn('base_symbol', 'text')
    .execute();

  await db.schema
    .alterTable('pools')
    .addColumn('quote_symbol', 'text')
    .execute();

  await db.schema
    .alterTable('pools')
    .addColumn('base_address', 'text')
    .execute();

  await db.schema
    .alterTable('pools')
    .addColumn('quote_address', 'text')
    .execute();

  // Create indexes for the new columns
  await db.schema
    .createIndex('idx_base_symbol')
    .on('pools')
    .column('base_symbol')
    .execute();

  await db.schema
    .createIndex('idx_quote_symbol')
    .on('pools')
    .column('quote_symbol')
    .execute();

  await db.schema
    .createIndex('idx_base_address')
    .on('pools')
    .column('base_address')
    .execute();

  await db.schema
    .createIndex('idx_quote_address')
    .on('pools')
    .column('quote_address')
    .execute();

  // Create index for pair_address if it doesn't exist already
  await db.schema
    .createIndex('idx_pair_address')
    .on('pools')
    .column('pair_address')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('idx_base_symbol').execute();
  await db.schema.dropIndex('idx_quote_symbol').execute();
  await db.schema.dropIndex('idx_base_address').execute();
  await db.schema.dropIndex('idx_quote_address').execute();
  await db.schema.dropIndex('idx_pair_address').execute();

  // Drop columns
  await db.schema.alterTable('pools').dropColumn('base_symbol').execute();
  await db.schema.alterTable('pools').dropColumn('quote_symbol').execute();
  await db.schema.alterTable('pools').dropColumn('base_address').execute();
  await db.schema.alterTable('pools').dropColumn('quote_address').execute();
}
