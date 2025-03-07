import { Database, Pool } from '../../db/types';
import { Kysely, sql } from 'kysely';

export class TokenDataUpdater {
  private db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }

  /**
   * Updates the token data columns in the pools table using data from raw_data
   */
  async updateTokenData(): Promise<void> {
    try {
      console.log('Starting token data update process...');

      // Get count of records that need updating before the operation
      const countBeforeResult = await this.db
        .selectFrom('pools')
        .select(({ fn }) => [fn.count('id').as('count')])
        .where((eb) =>
          eb('base_symbol', 'is', null)
            .or('quote_symbol', 'is', null)
            .or('base_address', 'is', null)
            .or('quote_address', 'is', null),
        )
        .executeTakeFirst();

      const recordsToUpdate = Number(countBeforeResult?.count || 0);
      console.log(`Found ${recordsToUpdate} records to update`);

      if (recordsToUpdate === 0) {
        console.log('No records need updating');
        return;
      }

      // Execute the raw SQL update query
      const result = await sql`
        UPDATE pools
        SET
          base_symbol = COALESCE((raw_data::json->'baseToken'->>'symbol')::text, base_symbol),
          quote_symbol = COALESCE((raw_data::json->'quoteToken'->>'symbol')::text, quote_symbol),
          base_address = COALESCE((raw_data::json->'baseToken'->>'address')::text, base_address),
          quote_address = COALESCE((raw_data::json->'quoteToken'->>'address')::text, quote_address)
        WHERE
          base_symbol IS NULL
          OR quote_symbol IS NULL
          OR base_address IS NULL
          OR quote_address IS NULL;
      `.execute(this.db);

      // Get count after update to verify changes
      const countAfterResult = await this.db
        .selectFrom('pools')
        .select(({ fn }) => [fn.count('id').as('count')])
        .where('base_symbol', 'is', null)
        .where((eb) =>
          eb('base_symbol', 'is', null)
            .or('quote_symbol', 'is', null)
            .or('base_address', 'is', null)
            .or('quote_address', 'is', null),
        )
        .executeTakeFirst();

      const remainingRecords = Number(countAfterResult?.count || 0);
      const updatedRecords = recordsToUpdate - remainingRecords;

      console.log(
        `Token data update completed. Updated ${updatedRecords} records.`,
      );

      if (remainingRecords > 0) {
        console.log(
          `${remainingRecords} records still need updating (missing data in raw_data).`,
        );
      }
    } catch (error) {
      console.error('Error during token data update:', error);
      throw error;
    }
  }
}
