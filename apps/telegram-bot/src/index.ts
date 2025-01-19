import { db, telegram } from '@meteora-bot-monorepo/shared';

const main = async (): Promise<void> => {
  console.log('Running migrations...');
  await db.migrateToLatest;
  console.log('Migrations ran');

  const dbConnection = db.createSqliteDBConnection();
  const telegramService = new telegram.TelegramService(dbConnection);
  console.log('Telegram bot running [1]');
};

main();
