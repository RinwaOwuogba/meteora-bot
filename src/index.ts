import DLMM from '@meteora-ag/dlmm';
import {
  DATA_DIR,
  DB_URL,
  PRIVATE_KEY,
  TOTAL_RANGE_INTERVAL,
  getConnection,
  walletData,
} from './config/config';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  closeLiquidityPosition,
  openBidAskPosition,
  openSpotBalancePosition,
  getMeteoraPoolsInfo,
  getPoolWithHighestProfitabilityChance,
  getPoolWithHighestProfitabilityChanceTest,
  claimAllPositionRewards,
} from './services/meteora/meteora';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { buyToken, sellToken, sellTokenHoldings } from './services/swap/swap';
import { getOpportunities } from './services/meteora/get-dlmm-opportunities';
import { DataEngine } from './services/data-engine/data-engine';
import { Kysely } from 'kysely';
import { Database } from './db/types';
import { SqliteDialect } from 'kysely';
import { createSqliteDBConnection } from './db/db';
import { migrateToLatest } from './db/migration';

let dataEngineInterval: NodeJS.Timeout | null = null;

// Entry point
const main = async () => {
  // const conn = await getConnection();
  const poolAddress = new PublicKey(
    // 'EuJpLh6bttzHGJnwRYya39WFx3ERd8sCXGrn1szF9mSi', // MEV_SOL
    'DTFy8xrN77RXieDQtPZ3QcuuGN7dMEMAsxHe5ZH2HY1K', // KM_SOL
  );
  const user = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(walletData.privateKey)),
  );

  // const dlmmPool = await DLMM.create(conn, poolAddress);
  // const activeBin = await dlmmPool.getActiveBin();

  // const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
  //   Number(activeBin.price),
  // );

  // console.log('Active Bin Price Per Token:', activeBinPricePerToken);
  // console.log('Active Bin Price:', activeBin.price);

  // let txHash = await openSpotBalancePosition(poolAddress, user, 0.1);
  // console.log(`http://solscan.io/tx/${txHash}`);

  // let closeTxHash = await closeLiquidityPosition(poolAddress, user);
  // console.log(`http://solscan.io/tx/${closeTxHash}`);

  // await openBidAskPosition(poolAddress, user, 0.1);

  // await sellTokenHoldings(user, [
  //   'FThrNpdic79XRV6i9aCWQ2UTp7oRQuCXAgUWtZR2cs42',
  // ]);

  // const txHashs = await claimAllPositionRewards(poolAddress, user);
  // console.log(txHashs.map((tx) => `http://solscan.io/tx/${tx}`));

  // const pools = await getMeteoraPoolsInfo(
  //   'HCgvbV9Qcf9TVGPGKMGbVEj8WwwVD6HhTt5E2i3qkeN9',
  // );

  // const bestPool = await getPoolWithHighestProfitabilityChance(
  //   'FThrNpdic79XRV6i9aCWQ2UTp7oRQuCXAgUWtZR2cs42',
  // );
  // console.log(bestPool);

  // const bestPool = await getPoolWithHighestProfitabilityChanceTest(
  //   pools
  // );
  // console.log(bestPool);

  // const opportunities = await getOpportunities();
  // console.log(opportunities);

  console.log('Migrating to latest');
  await migrateToLatest();
  console.log('Migrating to latest done');

  const db = createSqliteDBConnection();
  const dataEngine = new DataEngine(db, 1_000 * 60, DATA_DIR);
  // const dataEngine = new DataEngine(db, 1_000 * 60 * 60, DATA_DIR);
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
