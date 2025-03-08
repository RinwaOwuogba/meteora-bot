import { config, db, dataEngine } from '@meteora-bot-monorepo/shared';
import path from 'path';

async function main() {
  // Create database connection
  const dbUrl =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/meteora';
  const dbConnection = db.createPostgresDBConnection(dbUrl);

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
}

main();
