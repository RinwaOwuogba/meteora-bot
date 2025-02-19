import {
  config,
  // constants,
  dataEngine,
  db,
} from '@meteora-bot-monorepo/shared';
// import fs from 'fs';

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
  // const dataIndexer = new dataEngine.DataIndexer(dbConnection);
  // const file = fs
  //   .readFileSync(
  //     __dirname + '/1739256230990_historical_data_nixcOQnwXq64-NzLFRi-g.json',
  //   )
  //   .toString();
  // await dataIndexer.indexData(
  //   JSON.parse(file),
  //   new Date(1739256230990),
  //   'nixcOQnwXq64-NzLFRi-g',
  // );
  // console.log('indexed!');
  // const pgDbConn = db.createPostgresDBConnection(config.DB_URL);
  // const sqliteDbConn = db.createSqliteDBConnection(
  //   '/Users/rinwa/Desktop/dev/web3-madness/meteora-bot/apps/data-miner/db.sqlite',
  // );
  // const crossDBMigrator = new dataEngine.SqliteToPostgresDataMigrator(
  //   sqliteDbConn,
  //   pgDbConn,
  // );
  // await crossDBMigrator.migrateAllData();
  // console.log('migration complete');
};

main();

process.on('SIGINT', () => {
  if (dataEngineInterval) {
    clearInterval(dataEngineInterval);
    console.log('Data engine interval cleared');
  }
  process.exit(0);
});
