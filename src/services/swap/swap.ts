// import { Wallet } from '@/types';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  VersionedTransaction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getConnection } from '../../config/config';
import { sleep } from '@/utils/utils';
import { BN } from '@coral-xyz/anchor';
import DLMM from '@meteora-ag/dlmm';

const SLIPPAGE_BPS = 5 * 100; // 5%
const PRIORITY_FEE = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const MIN_TOKEN_AMOUNT = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2_000;

export async function buyToken(
  user: Signer,
  tokenMint: string,
  solAmount: number,
  attempt: number = 1,
): Promise<boolean> {
  try {
    try {
      const quoteResponse = await (
        await fetch(
          `https://quote-api.jup.ag/v6/quote?` +
            `inputMint=${SOL_MINT}` +
            `&outputMint=${tokenMint}` +
            `&amount=${solAmount * LAMPORTS_PER_SOL}` + // Convert SOL to lamports
            `&slippageBps=${SLIPPAGE_BPS}`,
        )
      ).json();

      const { swapTransaction } = await (
        await fetch('https://quote-api.jup.ag/v6/swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteResponse,
            userPublicKey: user.publicKey.toString(),
            wrapAndUnwrapSol: true,
            prioritizationFeeLamports: PRIORITY_FEE,
          }),
        })
      ).json();

      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      transaction.sign([user]);

      const conn = await getConnection();
      const latestBlockhash = await conn.getLatestBlockhash();
      const rawtransaction = transaction.serialize();

      const txid = await conn.sendRawTransaction(rawtransaction, {
        skipPreflight: true,
        maxRetries: 2,
      });

      console.log(`Transaction sent: https://solscan.io/tx/${txid}`);

      await conn.confirmTransaction({
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature: txid,
      });

      console.log(
        `Transaction confirmed for ${tokenMint}: https://solscan.io/tx/${txid}`,
      );

      return true;
    } catch (error: any) {
      console.log(`Error during purchase: ${error.message}`);

      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await sleep(RETRY_DELAY);
        return buyToken(user, tokenMint, solAmount, attempt + 1);
      }
      throw error;
    }
  } catch (error: any) {
    if (attempt < MAX_RETRIES) {
      console.log(
        `Error during purchase (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`,
      );
      await sleep(RETRY_DELAY);
      return buyToken(user, tokenMint, solAmount, attempt + 1);
    }
    throw error;
  }
}

export async function sellToken(
  user: Signer,
  tokenMint: string,
  tokenAmount: string,
  attempt: number = 1,
): Promise<boolean> {
  try {
    try {
      const quoteResponse = await (
        await fetch(
          `https://quote-api.jup.ag/v6/quote?` +
            `inputMint=${tokenMint}` +
            `&outputMint=${SOL_MINT}` +
            `&amount=${tokenAmount}` +
            `&slippageBps=${SLIPPAGE_BPS}`,
        )
      ).json();

      const { swapTransaction } = await (
        await fetch('https://quote-api.jup.ag/v6/swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteResponse,
            userPublicKey: user.publicKey.toString(),
            wrapAndUnwrapSol: true,
            prioritizationFeeLamports: PRIORITY_FEE,
          }),
        })
      ).json();

      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      transaction.sign([user]);

      const conn = await getConnection();
      const latestBlockhash = await conn.getLatestBlockhash();
      const rawtransaction = transaction.serialize();

      const txid = await conn.sendRawTransaction(rawtransaction, {
        skipPreflight: true,
        maxRetries: 2,
      });

      console.log(`Transaction sent: https://solscan.io/tx/${txid}`);

      await conn.confirmTransaction({
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature: txid,
      });

      console.log(
        `Transaction confirmed for ${tokenMint}: https://solscan.io/tx/${txid}`,
      );

      return true;
    } catch (error: any) {
      console.log(`Error during sale: ${error.message}`);

      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await sleep(RETRY_DELAY);
        return sellToken(user, tokenMint, tokenAmount, attempt + 1);
      }
      throw error;
    }
  } catch (error: any) {
    if (attempt < MAX_RETRIES) {
      console.log(
        `Error during sale (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`,
      );
      await sleep(RETRY_DELAY);
      return sellToken(user, tokenMint, tokenAmount, attempt + 1);
    }
    throw error;
  }
}

