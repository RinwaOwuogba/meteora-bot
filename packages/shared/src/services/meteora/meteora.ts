import DLMM, {
  getTokenBalance,
  PositionInfo,
  StrategyType,
} from '@meteora-ag/dlmm';
import { getConnection, TOTAL_RANGE_INTERVAL } from '../../config/config';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  Transaction,
} from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getAccountTokenBalance, modifyPriorityFeeIx } from '@/utils/utils';
import { buyToken } from '../swap/swap';

// Open Liquidity Position
export const openLiquidityPosition = async (
  poolAddress: PublicKey,
  user: Signer,
  amountX: number,
  amountY: number,
  strategyType: StrategyType,
) => {
  const conn = await getConnection();
  const dlmmPool = await DLMM.create(conn, poolAddress);
  const activeBin = await dlmmPool.getActiveBin();

  const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
  const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;

  const totalXAmount = new BN(amountX);
  const totalYAmount = new BN(amountY);
  const newPosition = Keypair.generate();

  // Create Position (Spot Balance deposit, Please refer ``example.ts` for more example)
  const createPositionTx =
    await dlmmPool.initializePositionAndAddLiquidityByStrategy({
      positionPubKey: newPosition.publicKey,
      user: user.publicKey,
      totalXAmount,
      totalYAmount,
      strategy: {
        maxBinId,
        minBinId,
        strategyType,
      },
    });

  const createPositionTxHash = await sendAndConfirmTransaction(
    conn,
    createPositionTx,
    [user, newPosition],
    { skipPreflight: false, preflightCommitment: 'confirmed' },
  );

  return createPositionTxHash;
};

export const openBidAskPosition = async (
  poolAddress: PublicKey,
  user: Signer,
  amountSol: number,
) => {
  const amountLamports = amountSol * LAMPORTS_PER_SOL;

  return openLiquidityPosition(
    poolAddress,
    user,
    0,
    amountLamports,
    StrategyType.BidAskImBalanced,
  );
};

export const openSpotBalancePosition = async (
  poolAddress: PublicKey,
  user: Signer,
  totalAmountSol: number,
) => {
  const amountSol = totalAmountSol / 2;
  const amountLamports = amountSol * LAMPORTS_PER_SOL;

  const nonSolTokenMint = new PublicKey(
    'HCgvbV9Qcf9TVGPGKMGbVEj8WwwVD6HhTt5E2i3qkeN9', // METV
  );
  const { success, requiredNonSolTokenAmount, possessedNonSolTokenAmount } =
    await ensureNonSolTokenBalance(
      poolAddress,
      nonSolTokenMint,
      user,
      amountSol,
    );
  if (!success) {
    throw new Error(
      `Insufficient balance of non-SOL token ${nonSolTokenMint.toString()}. ` +
        `You need at least ${requiredNonSolTokenAmount} to open the position.`,
    );
  }

  return openLiquidityPosition(
    poolAddress,
    user,
    possessedNonSolTokenAmount,
    amountLamports,
    StrategyType.SpotBalanced,
  );
};

export const ensureNonSolTokenBalance = async (
  poolAddress: PublicKey,
  nonSolTokenMint: PublicKey,
  user: Signer,
  amountSol: number,
): Promise<TokenBalanceCheckResult> => {
  const { amount: tokenBalance, decimals } = await getAccountTokenBalance(
    user.publicKey,
    nonSolTokenMint,
  );

  const conn = await getConnection();
  const dlmmPool = await DLMM.create(conn, poolAddress);
  const activeBin = await dlmmPool.getActiveBin();

  const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
    Number(activeBin.price),
  );

  const requiredNonSolTokenAmount =
    (amountSol / parseFloat(activeBinPricePerToken)) * 10 ** decimals;

  // Calculate deficit percentage
  const deficitPercentage =
    (requiredNonSolTokenAmount - tokenBalance) / requiredNonSolTokenAmount;

  return {
    success: true,
    requiredNonSolTokenAmount,
    possessedNonSolTokenAmount: tokenBalance,
  };

  if (deficitPercentage > 0.1) {
    console.log(
      `Deficit exceeds 10%. Attempting to buy non-SOL token ${nonSolTokenMint.toString()}...`,
    );

    const success = await buyToken(
      user,
      nonSolTokenMint.toString(),
      requiredNonSolTokenAmount - tokenBalance, // Buy only the deficit
    );

    return {
      success,
      requiredNonSolTokenAmount,
      possessedNonSolTokenAmount: tokenBalance,
    };
  }

  console.log(
    `Sufficient non-SOL token balance. Required: ${requiredNonSolTokenAmount}, Possessed: ${tokenBalance}`,
  );

  return {
    success: true,
    requiredNonSolTokenAmount,
    possessedNonSolTokenAmount: tokenBalance,
  };
};

