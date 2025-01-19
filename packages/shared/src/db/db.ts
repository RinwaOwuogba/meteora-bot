import { Kysely } from 'kysely';
import SQLite from 'better-sqlite3';
import { SqliteDialect } from 'kysely';
import { Database } from './types';

export const createSqliteDBConnection = (url: string) => {
  const db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new SQLite(url),
    }),
  });

  return db;
};

export * from '@/db/types';
export * from '@/db/migration';
