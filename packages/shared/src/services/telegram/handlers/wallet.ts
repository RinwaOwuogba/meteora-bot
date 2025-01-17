import TelegramBot from "node-telegram-bot-api";
import { Database } from "@/db/types";
import { Kysely } from "kysely";
import { UserSession } from "../types";
import { confirmationKeyboard } from "../keyboards/main-menu";
import { getConnection } from "@/config/config";
import { Keypair } from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

export function registerWalletHandlers(
  bot: TelegramBot,
  db: Kysely<Database>,
  userSessions: Map<number, UserSession>,
  adminIds: Set<number>
) {
  bot.on("callback_query", async (query) => {
    if (!query.message || !query.from.id || !query.data) {
      return;
    }

    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const action = query.data;

    if (!adminIds.has(userId)) {
      await bot.answerCallbackQuery(query.id, {
        text: "⚠️ You do not have permission to perform this action.",
        show_alert: true,
      });
      return;
    }

    try {
      switch (action) {
        case "wallet_balance":
          await handleWalletBalance(bot, chatId, userId);
          break;

        case "wallet_create":
          await handleWalletCreate(bot, db, chatId, userId);
          break;

        case "wallet_key":
          await handleShowPrivateKey(
            bot,
            chatId,
            userId,
            query.message.message_id
          );
          break;

        // Add more wallet-related handlers
      }
    } catch (error) {
      console.error("Error in wallet handler:", error);
      await bot.sendMessage(
        chatId,
        "❌ An error occurred while processing your request."
      );
    }
  });
}

async function handleWalletBalance(
  bot: TelegramBot,
  chatId: number,
  userId: number
) {
  const conn = await getConnection();
  // Get wallet from database and fetch balance
  // This is a placeholder - implement actual wallet balance fetching
  const balance = 0;

  await bot.sendMessage(chatId, `💰 Current Balance: ${balance} SOL`, {
    parse_mode: "Markdown",
  });
}

async function handleWalletCreate(
  bot: TelegramBot,
  db: Kysely<Database>,
  chatId: number,
  userId: number
) {
  const newWallet = Keypair.generate();

  // Store wallet in database
  await db
    .insertInto("wallets")
    .values({
      user_id: userId,
      wallet_address: newWallet.publicKey.toString(),
      meta_data: JSON.stringify({
        created_at: new Date().toISOString(),
      }),
    })
    .execute();

  await bot.sendMessage(
    chatId,
    `✅ New wallet created!\n\nAddress: \`${newWallet.publicKey.toString()}\``,
    {
      parse_mode: "Markdown",
    }
  );
}

async function handleShowPrivateKey(
  bot: TelegramBot,
  chatId: number,
  userId: number,
  messageId: number
) {
  await bot.editMessageText(
    "⚠️ Warning: Never share your private key with anyone!\n\nAre you sure you want to view it?",
    {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: confirmationKeyboard("show_key").reply_markup,
    }
  );
}