// Close Liquidity Position
export const getFullPosition = async (
  user: Signer,
  poolAddress: PublicKey,
): Promise<PositionInfo | null> => {
  const conn = await getConnection();
  const positions = await DLMM.getAllLbPairPositionsByUser(
    conn,
    user.publicKey,
  );

  if (positions.size === 0) {
    return null;
  }

  // Get full position for specific pool
  const position = positions.get(poolAddress.toString());

  if (!position) {
    return null;
  }

  return position;
};

export const closeLiquidityPosition = async (
  poolAddress: PublicKey,
  user: Signer,
) => {
  // Get connection and create DLMM pool instance
  const conn = await getConnection();
  const dlmmPool = await DLMM.create(conn, poolAddress);

  // Get full position details for the user and pool
  const position = await getFullPosition(user, poolAddress);

  if (!position) {
    return;
  }

  console.log(
    'position',
    JSON.stringify(
      position,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value),
      2,
    ),
  );
  const positionData = position.lbPairPositionsData[0];

  if (!positionData) {
    return;
  }

  // Get all bin IDs from position data
  const binIdsToRemove = positionData.positionData.positionBinData.map(
    (bin: { binId: number }) => bin.binId,
  );

  // Remove liquidity from all bins and close position
  const removeLiquidityTx = (await dlmmPool.removeLiquidity({
    position: positionData.publicKey,
    user: user.publicKey,
    binIds: binIdsToRemove,
    bps: new BN(100 * 100),
    shouldClaimAndClose: true,
  })) as Transaction;

  // Add priority fee to transaction
  modifyPriorityFeeIx(removeLiquidityTx, 1000000);

  // Send and confirm transaction
  return await sendAndConfirmTransaction(conn, removeLiquidityTx, [user], {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });
};

export const claimAllPositionRewards = async (
  poolAddress: PublicKey,
  user: Signer,
): Promise<string[]> => {
  try {
    // Simulate delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000),
    );

    // Get full position
    const position = await getFullPosition(user, poolAddress);
    if (!position) {
      console.log(
        `No positions found for user ${user.publicKey.toString().slice(0, 4)}...`,
      );
      return [];
    }

    const conn = await getConnection();
    const dlmmPool = await DLMM.create(conn, poolAddress);

    const positionData = position.lbPairPositionsData[0];
    if (!positionData) {
      console.log(
        `Position data is missing for user ${user.publicKey.toString().slice(0, 4)}...`,
      );
      return [];
    }

    // Check if there are fees to claim
    if (
      positionData.positionData.feeX.isZero() &&
      positionData.positionData.feeY.isZero()
    ) {
      console.log(
        `No fees available to claim for user ${user.publicKey.toString().slice(0, 4)}...`,
      );
      return [];
    }

    // Claim all rewards
    const claimRewardsTxs = await dlmmPool.claimAllRewards({
      owner: user.publicKey,
      positions: [positionData],
    });

    if (!claimRewardsTxs || claimRewardsTxs.length === 0) {
      console.log(
        `No transactions formed for claiming rewards for user ${user.publicKey.toString().slice(0, 4)}...`,
      );
      return [];
    }

    const txHashs: string[] = [];

    for (let i = 0; i < claimRewardsTxs.length; i++) {
      const tx = claimRewardsTxs[i];
      modifyPriorityFeeIx(tx, 1000000);

      try {
        const txHash = await sendAndConfirmTransaction(conn, tx, [user], {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });
        console.log(`Transaction hash for claiming rewards: ${txHash}`);

        if (i < claimRewardsTxs.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          txHashs.push(txHash);
        }
      } catch (error: any) {
        console.error(
          `Error sending claim rewards transaction: ${error.message}`,
        );
      }
    }

    return txHashs;
  } catch (error: any) {
    console.error(`Error in claimAllRewards: ${error.message}`);
    throw error;
  }
};

