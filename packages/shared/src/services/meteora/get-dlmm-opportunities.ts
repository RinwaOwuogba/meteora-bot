import {
  getDexScreenerPairs,
  DexScreenerPair,
} from '../dexscreener/dexscreener';
import {
  DexScreenerActivityInfo,
  DexScreenerLiquidity,
  DexScreenerToken,
} from '../dexscreener/dexscreener';
import { getJupiterTokenList, JupiterTokenListToken } from '../jupiter/jupiter';
import { getMeteoraPairs, MeteoraDlmmPair } from './get-meteora-pairs';
import { BLUE_CHIPS } from '@/config/config';

export async function getOpportunities(): Promise<OpportunityData[]> {
  const tokenMap = await getJupiterTokenList();
  const meteoraPairs = await getMeteoraPairs();
  console.log('fetched meteora pair data');
  // Write pairs to file for debugging
  // await require('fs/promises').writeFile(
  //   __dirname + '/meteora-pairs.json',
  //   JSON.stringify(meteoraPairs, null, 2),
  // );
  // const meteoraPairs: MeteoraDlmmPair[] = require(
  //   __dirname + '/meteora-pairs.json',
  // );
  const addresses = meteoraPairs.map((pair) => pair.address);
  // const dexScreenerPairs = await getDexScreenerPairs(addresses.slice(0, 3));
  const dexScreenerPairs = await getDexScreenerPairs(addresses);
  console.log('fetched dexscreener pair data');

  // Enrich the DEX Screener data with Meteora data
  const enrichedDexScreenerPairs = addMeteoraData(
    tokenMap,
    dexScreenerPairs,
    meteoraPairs,
  )
    // Sort by the highest 24H Fee / TVL
    .sort((a, b) => b.feeToTvl.min - a.feeToTvl.min);

  return enrichedDexScreenerPairs.map((pair) => {
    return {
      pairAddress: pair.pairAddress,
      pairName: pair.baseToken.symbol + '-' + pair.quoteToken.symbol,
      base: pair.baseToken,
      quote: pair.quoteToken,
      binStep: pair.bin_step,
      baseFee: pair.base_fee,
      liquidity: pair.liquidity.usd,
      fdv: pair.fdv,
      volume24h: pair.volume24h,
      trend: pair.trend,
      fees24h: pair.fees24h,
      feeToTvl: pair.feeToTvl,
      strict: pair.strict,
      bluechip:
        BLUE_CHIPS.includes(pair.baseToken.symbol.toLowerCase()) &&
        BLUE_CHIPS.includes(pair.quoteToken.symbol.toLowerCase()),
    };
  });
}

