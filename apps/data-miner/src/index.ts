import {
  config,
  constants,
  dataEngine,
  db,
} from '@meteora-bot-monorepo/shared';
import dotenv from 'dotenv';

dotenv.config();

let dataEngineInterval: NodeJS.Timeout | null = null;

const main = async (): Promise<void> => {
  const dbConnection = db.createSqliteDBConnection();
  const dataEngineInstance = new dataEngine.DataEngine(
    dbConnection,
    1000 * 60 * 60,
    config.DATA_DIR,
  ); // 1 hour
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