export const getMeteoraPoolsInfo = async (tokenAddress: string) => {
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
  );
  const data = await response.json();

  if (!data || !data.pairs || data.pairs.length === 0) {
    throw new Error('No pool data available for the token');
  }

  // Filter Meteora pools with SOL
  const meteoraSolPools = data.pairs.filter(
    (pair: any) =>
      pair.dexId === 'meteora' &&
      (pair.baseToken.symbol === 'SOL' || pair.quoteToken.symbol === 'SOL'),
  );

  // Get additional information for each pool
  const poolsWithDetails = await Promise.all(
    meteoraSolPools.map(async (pool: any) => {
      try {
        const detailsResponse = await fetch(
          `https://app.meteora.ag/clmm-api/pair/${pool.pairAddress}`,
        );
        const details = await detailsResponse.json();
        return {
          ...pool,
          binStep: details.bin_step,
          baseFee: details.base_fee_percentage,
          fees24: details.fees_24h,
          currentPrice: details.current_price,
          liquidity: details.liquidity,
          protocolFee: details.protocol_fee_percentage,
          mintX: details.mint_x,
          tradeVolume: details.trade_volume_24h,
        };
      } catch (error) {
        return {
          ...pool,
          binStep: 'N/A',
          baseFee: 'N/A',
          fees24: 'N/A',
          currentPrice: 'N/A',
          liquidity: 'N/A',
          protocolFee: 'N/A',
          mintX: 'N/A',
          tradeVolume: 'N/A',
        };
      }
    }),
  );

  return poolsWithDetails;
};

export const getPoolWithHighestProfitabilityChance = async (
  tokenAddress: string,
): Promise<Pool | null> => {
  const pools = await getMeteoraPoolsInfo(tokenAddress);
  if (!pools || pools.length === 0) return null;

  let bestPool: Pool | null = null;
  let highestScore = 0;

  const volumeWeight = 0.3;
  const liquidityWeight = 0.2;
  const feeWeight = 0.2;
  const binStepWeight = 0.1;
  const priceStabilityWeight = 0.1;
  const singleSidedWeight = 0.05;
  const rangeWidthWeight = 0.05;

  const getMaxMinValues = (key: string): { max: number; min: number } => {
    let max = -Infinity;
    let min = Infinity;

    for (const pool of pools) {
      const value = parseFloat(pool[key] as string) || 0;
      if (value > max) max = value;
      if (value < min) min = value;
    }

    return { max, min };
  };

  const normalize = (value: number, max: number, min: number = 0): number => {
    if (max === min) return 1; // Avoid division by zero
    return (value - min) / (max - min);
  };

  for (const pool of pools) {
    const h24Volume = parseFloat(pool.volume?.h24 as string) || 0;
    const volumeValues = getMaxMinValues('volume.h24');
    const volumeScore = normalize(
      h24Volume,
      volumeValues.max,
      volumeValues.min,
    );

    const liquidityVal = parseFloat(pool.liquidity as string) || 0;
    const liquidityValues = getMaxMinValues('liquidity');
    const liquidityScore = normalize(
      liquidityVal,
      liquidityValues.max,
      liquidityValues.min,
    );

    const feeVal = parseFloat(pool.baseFee as string) || 0;
    const feeValues = getMaxMinValues('baseFee');
    const feeScore = normalize(feeVal, feeValues.max, feeValues.min);

    const binStepVal = parseFloat(pool.binStep as string) || 1;
    const binStepScore = 1 / binStepVal;

    const priceChangeVal = parseFloat(pool.priceChange?.h24 as string) || 0;
    const priceStabilityScore = 1 - Math.abs(priceChangeVal / 100);

    const priceNativeVal = parseFloat(pool.priceNative as string) || 0;
    const binStepPct = binStepVal / 10000; // Adjust range width based on binStep
    const rangeWidth = priceNativeVal * binStepPct * 2; // Simplified range width calculation
    const rangeWidthValues = { max: 1, min: 0 }; // Placeholder for range normalization
    const rangeWidthScore = normalize(
      rangeWidth,
      rangeWidthValues.max,
      rangeWidthValues.min,
    );

    // Since `is_single_sided` does not exist, default it to 0
    const singleSidedScore = 0;

    const totalScore =
      volumeWeight * volumeScore +
      liquidityWeight * liquidityScore +
      feeWeight * feeScore +
      binStepWeight * binStepScore +
      priceStabilityWeight * priceStabilityScore +
      singleSidedWeight * singleSidedScore +
      rangeWidthWeight * rangeWidthScore;

    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestPool = pool;
    }
  }

  return bestPool;
};

