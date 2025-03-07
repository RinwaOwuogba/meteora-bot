import { config, db, dataEngine } from '@meteora-bot-monorepo/shared';

const main = async (): Promise<void> => {
  const dbConnection = db.createPostgresDBConnection(config.DB_URL);
  await db.migrateToLatest(config.DB_URL);

  const tokenDataUpdater = new dataEngine.TokenDataUpdater(dbConnection);
  await tokenDataUpdater.updateTokenData();
};

main();
