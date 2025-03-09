# What is this supposed to be?

This was supposed to be a project that:

1. Fetched liquidity pool and token analytics.
2. Utilized that data to train an ML model which would then be able to generate signals for events like add liquidity, remove liquidity etc
3. Those signals would then be feed to a automated system to carry out the actions.

# What it is

Unfortunately, it proven out of my current technical depth. So it's fallen into being a data scraper and a simple frontend for displaying that data.

# Notes

- https://github.com/sectordot/MeteoraManager
  The logic for taking on chain actions ie adding, removing liquidity, swapping tokens was copied from here
- https://github.com/GeekLad/meteora-discord-bot/
  The logic for finding liquidity pools and performing some initial analysis was copied from here.

# Future plans?

No clue. If you found this, have fun.

## Structure

The monorepo uses pnpm workspaces to manage multiple applications that share common code. The `packages/shared` directory contains core functionality used by all apps, including database operations, blockchain interactions, and business logic. Each app in the `apps/` directory serves a specific purpose: `data-miner` collects market data, `telegram-bot` provides user interaction, `ui` delivers a web dashboard, and `server` exposes API endpoints.

Development scripts in the root `package.json` simplify working with apps: `dev:tg` runs the Telegram bot, `dev:dm` runs the data miner, `dev:ui` starts the web dashboard, and `dev:server` launches the API server. Each script automatically watches for changes and rebuilds as needed.

For deployment, the `monorepo-deploy.sh` script enables deployment of individual apps to Dokku by creating a temporary Git worktree containing only the relevant app and pushing it to the specified remote.

## Project Structure

This is a monorepo built with pnpm workspaces, organized as follows:
meteora-bot-monorepo/
├── apps/
│ ├── data-miner/ # Service for collecting and analyzing market data
│ ├── misc/ # Utility scripts and tools
│ ├── server/ # API server for the UI
│ ├── telegram-bot/ # Telegram interface for users
│ └── ui/ # Web dashboard built with React
└── packages/
└── shared/ # Core shared functionality
├── db/ # Database operations
├── lib/ # Utility libraries
├── services/ # Business logic
│ ├── data-engine/ # Data processing
│ ├── dexscreener/ # DexScreener integration
│ ├── jupiter/ # Jupiter integration
│ ├── meteora/ # Meteora DLMM interactions
│ ├── swap/ # Token swap functionality
│ └── telegram/ # Telegram bot services
└── utils/ # Helper utilities

## Core Technologies

- **Blockchain**: Solana, @solana/web3.js, @meteora-ag/dlmm, @coral-xyz/anchor
- **Database**: Kysely with SQLite (local) and PostgreSQL (production)
- **User Interface**: React, TanStack Router, TanStack Query, Shadcn/UI, Tailwind CSS
- **Data Collection**: Custom data indexing from Meteora and DexScreener
- **User Interaction**: Node-Telegram-Bot-API for Telegram integration + Web dashboard

## Setup Instructions

### Prerequisites

- Node.js 16+
- pnpm 9.0.5+
- PostgreSQL database (for production)

### Environment Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/rinwaowuogba/meteora-bot-monorepo.git
   cd meteora-bot-monorepo
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory of the respective app with the following variables:

   ```
   PRIVATE_KEY=your_solana_wallet_private_key
   DB_URL=your_database_connection_string
   DATA_DIR=path_to_store_collected_data
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

4. Build the project:

   ```bash
   pnpm build
   ```

5. Run the desired application:
   - **Data Miner**: `pnpm run dev:dm`
   - **Telegram Bot**: `pnpm run dev:tg`
   - **Web UI**: `pnpm run dev:ui`
   - **API Server**: `pnpm run dev:server`

## Deployment

The project includes a deployment script for Dokku:

```bash
./scripts/monorepo-deploy.sh app-name [remote-name]
```

This will deploy a specific app from the monorepo to your Dokku instance.