export function addMeteoraData(
  tokenMap: Map<string, JupiterTokenListToken>,
  dexScreenerData: DexScreenerPair[],
  meteoraData: MeteoraDlmmPair[],
): DexScreenerPairEnriched[] {
  // Copy the DEX Screener data, but use the enriched type
  const enrichedData: DexScreenerPairEnriched[] =
    dexScreenerData as DexScreenerPairEnriched[];

  // Loop through each pair and enrich the data w/ the Meteora data
  enrichedData.forEach((dexScreenerPair) => {
    // Get the Neteora pair matching the DEX screener pair
    let meteoraPair = meteoraData.find(
      (m) => m.address == dexScreenerPair.pairAddress,
    )!;
    // Add the strict flag
    dexScreenerPair.strict =
      tokenMap.has(dexScreenerPair.baseToken.address) &&
      tokenMap.has(dexScreenerPair.quoteToken.address);

    // Get the liquidity
    if (!dexScreenerPair.liquidity) {
      dexScreenerPair.liquidity = {
        usd: 0,
        base: 0,
        quote: 0,
        meteora: Number(meteoraPair.liquidity),
      };
    } else {
      dexScreenerPair.liquidity.meteora = Number(meteoraPair.liquidity);
    }

    // Get the bin step and base fee
    dexScreenerPair.bin_step = meteoraPair.bin_step;
    dexScreenerPair.base_fee = Number(meteoraPair.base_fee_percentage) / 100;

    // Get projected 24H volume
    dexScreenerPair.volume24h = {
      h24: dexScreenerPair.volume.h24,
      h6: dexScreenerPair.volume.h6 * 4,
      h1: dexScreenerPair.volume.h1 * 24,
      m5: dexScreenerPair.volume.m5 * 288,
      min: 0,
      max: 0,
    };
    dexScreenerPair.volume24h.min = Math.min(
      dexScreenerPair.volume24h.h24,
      dexScreenerPair.volume24h.h6,
      dexScreenerPair.volume24h.h1,
      dexScreenerPair.volume24h.m5,
    );
    dexScreenerPair.volume24h.max = Math.max(
      dexScreenerPair.volume24h.h24,
      dexScreenerPair.volume24h.h6,
      dexScreenerPair.volume24h.h1,
      dexScreenerPair.volume24h.m5,
    );

    // Estimate fees
    dexScreenerPair.fees24h = {
      h24: dexScreenerPair.base_fee * dexScreenerPair.volume24h.h24,
      h6: dexScreenerPair.base_fee * dexScreenerPair.volume24h.h6,
      h1: dexScreenerPair.base_fee * dexScreenerPair.volume24h.h1,
      m5: dexScreenerPair.base_fee * dexScreenerPair.volume24h.m5,
      min: dexScreenerPair.base_fee * dexScreenerPair.volume24h.min,
      max: dexScreenerPair.base_fee * dexScreenerPair.volume24h.max,
    };

    // Calculate 24H fee / TVL
    dexScreenerPair.feeToTvl = {
      h24: dexScreenerPair.fees24h.h24 / dexScreenerPair.liquidity.usd,
      h6: dexScreenerPair.fees24h.h6 / dexScreenerPair.liquidity.usd,
      h1: dexScreenerPair.fees24h.h1 / dexScreenerPair.liquidity.usd,
      m5: dexScreenerPair.fees24h.m5 / dexScreenerPair.liquidity.usd,
      min: dexScreenerPair.fees24h.min / dexScreenerPair.liquidity.usd,
      max: dexScreenerPair.fees24h.max / dexScreenerPair.liquidity.usd,
    };

    // Determine the volume trend
    const trendNumbers: number[] = [];
    trendNumbers.push(
      dexScreenerPair.volume24h.m5 >= dexScreenerPair.volume24h.h1 ? 1 : -1,
    );
    trendNumbers.push(
      dexScreenerPair.volume24h.h1 >= dexScreenerPair.volume24h.h6 ? 1 : -1,
    );
    trendNumbers.push(
      dexScreenerPair.volume24h.h6 >= dexScreenerPair.volume24h.h24 ? 1 : -1,
    );
    const trendTotal = trendNumbers.reduce((total, current) => total + current);
    dexScreenerPair.trend = trendTotal > 0 ? 'Up' : 'Down';

    dexScreenerPair.meteoraPair = meteoraPair;
  });
  return enrichedData;
}

export interface DexScreenerPairEnriched extends DexScreenerPair {
  liquidity: DexScreenerLiquidityEnriched;
  bin_step: number;
  base_fee: number;
  volume24h: DexScreenerActivityInfoEnriched;
  fees24h: DexScreenerActivityInfoEnriched;
  feeToTvl: DexScreenerActivityInfoEnriched;
  trend: 'Up' | 'Down';
  strict: boolean;
  meteoraPair: MeteoraDlmmPair;
}

export interface DexScreenerLiquidityEnriched extends DexScreenerLiquidity {
  meteora: number;
}

export interface DexScreenerActivityInfoEnriched
  extends DexScreenerActivityInfo {
  min: number;
  max: number;
}

export interface OpportunityData {
  pairAddress: string;
  pairName: string;
  base: DexScreenerToken;
  quote: DexScreenerToken;
  binStep: number;
  baseFee: number;
  liquidity: number;
  fdv: number;
  volume24h: DexScreenerActivityInfoEnriched;
  trend: 'Up' | 'Down';
  fees24h: DexScreenerActivityInfoEnriched;
  feeToTvl: DexScreenerActivityInfoEnriched;
  strict: boolean;
  bluechip: boolean;
}

export interface AllSolanaOpportunitesEnriched extends AllSolanaOpportunites {
  strict: boolean;
}

export interface AllSolanaOpportunites {
  updated: number;
  symbol: string;
  address: string;
  volume: number;
  price_variation_ratio: number;
  volumeToTvl: number;
}
