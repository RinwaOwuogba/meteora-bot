import { Kysely } from 'kysely';
import SQLite from 'better-sqlite3';
import { SqliteDialect } from 'kysely';
import { Database } from './types';
import { DB_URL } from '@/config/config';

export const createSqliteDBConnection = (url = DB_URL) => {
  const db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new SQLite(url),
      // database: new SQLite(':memory:'),
    }),
  });

  return db;
};