export const getPoolWithHighestProfitabilityChanceTest = async (
  pools: any[],
): Promise<Pool | null> => {
  let bestPool: Pool | null = null;
  let highestScore = 0;

  const volumeWeight = 0.3;
  const liquidityWeight = 0.2;
  const feeWeight = 0.2;
  const binStepWeight = 0.1;
  const priceStabilityWeight = 0.1;
  const singleSidedWeight = 0.05;
  const rangeWidthWeight = 0.05;

  const getMaxMinValues = (key: string): { max: number; min: number } => {
    let max = -Infinity;
    let min = Infinity;

    for (const pool of pools) {
      const value = parseFloat(pool[key] as string) || 0;
      if (value > max) max = value;
      if (value < min) min = value;
    }

    return { max, min };
  };

  const normalize = (value: number, max: number, min: number = 0): number => {
    if (max === min) return 1; // Avoid division by zero
    return (value - min) / (max - min);
  };

  for (const pool of pools) {
    const h24Volume = parseFloat(pool.volume?.h24 as string) || 0;
    const volumeValues = getMaxMinValues('volume.h24');
    const volumeScore = normalize(
      h24Volume,
      volumeValues.max,
      volumeValues.min,
    );

    const liquidityVal = parseFloat(pool.liquidity as string) || 0;
    const liquidityValues = getMaxMinValues('liquidity');
    const liquidityScore = normalize(
      liquidityVal,
      liquidityValues.max,
      liquidityValues.min,
    );

    const feeVal = parseFloat(pool.baseFee as string) || 0;
    const feeValues = getMaxMinValues('baseFee');
    const feeScore = normalize(feeVal, feeValues.max, feeValues.min);

    const binStepVal = parseFloat(pool.binStep as string) || 1;
    const binStepScore = 1 / binStepVal;

    const priceChangeVal = parseFloat(pool.priceChange?.h24 as string) || 0;
    const priceStabilityScore = 1 - Math.abs(priceChangeVal / 100);

    const priceNativeVal = parseFloat(pool.priceNative as string) || 0;
    const binStepPct = binStepVal / 10000; // Adjust range width based on binStep
    const rangeWidth = priceNativeVal * binStepPct * 2; // Simplified range width calculation
    const rangeWidthValues = { max: 1, min: 0 }; // Placeholder for range normalization
    const rangeWidthScore = normalize(
      rangeWidth,
      rangeWidthValues.max,
      rangeWidthValues.min,
    );

    // Since `is_single_sided` does not exist, default it to 0
    const singleSidedScore = 0;

    const totalScore =
      volumeWeight * volumeScore +
      liquidityWeight * liquidityScore +
      feeWeight * feeScore +
      binStepWeight * binStepScore +
      priceStabilityWeight * priceStabilityScore +
      singleSidedWeight * singleSidedScore +
      rangeWidthWeight * rangeWidthScore;

    pool.totalScore = totalScore;

    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestPool = pool;
    }
  }

  console.log('pools', pools);

  return bestPool;
};

interface TokenBalanceCheckResult {
  success: boolean; // Indicates success or failure
  requiredNonSolTokenAmount: number; // The amount of non-SOL tokens required
  possessedNonSolTokenAmount: number; // The amount of non-SOL tokens possessed
}

interface Pool {
  volume: { h24: number };
  liquidity: number;
  baseFee: number;
  binStep: number;
  priceChange: { h24: number };
  is_single_sided: boolean;
  range: { min: number; max: number };
}
