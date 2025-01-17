import { DataEngine } from '@meteora-bot/shared/dist/services/data-engine/data-engine';
import { createSqliteDBConnection } from '@meteora-bot/shared/dist/db/db';
import { DATA_DIR } from '@meteora-bot/shared/dist/config/config';
import dotenv from 'dotenv';

dotenv.config();

let dataEngineInterval: NodeJS.Timeout | null = null;

const main = async (): Promise<void> => {
  const db = createSqliteDBConnection();
  const dataEngine = new DataEngine(db, 1000 * 60 * 60, DATA_DIR); // 1 hour
  dataEngineInterval = dataEngine.executeAtInterval();
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
