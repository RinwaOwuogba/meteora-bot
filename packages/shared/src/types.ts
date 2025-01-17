import { PublicKey } from '@solana/web3.js';

export interface Wallet {
  publicKey: PublicKey;
  payer: any;
  description: string;
}
