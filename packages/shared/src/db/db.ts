import { Kysely, PostgresDialect } from 'kysely';
import SQLite from 'better-sqlite3';
import { SqliteDialect } from 'kysely';
import { Database } from './types';
import { Pool } from 'pg';

export const createSqliteDBConnection = (url: string) => {
  const db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new SQLite(url),
    }),
  });

  return db;
};

export const createPostgresDBConnection = (url: string) => {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: url }),
    }),
  });

  return db;
};

export * from '@/db/types';
export * from '@/db/migration';
