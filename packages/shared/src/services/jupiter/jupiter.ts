import { UnifiedFetcher } from '@/utils/utils';
import { URLS } from '@/constants';

export interface JupiterTokenListToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags: JupiterTokenListTag[];
  extensions?: JupiterTokenListExtensions;
}

export interface JupiterTokenListExtensions {
  coingeckoId?: string;
  isBanned?: boolean;
}

export enum JupiterTokenListTag {
  Community = 'community',
  OldRegistry = 'old-registry',
  SolanaFm = 'solana-fm',
  Token2022 = 'token-2022',
  Unknown = 'unknown',
  Wormhole = 'wormhole',
}
export async function getJupiterTokenList(
  fetcher: UnifiedFetcher = fetch,
  listType: 'strict' | 'all' = 'strict',
): Promise<Map<string, JupiterTokenListToken>> {
  const response = await fetcher(
    listType == 'strict'
      ? URLS.JUPITER_TOKEN_STRICT_LIST_API
      : URLS.JUPITER_TOKEN_ALL_LIST_API,
  );
  const data: JupiterTokenListToken[] = JSON.parse(await response.text());
  const map: Map<string, JupiterTokenListToken> = new Map();
  data.forEach((token) => map.set(token.address, token));
  return map;
}
