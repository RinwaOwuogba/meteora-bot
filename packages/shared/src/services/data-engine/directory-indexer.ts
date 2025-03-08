import fs from 'fs/promises';
import path from 'path';
import { Kysely } from 'kysely';
import { Database } from '../../db/types';
import { DataIndexer } from './indexer';

/**
 * DirectoryIndexer is responsible for scanning a directory structure of data files,
 * checking if they've been indexed in the database, and indexing any missing files.
 *
 * The expected directory structure is:
 * - root directory
 *   - date directories (YYYY-MM-DD)
 *     - data files (ISO timestamp_historical_data_queryKey.json)
 */
export class DirectoryIndexer {
  private db: Kysely<Database>;
  private dataIndexer: DataIndexer;

  constructor(db: Kysely<Database>) {
    this.db = db;
    this.dataIndexer = new DataIndexer(db);
  }

  /**
   * Scans a directory structure and indexes any files that haven't been indexed yet
   * @param rootDirectory The root directory containing date-based subdirectories
   * @returns A summary of the indexing operation
   */
  async indexDirectory(rootDirectory: string): Promise<{
    totalFiles: number;
    alreadyIndexed: number;
    newlyIndexed: number;
    failed: number;
  }> {
    console.log(`Starting directory indexing for: ${rootDirectory}`);

    // Stats to track progress
    const stats = {
      totalFiles: 0,
      alreadyIndexed: 0,
      newlyIndexed: 0,
      failed: 0,
    };

    try {
      // Get all date directories
      const dateDirs = await fs.readdir(rootDirectory);

      // Process each date directory
      for (const dateDir of dateDirs) {
        const datePath = path.join(rootDirectory, dateDir);
        const dirStat = await fs.stat(datePath);

        // Skip if not a directory or doesn't match date format
        if (!dirStat.isDirectory() || !dateDir.match(/^\d{4}-\d{2}-\d{2}$/)) {
          continue;
        }

        console.log(`Processing date directory: ${dateDir}`);

        // Get all indexed query keys for this date
        const indexedQueryKeys = await this.getIndexedQueryKeysForDate(dateDir);
        console.log(
          `Found ${indexedQueryKeys.size} indexed query keys for ${dateDir}`,
        );

        // Process files in this date directory
        await this.processDateDirectory(
          datePath,
          dateDir,
          indexedQueryKeys,
          stats,
        );
      }

      console.log('Directory indexing completed');
      console.log(`Total files: ${stats.totalFiles}`);
      console.log(`Already indexed: ${stats.alreadyIndexed}`);
      console.log(`Newly indexed: ${stats.newlyIndexed}`);
      console.log(`Failed: ${stats.failed}`);

      return stats;
    } catch (error) {
      console.error('Error during directory indexing:', error);
      throw error;
    }
  }

  /**
   * Gets a set of all query keys that have already been indexed for a specific date
   * @param dateStr The date string in YYYY-MM-DD format
   * @returns A Set of indexed query keys
   */
  private async getIndexedQueryKeysForDate(
    dateStr: string,
  ): Promise<Set<string>> {
    const result = await this.db
      .selectFrom('fetch_times')
      .select(['query_key'])
      .distinct()
      .where('date', '=', dateStr as any)
      .execute();

    return new Set(result.map((r) => r.query_key));
  }

  /**
   * Processes all files in a date directory
   * @param dirPath The full path to the date directory
   * @param dateStr The date string (YYYY-MM-DD)
   * @param indexedQueryKeys Set of already indexed query keys
   * @param stats Stats object to update
   */
  private async processDateDirectory(
    dirPath: string,
    dateStr: string,
    indexedQueryKeys: Set<string>,
    stats: {
      totalFiles: number;
      alreadyIndexed: number;
      newlyIndexed: number;
      failed: number;
    },
  ): Promise<void> {
    // Get all files in the directory
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const fileStat = await fs.stat(filePath);

      // Skip if not a file or doesn't match expected pattern
      if (!fileStat.isFile() || !file.endsWith('.json')) {
        continue;
      }

      stats.totalFiles++;

      try {
        // Extract query key from filename
        const queryKey = this.extractQueryKey(file);

        // Check if this query key has already been indexed
        if (indexedQueryKeys.has(queryKey)) {
          console.log(`File already indexed: ${file}`);
          stats.alreadyIndexed++;
          continue;
        }

        // Extract timestamp from filename
        const timestamp = this.extractTimestamp(file);

        // Index the file
        console.log(`Indexing file: ${file}`);
        await this.indexFile(filePath, timestamp, queryKey);

        // Add to indexed set to avoid reprocessing
        indexedQueryKeys.add(queryKey);
        stats.newlyIndexed++;
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        stats.failed++;
      }
    }
  }

  /**
   * Indexes a single file
   * @param filePath Path to the file
   * @param timestamp Timestamp from the filename
   * @param queryKey Query key from the filename
   */
  private async indexFile(
    filePath: string,
    timestamp: string,
    queryKey: string,
  ): Promise<void> {
    try {
      // Read and parse the file
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      // Index the data
      await this.dataIndexer.indexData(data, new Date(timestamp), queryKey);

      console.log(`Successfully indexed: ${path.basename(filePath)}`);
    } catch (error) {
      console.error(`Failed to index file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Extracts the timestamp from a filename
   * Expected format: 2023-01-01T12:34:56.789Z_historical_data_someKey.json
   */
  private extractTimestamp(fileName: string): string {
    const match = fileName.match(/^(.+?)_historical_data/);
    if (!match) {
      throw new Error(`Invalid file name format: ${fileName}`);
    }
    return match[1];
  }

  /**
   * Extracts the query key from a filename
   * Expected format: 2023-01-01T12:34:56.789Z_historical_data_someKey.json
   */
  private extractQueryKey(fileName: string): string {
    const match = fileName.match(/historical_data_(.+)\.json$/);
    if (!match) {
      throw new Error(`Invalid file name format: ${fileName}`);
    }
    return 'historical_data_' + match[1];
  }
}

// Export the class
export default DirectoryIndexer;
