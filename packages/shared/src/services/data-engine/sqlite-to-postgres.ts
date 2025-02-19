import { Kysely, TableExpression } from 'kysely';
import { Database } from '../../db/types';

export class SqliteToPostgresDataMigrator {
  constructor(
    private sqliteDb: Kysely<Database>,
    private postgresDb: Kysely<Database>,
  ) {}

  async migrateAllData(): Promise<void> {
    try {
      console.log('Starting data migration from SQLite to PostgreSQL...');

      // Migrate in order of dependencies
      // await this.migrateUsers();
      // await this.migrateWallets();
      // await this.migratePositions();
      // await this.migrateFees();
      // await this.migratePositionLogs();
      await this.migrateMetrics();
      // await this.migrateFetchTimes();
      // await this.migratePools();

      console.log('Data migration completed successfully');
    } catch (error) {
      console.error('Error during data migration:', error);
      throw error;
    }
  }

  // private async migrateUsers(): Promise<void> {
  //   console.log('Migrating users...');
  //   const users = await this.sqliteDb.selectFrom('users').selectAll().execute();

  //   if (users.length > 0) {
  //     await this.postgresDb
  //       .insertInto('users')
  //       .values(users)
  //       .execute();
  //   }
  //   console.log(`Migrated ${users.length} users`);
  // }

  // private async migrateWallets(): Promise<void> {
  //   console.log('Migrating wallets...');
  //   const wallets = await this.sqliteDb.selectFrom('wallets').selectAll().execute();

  //   if (wallets.length > 0) {
  //     await this.postgresDb
  //       .insertInto('wallets')
  //       .values(wallets)
  //       .execute();
  //   }
  //   console.log(`Migrated ${wallets.length} wallets`);
  // }

  // private async migratePositions(): Promise<void> {
  //   console.log('Migrating positions...');
  //   const positions = await this.sqliteDb
  //     .selectFrom('positions')
  //     .selectAll()
  //     .execute();

  //   if (positions.length > 0) {
  //     await this.postgresDb
  //       .insertInto('positions')
  //       .values(positions)
  //       .execute();
  //   }
  //   console.log(`Migrated ${positions.length} positions`);
  // }

  // private async migrateFees(): Promise<void> {
  //   console.log('Migrating fees...');
  //   const fees = await this.sqliteDb.selectFrom('fees').selectAll().execute();

  //   if (fees.length > 0) {
  //     await this.postgresDb
  //       .insertInto('fees')
  //       .values(fees)
  //       .execute();
  //   }
  //   console.log(`Migrated ${fees.length} fees`);
  // }

  // private async migratePositionLogs(): Promise<void> {
  //   console.log('Migrating position logs...');
  //   const positionLogs = await this.sqliteDb
  //     .selectFrom('position_logs')
  //     .selectAll()
  //     .execute();

  //   if (positionLogs.length > 0) {
  //     await this.postgresDb
  //       .insertInto('position_logs')
  //       .values(positionLogs)
  //       .execute();
  //   }
  //   console.log(`Migrated ${positionLogs.length} position logs`);
  // }

  private async migrateMetrics(): Promise<void> {
    console.log('Migrating metrics...');
    const metrics = await this.sqliteDb
      .selectFrom('metrics')
      .selectAll()
      .execute();

    // if (metrics.length > 0) {
    //   await this.postgresDb.insertInto('metrics').values(metrics).execute();
    // }
    // console.log(`Migrated ${metrics.length} metrics`);
  }

  // private async migrateFetchTimes(): Promise<void> {
  //   console.log('Migrating fetch times...');
  //   const fetchTimes = await this.sqliteDb
  //     .selectFrom('fetch_times')
  //     .selectAll()
  //     .execute();

  //   if (fetchTimes.length > 0) {
  //     await this.postgresDb
  //       .insertInto('fetch_times')
  //       .values(fetchTimes)
  //       .execute();
  //   }
  //   console.log(`Migrated ${fetchTimes.length} fetch times`);
  // }

  // private async migratePools(): Promise<void> {
  //   console.log('Migrating pools...');
  //   const pools = await this.sqliteDb.selectFrom('pools').selectAll().execute();

  //   if (pools.length > 0) {
  //     // Process pools in batches to handle large datasets
  //     const BATCH_SIZE = 1000;
  //     for (let i = 0; i < pools.length; i += BATCH_SIZE) {
  //       const batch = pools.slice(i, i + BATCH_SIZE);
  //       await this.postgresDb
  //         .insertInto('pools')
  //         .values(batch)
  //         .execute();
  //       console.log(`Migrated pools batch ${i / BATCH_SIZE + 1}`);
  //     }
  //   }
  //   console.log(`Migrated ${pools.length} pools`);
  // }

  // Helper method to verify the migration
  async verifyMigration(): Promise<void> {
    const tables: any[] = [
      // 'users',
      // 'wallets',
      // 'positions',
      // 'fees',
      // 'position_logs',
      'metrics',
      // 'fetch_times',
      // 'pools',
    ];

    console.log('Verifying migration...');

    for (const table of tables) {
      const sqliteCount = await this.sqliteDb
        .selectFrom(table)
        .select(({ fn }) => [fn.count('id').as('count')])
        .executeTakeFirst();

      const postgresCount = await this.postgresDb
        .selectFrom(table)
        .select(({ fn }) => [fn.count('id').as('count')])
        .executeTakeFirst();

      console.log(`Table ${table}:`);
      console.log(`  SQLite count: ${sqliteCount?.count}`);
      console.log(`  Postgres count: ${postgresCount?.count}`);

      if (sqliteCount?.count !== postgresCount?.count) {
        console.warn(
          `Warning: Count mismatch in table ${table}. SQLite: ${sqliteCount?.count}, Postgres: ${postgresCount?.count}`,
        );
      }
    }
  }
}
