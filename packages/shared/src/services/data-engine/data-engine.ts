import { getDexScreenerPairs } from '../dexscreener/dexscreener';
import { getJupiterTokenList } from '../jupiter/jupiter';
import { getMeteoraPairs } from '../meteora/get-meteora-pairs';
import { Database } from '@/db/types';
import { Kysely } from 'kysely';
import * as fs from 'fs/promises';
import * as path from 'path';
import { addMeteoraData } from '../meteora/get-dlmm-opportunities';
import { generateId } from '@/utils/utils';
import { DataIndexer } from './indexer';

export class DataEngine {
  private db: Kysely<Database>;
  private interval: number;
  private saveDir: string;
  private dataIndexer: DataIndexer;

  constructor(
    db: Kysely<Database>,
    interval: number = 1000 * 60 * 60,
    saveDir: string = path.join(__dirname, 'data'),
  ) {
    this.db = db;
    this.interval = interval;
    this.saveDir = saveDir;
    this.dataIndexer = new DataIndexer(this.db);
  }

  executeAtInterval(): NodeJS.Timeout {
    return setInterval(async () => {
      try {
        const startTime = new Date();
        console.log('Fetching and storing data...');

        const key = await this.fetchAndStoreData();
        console.log('Data stored successfully with key:', key);

        const endTime = new Date();
        await this.storeMetricsInDb(startTime, endTime, key);
      } catch (error) {
        console.error('Error fetching and storing data:', error);
      }
    }, this.interval);
  }

  async fetchAndStoreData(): Promise<string> {
    const key = 'historical_data_' + generateId();
    const { enrichedData, meteoraPairs, dexScreenerPairs } =
      await this.fetchAndEnrichData();

    await Promise.allSettled([
      this.storeDataFiles(enrichedData, 'enriched_dex_pairs', key),
      // this.storeDataFiles(meteoraPairs, 'meteora_pairs', key),
      // this.storeDataFiles(dexScreenerPairs, 'dex_screener_pairs', key),
    ]).then((results) => {
      results.forEach((result, index) => {
        const fileType = [
          'enriched_dex_pairs',
          // 'meteora_pairs',
          // 'dex_screener_pairs',
        ][index];
        if (result.status === 'fulfilled') {
          console.log(`✅ Successfully stored ${fileType} data`);
        } else {
          console.error(`❌ Failed to store ${fileType} data:`, result.reason);
        }
      });
    });

    return key;
  }

  async fetchAndEnrichData(): Promise<{
    enrichedData: any[];
    meteoraPairs: any[];
    dexScreenerPairs: any[];
  }> {
    const tokenMap = await getJupiterTokenList();
    const meteoraPairs = await getMeteoraPairs();
    console.log('Meteora pairs fetched');

    const addresses = meteoraPairs.map((pair) => pair.address);
    const dexScreenerPairs = await getDexScreenerPairs(addresses);
    console.log('Dex screener pairs fetched');

    const enrichedData = addMeteoraData(
      tokenMap,
      dexScreenerPairs,
      meteoraPairs,
    );
    console.log('Compiled data');

    return { enrichedData, meteoraPairs, dexScreenerPairs };
  }

  async storeMetricsInDb(
    startTime: Date,
    endTime: Date,
    key: string,
  ): Promise<void> {
    await this.db
      .insertInto('metrics')
      .values({
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        key,
        meta_data: JSON.stringify({}), // Add any additional metadata here
      })
      .execute();
  }

  async storeDataFiles(
    data: any[],
    directory: string,
    key: string,
    date: Date = new Date(), // allow passing in a specific date if needed
  ): Promise<void> {
    // Create a date segment using ISO format (YYYY-MM-DD)
    const timestamp = date.toISOString();
    const dateSegment = timestamp.split('T')[0]; // e.g. "2023-10-05"
    const fileName = `${timestamp}_${key}.json`;

    // Construct the file path with the date segment
    const filePath = path.join(this.saveDir, directory, dateSegment, fileName);

    // Ensure the directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write the file immediately with error handling
    try {
      const fileContent = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, fileContent);
      console.log(`Data successfully written to ${filePath}`);
    } catch (error) {
      console.error(`Failed to write data to ${filePath}:`, error);
    }

    // Use the indexer to index the data
    try {
      await this.dataIndexer.indexData(data, date, key);
      console.log('Data successfully indexed');
    } catch (error) {
      console.error('Failed to index data:', error);
    }
  }
}

export * from './indexer';

export * from './sqlite-to-postgres';

export * from './defragment-mined-data';
