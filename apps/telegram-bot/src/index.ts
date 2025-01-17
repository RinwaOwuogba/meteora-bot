import { TelegramService } from '@meteora-bot/shared/dist/services/telegram/telegram';
import { createSqliteDBConnection } from '@meteora-bot/shared/dist/db/db';
import { migrateToLatest } from '@meteora-bot/shared/dist/db/migration';
import dotenv from 'dotenv';

dotenv.config();

const main = async (): Promise<void> => {
  console.log('Running migrations...');
  await migrateToLatest();
  console.log('Migrations ran');

  const db = createSqliteDBConnection();
  const telegramService = new TelegramService(db);
  console.log('Telegram bot running');
};

main();
