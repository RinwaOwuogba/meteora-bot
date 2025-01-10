import {
  getDexScreenerPairs,
  DexScreenerPair,
} from '../dexscreener/dexscreener';
import { getJupiterTokenList } from '../jupiter/jupiter';
import { getMeteoraPairs, MeteoraDlmmPair } from '../meteora/get-meteora-pairs';
import { Database } from '@/db/types';
import { Kysely } from 'kysely';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  addMeteoraData,
  DexScreenerPairEnriched,
} from '../meteora/get-dlmm-opportunities';
import { generateId } from '@/utils/utils';

export class DataEngine {
  private db: Kysely<Database>;
  private interval: number;
  private saveDir: string;
  constructor(
    db: Kysely<Database>,
    interval: number = 1000 * 60 * 60,
    saveDir: string = path.join(__dirname, 'data'),
  ) {
    this.db = db;
    this.interval = interval;
    this.saveDir = saveDir;
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
      this.storeDataFiles(enrichedData, 'enriched_data', key),
      this.storeDataFiles(meteoraPairs, 'meteora_pairs', key),
      this.storeDataFiles(dexScreenerPairs, 'dex_screener_pairs', key),
    ]).then((results) => {
      results.forEach((result, index) => {
        const fileType = [
          'enriched_data',
          'meteora_pairs',
          'dex_screener_pairs',
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
    enrichedData: any;
    meteoraPairs: any;
    dexScreenerPairs: any;
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
    console.log(
      'Size of dexScreener data in memory:',
      JSON.stringify(dexScreenerPairs).length,
      'bytes',
    );
    console.log(
      'Size of enriched data in memory:',
      JSON.stringify(enrichedData).length,
      'bytes',
    );
    console.log(
      'Size of meteora data in memory:',
      JSON.stringify(meteoraPairs).length,
      'bytes',
    );

    return { enrichedData, meteoraPairs, dexScreenerPairs };
  }

  // async fetchAndEnrichData(): Promise<{
  //   enrichedData: any;
  //   meteoraPairs: any;
  //   dexScreenerPairs: any;
  //   date: string;
  // }> {
  //   // Instantiate a shared date field
  //   const date = new Date().toISOString();

  //   // Mock data
  //   const meteoraPairs = [
  //     { address: 'pair-1-address', pairName: 'BTC/ETH', date },
  //     { address: 'pair-2-address', pairName: 'ETH/USDT', date },
  //   ];

  //   const dexScreenerPairs = [
  //     { address: 'pair-1-address', liquidity: 5000, volume: 1000, date },
  //     { address: 'pair-2-address', liquidity: 8000, volume: 1200, date },
  //   ];

  //   const enrichedData = meteoraPairs.map((pair) => ({
  //     ...pair,
  //     dexScreenerData: dexScreenerPairs.find((d) => d.address === pair.address),
  //     additionalInfo: `Enriched info for ${pair.pairName}`,
  //     date,
  //   }));

  //   return { enrichedData, meteoraPairs, dexScreenerPairs, date };
  // }

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
        meta_data: JSON.stringify({ additionalInfo: 'example' }), // Add any additional metadata here
      })
      .execute();
  }

  async storeDataFiles(
    data: any,
    directory: string,
    key: string,
  ): Promise<void> {
    const timestamp = Date.now();
    const fileName = `${key}_${timestamp}.json`;
    const filePath = path.join(this.saveDir, directory, fileName);

    // Ensure the directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
}
