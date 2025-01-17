import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add telegram-related columns to users table
  await db.schema
    .alterTable('users')
    .addColumn('telegram_id', 'text')
    .execute();

  await db.schema
    .alterTable('users')
    .addColumn('telegram_username', 'text')
    .execute();

  await db.schema
    .alterTable('users')
    .addColumn('is_admin', 'integer', (col) => col.defaultTo(0))
    .execute();

  // Add index for telegram_id
  await db.schema
    .createIndex('users_telegram_id_idx')
    .on('users')
    .column('telegram_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('users').dropColumn('telegram_id').execute();
  await db.schema.alterTable('users').dropColumn('telegram_username').execute();
  await db.schema.alterTable('users').dropColumn('is_admin').execute();
  await db.schema.dropIndex('users_telegram_id_idx').execute();
}
