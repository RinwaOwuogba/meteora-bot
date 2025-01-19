import { config, db, telegram } from '@meteora-bot-monorepo/shared';

const main = async (): Promise<void> => {
  console.log('Running migrations...');
  await db.migrateToLatest(config.DB_URL);
  console.log('Migrations ran');

  const dbConnection = db.createSqliteDBConnection(config.DB_URL);
  const telegramService = new telegram.TelegramService(dbConnection);
  console.log('Telegram bot running..');
};

main();
