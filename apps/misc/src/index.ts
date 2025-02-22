import { config, db, dataEngine } from '@meteora-bot-monorepo/shared';

const main = async (): Promise<void> => {
  const dbConnection = db.createPostgresDBConnection(config.DB_URL);
  await db.migrateToLatest(config.DB_URL);

  const dataIndexer = new dataEngine.DataIndexer(dbConnection);
  const defrag = new dataEngine.DefragmentMinedData(dataIndexer);
  await defrag.defragmentAndIndex(config.DATA_DIR + '/enriched_dex_pairs');
  console.log('Done with defrag');
};

main();
