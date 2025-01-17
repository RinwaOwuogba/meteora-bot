import { InlineKeyboardButton } from "node-telegram-bot-api";

export const mainMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "📊 Overview", callback_data: "overview" }],
      [{ text: "👛 Wallet Management", callback_data: "wallet_menu" }],
      [{ text: "⚙️ Settings", callback_data: "settings" }],
    ],
  },
};

export const walletMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "💰 Show Balance", callback_data: "wallet_balance" }],
      [{ text: "🔑 Show Private Key", callback_data: "wallet_key" }],
      [{ text: "➕ Create New Wallet", callback_data: "wallet_create" }],
      [{ text: "❌ Delete Wallet", callback_data: "wallet_delete" }],
      [{ text: "⬅️ Back to Main Menu", callback_data: "main_menu" }],
    ],
  },
};

export const confirmationKeyboard = (action: string) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: "✅ Confirm", callback_data: `confirm_${action}` },
        { text: "❌ Cancel", callback_data: "cancel" },
      ],
    ],
  },
});
