import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add unique constraint to 'timestamp' column in 'fetch_times' table
  await db.schema
    .alterTable('fetch_times')
    .addUniqueConstraint('unique_timestamp', ['timestamp'])
    .execute();

  // Add unique constraint to 'pair_address' and 'fetch_time_id' columns in 'pools' table
  await db.schema
    .alterTable('pools')
    .addUniqueConstraint('unique_pair_address_fetch_time', [
      'pair_address',
      'fetch_time_id',
    ])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop unique constraint from 'timestamp' column in 'fetch_times' table
  await db.schema
    .alterTable('fetch_times')
    .dropConstraint('unique_timestamp')
    .execute();

  // Drop unique constraint from 'pair_address' and 'fetch_time_id' columns in 'pools' table
  await db.schema
    .alterTable('pools')
    .dropConstraint('unique_pair_address_fetch_time')
    .execute();
}
