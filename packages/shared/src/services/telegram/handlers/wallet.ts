import TelegramBot from 'node-telegram-bot-api';
import { Database } from '@/db/types';
import { Kysely } from 'kysely';
import { MenuState, UserSession } from '../types';
import {
  confirmationKeyboard,
  getWalletMenuKeyboard,
} from '../keyboards/main-menu';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { getConnection } from '@/config/config';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';

export const registerWalletHandlers = (
  bot: TelegramBot,
  db: Kysely<Database>,
  userSessions: Map<number, UserSession>,
  adminIds: Set<number>,
) => {
  const getWallet = async (userId: string) => {
    return await db
      .selectFrom('wallets')
      .select(['wallet_address'])
      .where('telegram_id', '=', userId)
      .executeTakeFirst();
  };

  bot.on('callback_query', async (query) => {
    if (!query.message || !query.from.id || !query.data) return;

    const chatId = query.message.chat.id;
    const userId = query.from.id.toString();
    const messageId = query.message.message_id;
    const action = query.data;

    console.log('chatId', chatId);
    console.log('userId', userId);

    try {
      const wallet = await getWallet(userId);
      const hasWallet = !!wallet;

      switch (action) {
        case 'wallet_balance':
          if (!hasWallet) {
            await bot.answerCallbackQuery(query.id, {
              text: "❌ You don't have a wallet yet!",
              show_alert: true,
            });
            return;
          }

          const connection = await getConnection();
          const publicKey = new PublicKey(wallet.wallet_address);
          const balance = await connection.getBalance(publicKey);
          const solBalance = balance / LAMPORTS_PER_SOL;

          await bot.sendMessage(
            chatId,
            `💰 Your wallet balance:\n\n${solBalance} SOL\nAddress: ${wallet.wallet_address}`,
          );
          break;

        case 'wallet_key':
          if (!hasWallet) {
            await bot.answerCallbackQuery(query.id, {
              text: "❌ You don't have a wallet yet!",
              show_alert: true,
            });
            return;
          }

          // For private key, we should first show a confirmation dialog
          await bot.sendMessage(
            chatId,
            '⚠️ Are you sure you want to view your private key? Never share this with anyone!',
            confirmationKeyboard('show_key'),
          );
          break;

        case 'confirm_show_key':
          if (!hasWallet) return;

          const walletData = await db
            .selectFrom('wallets')
            .select(['meta_data'])
            .where('telegram_id', '=', userId)
            .executeTakeFirst();

          if (walletData?.meta_data) {
            const metadata = JSON.parse(`{}`);
            // const metadata = JSON.parse(walletData.meta_data);
            await bot.sendMessage(
              chatId,
              `🔑 Your private key:\n\n\`${metadata.privateKey}\`\n\n⚠️ Never share this with anyone!`,
              { parse_mode: 'Markdown' },
            );
          }
          break;

        case 'wallet_create':
          if (hasWallet) {
            await bot.answerCallbackQuery(query.id, {
              text: '❌ You already have a wallet!',
              show_alert: true,
            });
            return;
          }

          const newWallet = Keypair.generate();
          const privateKey = bs58.encode(newWallet.secretKey);

          await db
            .insertInto('wallets')
            .values({
              user_id: 1,
              telegram_id: userId,
              wallet_address: newWallet.publicKey.toString(),
              meta_data: JSON.stringify({
                privateKey,
                created_at: new Date().toISOString(),
              }),
            })
            .execute();

          await bot.sendMessage(
            chatId,
            `✅ New Solana wallet created!\n\nAddress: \`${newWallet.publicKey.toString()}\``,
            { parse_mode: 'Markdown' },
          );

          // Update the wallet menu
          await bot.editMessageText('Wallet Management:', {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: getWalletMenuKeyboard(true).reply_markup,
          });
          break;

        case 'wallet_delete':
          if (!hasWallet) {
            await bot.answerCallbackQuery(query.id, {
              text: "❌ You don't have a wallet to delete!",
              show_alert: true,
            });
            return;
          }

          await bot.sendMessage(
            chatId,
            '⚠️ Are you sure you want to delete your wallet? This action cannot be undone!',
            confirmationKeyboard('delete_wallet'),
          );
          break;

        case 'confirm_delete_wallet':
          if (!hasWallet) return;

          await db
            .deleteFrom('wallets')
            .where('wallets.telegram_id', '=', userId)
            .execute();

          await bot.sendMessage(chatId, '✅ Your wallet has been deleted.');

          // Update the wallet menu
          await bot.editMessageText('Wallet Management:', {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: getWalletMenuKeyboard(false).reply_markup,
          });
          break;

        case 'cancel':
          await bot.deleteMessage(chatId, messageId);
          break;
      }
    } catch (error) {
      console.error('Error in wallet handler:', error);
      await bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
    }
  });
};
