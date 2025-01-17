import { TelegramService } from '@/services/telegram/telegram';
import { createSqliteDBConnection } from '@/db/db';
import { migrateToLatest } from '@/db/migration';
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
