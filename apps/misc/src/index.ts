import { config, db, dataEngine } from '@meteora-bot-monorepo/shared';
import fs from 'fs';
import path from 'path';

const main = async (): Promise<void> => {
  const dbConnection = db.createPostgresDBConnection(config.DB_URL);
  await db.migrateToLatest(config.DB_URL);

  // Create directory indexer
  const directoryIndexer = new dataEngine.DirectoryIndexer(dbConnection);

  // Path to the data directory
  const dataDir = path.join(config.DATA_DIR, 'enriched_dex_pairs');

  try {
    // Run the indexer
    const stats = await directoryIndexer.indexDirectory(dataDir);
    console.log('Indexing completed with stats:', stats);
  } catch (error) {
    console.error('Error during indexing:', error);
  } finally {
    // Close the database connection
    await dbConnection.destroy();
  }
};

main();
