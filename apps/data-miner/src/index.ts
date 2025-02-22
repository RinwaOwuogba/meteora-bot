import { config, dataEngine, db } from '@meteora-bot-monorepo/shared';

let dataEngineInterval: NodeJS.Timeout | null = null;

const main = async (): Promise<void> => {
  const dbConnection = db.createPostgresDBConnection(config.DB_URL);
  await db.migrateToLatest(config.DB_URL);

  const dataEngineInstance = new dataEngine.DataEngine(
    dbConnection,
    1000 * 60 * 20,
    config.DATA_DIR,
  ); // 20 minutes
  dataEngineInterval = dataEngineInstance.executeAtInterval();
  console.log('Data engine running');
};

main();

process.on('SIGINT', () => {
  if (dataEngineInterval) {
    clearInterval(dataEngineInterval);
    console.log('Data engine interval cleared');
  }
  process.exit(0);
});
