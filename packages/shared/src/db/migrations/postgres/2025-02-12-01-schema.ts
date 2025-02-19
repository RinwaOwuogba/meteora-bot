import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create 'users' table
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('meta_data', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn('updated_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();

  // Create 'wallets' table
  await db.schema
    .createTable('wallets')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) =>
      col.references('users.id').onDelete('cascade').notNull(),
    )
    .addColumn('wallet_address', 'text', (col) => col.notNull())
    .addColumn('meta_data', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn('updated_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();

  // Create 'positions' table
  await db.schema
    .createTable('positions')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) =>
      col.references('users.id').onDelete('cascade').notNull(),
    )
    .addColumn('wallet_id', 'integer', (col) =>
      col.references('wallets.id').onDelete('cascade').notNull(),
    )
    .addColumn('meta_data', 'text', (col) => col.notNull())
    .addColumn('status', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn('updated_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();

  // Create 'fees' table
  await db.schema
    .createTable('fees')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) =>
      col.references('users.id').onDelete('cascade').notNull(),
    )
    .addColumn('wallet_id', 'integer', (col) =>
      col.references('wallets.id').onDelete('cascade').notNull(),
    )
    .addColumn('position_id', 'integer', (col) =>
      col.references('positions.id').onDelete('cascade').notNull(),
    )
    .addColumn('meta_data', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn('updated_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();

  // Create 'position_logs' table
  await db.schema
    .createTable('position_logs')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) =>
      col.references('users.id').onDelete('cascade').notNull(),
    )
    .addColumn('wallet_id', 'integer', (col) =>
      col.references('wallets.id').onDelete('cascade').notNull(),
    )
    .addColumn('position_id', 'integer', (col) =>
      col.references('positions.id').onDelete('cascade').notNull(),
    )
    .addColumn('action', 'text', (col) => col.notNull())
    .addColumn('meta_data', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .addColumn('updated_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();

  // Create 'metrics' table
  await db.schema
    .createTable('metrics')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('start_time', 'text', (col) => col.notNull())
    .addColumn('end_time', 'text', (col) => col.notNull())
    .addColumn('key', 'text', (col) => col.notNull())
    .addColumn('meta_data', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop tables in reverse order to handle dependencies
  await db.schema.dropTable('metrics').execute();
  await db.schema.dropTable('position_logs').execute();
  await db.schema.dropTable('fees').execute();
  await db.schema.dropTable('positions').execute();
  await db.schema.dropTable('wallets').execute();
  await db.schema.dropTable('users').execute();
}
