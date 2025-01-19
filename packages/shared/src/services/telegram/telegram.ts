import TelegramBot from 'node-telegram-bot-api';
import { Database } from '@/db/types';
import { Kysely } from 'kysely';
import {
  mainMenuKeyboard,
  getWalletMenuKeyboard,
} from './keyboards/main-menu';
import { MenuState, UserSession } from './types';
import { registerWalletHandlers } from './handlers/wallet';
import {
  TELEGRAM_ADMIN_IDS,
  TELEGRAM_BOT_TOKEN,
} from '@/config/config';

export class TelegramService {
  private bot: TelegramBot;
  private db: Kysely<Database>;
  private userSessions: Map<number, UserSession> = new Map();
  private readonly adminIds: Set<number>;

  constructor(db: Kysely<Database>) {
    this.db = db;
    this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    this.adminIds = new Set(
      (TELEGRAM_ADMIN_IDS || '')
        .split(',')
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id)),
    );

    this.initializeBot();
  }

  private initializeBot() {
    // Register message handlers
    this.bot.onText(/\/start/, this.handleStart.bind(this));
    this.bot.on('callback_query', this.handleCallbackQuery.bind(this));

    // Register other handlers
    registerWalletHandlers(this.bot, this.db, this.userSessions, this.adminIds);

    console.log('Telegram bot initialized');
  }

  private async handleStart(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) {
      return;
    }

    // Initialize user session
    this.userSessions.set(userId, { menuState: MenuState.MAIN });

    // Check if user exists in database
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'telegram_id'])
      .where('telegram_id', '=', userId.toString())
      .executeTakeFirst();

    if (!user) {
      // Create new user
      await this.db
        .insertInto('users')
        .values({
          telegram_id: userId.toString(),
          telegram_username: msg.from?.username || null,
          is_admin: this.adminIds.has(userId) ? 1 : 0,
          meta_data: JSON.stringify({}),
        })
        .execute();
    }

    // Send welcome message with main menu
    await this.bot.sendMessage(
      chatId,
      '👋 Welcome to Meteora Bot!\n\nPlease select an option:',
      mainMenuKeyboard,
    );
  }

  private async handleCallbackQuery(query: TelegramBot.CallbackQuery) {
    if (!query.message || !query.from.id) {
      return;
    }

    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const action = query.data;

    if (!action) {
      return;
    }

    const session = this.userSessions.get(userId) || {
      menuState: MenuState.MAIN,
    };

    try {
      switch (action) {
        case 'wallet_menu':
          session.menuState = MenuState.WALLET;
          const hasWallet = !!(await this.db
            .selectFrom('wallets')
            .select(['id', 'telegram_id'])
            .where('telegram_id', '=', userId.toString())
            .executeTakeFirst());

          await this.bot.editMessageText('Wallet Management:', {
            chat_id: chatId,
            message_id: query.message.message_id,
            reply_markup: getWalletMenuKeyboard(hasWallet).reply_markup,
          });
          break;

        case 'main_menu':
          session.menuState = MenuState.MAIN;
          await this.bot.editMessageText('Main Menu:', {
            chat_id: chatId,
            message_id: query.message.message_id,
            reply_markup: mainMenuKeyboard.reply_markup,
          });
          break;

        // Add more cases for other actions
      }

      this.userSessions.set(userId, session);
    } catch (error) {
      console.error('Error handling callback query:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ An error occurred. Please try again.',
      );
    }
  }

  public getBot(): TelegramBot {
    return this.bot;
  }
}