// export async function sellAllTokens(
//   user: Signer,
//   attempt: number = 1,
// ): Promise<boolean> {
//   try {
//     try {
//       const conn = await getConnection();
//       const tokens = await conn.getParsedTokenAccountsByOwner(user.publicKey, {
//         programId: TOKEN_PROGRAM_ID,
//       });

//       console.log(`Found ${tokens.value.length} tokens in the wallet`);

//       const validTokens = tokens.value.filter(({ account }) => {
//         const tokenInfo = account.data.parsed.info;
//         const tokenAmount = tokenInfo.tokenAmount;
//         const tokenMint = tokenInfo.mint;

//         return (
//           tokenAmount.uiAmount > 0 &&
//           tokenAmount.uiAmount >= MIN_TOKEN_AMOUNT &&
//           tokenMint !== SOL_MINT
//         );
//       });

//       const sellPromises = validTokens.map(({ account }) => {
//         const tokenInfo = account.data.parsed.info;
//         const tokenAmount = tokenInfo.tokenAmount;
//         const tokenMint = tokenInfo.mint;

//         return sellToken(user, tokenMint, tokenAmount);
//       });

//       await Promise.all(sellPromises);
//       return true;
//     } catch (error: any) {
//       console.log(`Error during sale: ${error.message}`);

//       if (attempt < MAX_RETRIES) {
//         console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
//         await sleep(RETRY_DELAY);
//         return sellAllTokens(user, attempt + 1);
//       }
//       throw error;
//     }
//   } catch (error: any) {
//     if (attempt < MAX_RETRIES) {
//       console.log(
//         `Error during sale (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`,
//       );
//       await sleep(RETRY_DELAY);
//       return sellAllTokens(user, attempt + 1);
//     }
//     throw error;
//   }
// }

export async function sellTokenHoldings(
  user: Signer,
  tokenMintsToSell: string[],
  attempt: number = 1,
): Promise<boolean> {
  try {
    try {
      const conn = await getConnection();
      const tokens = await conn.getParsedTokenAccountsByOwner(user.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      console.log(`Found ${tokens.value.length} tokens in the wallet`);

      const validTokens = tokens.value.filter(({ account }) => {
        const tokenInfo = account.data.parsed.info;
        const tokenAmount = tokenInfo.tokenAmount;
        const tokenMint = tokenInfo.mint;

        return (
          tokenAmount.uiAmount > 0 &&
          tokenAmount.uiAmount >= MIN_TOKEN_AMOUNT &&
          tokenMintsToSell.includes(tokenMint)
        );
      });

      if (validTokens.length === 0) {
        console.log(`No valid holdings found for specified token mints`);
        return false;
      }

      const sellPromises = validTokens.map(({ account }) => {
        const tokenInfo = account.data.parsed.info;
        const tokenAmount = tokenInfo.tokenAmount;
        const tokenMint = tokenInfo.mint;

        return sellToken(user, tokenMint, String(tokenAmount.amount));
      });

      await Promise.all(sellPromises);
      return true;
    } catch (error: any) {
      console.log(`Error during sale: ${error.message}`);

      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await sleep(RETRY_DELAY);
        return sellTokenHoldings(user, tokenMintsToSell, attempt + 1);
      }
      throw error;
    }
  } catch (error: any) {
    if (attempt < MAX_RETRIES) {
      console.log(
        `Error during sale (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`,
      );
      await sleep(RETRY_DELAY);
      return sellTokenHoldings(user, tokenMintsToSell, attempt + 1);
    }
    throw error;
  }
}

interface TokenAmount {
  amount: string;
  decimals: number;
  uiAmount: number;
}

interface TokenInfo {
  mint: string;
  owner: string;
  tokenAmount: TokenAmount;
}
