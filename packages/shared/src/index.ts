export * as utils from '@/utils/utils';

export * as dataEngine from '@/services/data-engine/data-engine';
export * as telegram from '@/services/telegram/telegram';
export * as dexscreener from '@/services/dexscreener/dexscreener';
export * as jupiter from '@/services/jupiter/jupiter';
export * as meteora from '@/services/meteora/meteora';
export * as swap from '@/services/swap/swap';

export * as db from '@/db/db';

export * as config from '@/config/config';
export * as constants from '@/constants';

// export * from '@/db/db';
// export * from '@/db/migration';

// import { TelegramService } from '@/services/telegram/telegram';
// import { createSqliteDBConnection } from '@/db/db';
// import { migrateToLatest } from '@/db/migration';
// import dotenv from 'dotenv';

// dotenv.config();

// const main = async (): Promise<void> => {
//   console.log('Running migrations...');
//   await migrateToLatest();
//   console.log('Migrations ran');

//   const db = createSqliteDBConnection();
//   const telegramService = new TelegramService(db);
//   console.log('Telegram bot running');
// };

// main();
