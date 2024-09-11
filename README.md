# `@ubiquity-os/telegram-bot`

A dual-architecture Telegram bot for Ubiquity OS, uniquely combining Cloudflare Workers and GitHub Actions to deliver seamless integration with both Telegram and GitHub. This hybrid plugin is the first of its kind to support both worker and workflow functionality, running across Cloudflare V8 and Node.js environments for enhanced flexibility and performance across multiple runtimes.

## Table of Contents

- [High-Level Overview](#high-level-overview)
  - [Architecture Breakdown](#architecture-breakdown)
    - [Telegram Bot Components](#telegram-bot-components)
    - [Ubiquity OS Plugin](#ubiquity-os-plugin)
    - [Worker Instance](#worker-instance)
    - [Workflow Instance](#workflow-instance)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Supabase Configuration](#supabase-configuration)
    - [Telegram Configuration](#telegram-configuration)
    - [GitHub Configuration](#github-configuration)
  - [Usage](#usage)
  - [Commands](#commands)
- [Repository Structure](#repository-structure)
- [Considerations](#considerations)

## High-Level Overview

This bot operates in two parts:

- **Bot API**: Hosted on Cloudflare Workers, interacts with the Telegram Bot API.
- **Client API**: Runs in a Node.js environment (GitHub Actions) and interacts with the MTProto API via a Telegram User account.

### Architecture Breakdown

#### Telegram Bot Components

- **Worker Instance**: Runs Bot API methods on Cloudflare Workers. Handles bot commands, events, and chat interactions using a Telegram Bot created via BotFather.
- **Client Instance**: Runs Client API methods on GitHub Actions, responsible for features unavailable to the bot, like creating groups or sending messages as a user.

#### Ubiquity OS Plugin

- **Worker Plugin**: This is a worker plugin with workflow capabilities, allowing it to run on both Cloudflare Workers and GitHub Actions.
- **Actions as a Feature**: By forwarding worker requests to the workflows, we enable collaboration between the two, maximizing functionality.
- **Hybrid Architecture**: Combines the best of both worlds, leveraging Cloudflare Workers for speed and GitHub Actions for long-running features or those that require a Node.js environment.
- **Bridges the Gap**: Connects our GitHub events to our Telegram bot instantaneously, enabling real-time interactions and seamless integration.

### Worker Instance

1. **Hono App**: Handles webhook payloads from Telegram, manages bot commands and event reactions.
2. **GrammyJS**: Utilizes GrammyJS for interacting with the Telegram Bot API, responsible for sending/editing messages, handling commands, and more. Learn more [here](https://grammy.dev).

### Workflow Instance

1. **NodeJS Server**: Handles tasks beyond the bot’s capabilities, such as managing Telegram groups or sending direct messages.
2. **GramJS**: Built on top of [Telethon](https://docs.telethon.dev/en/stable/), interacts with the MTProto API for more advanced Telegram functionalities. Learn more [here](https://gram.js.org/beta/).

## Getting Started

### Prerequisites

- Personal Telegram account
- Telegram Bot Token (via BotFather)
- Ubiquity OS Kernel

### Installation

#### Environment Variables

Define these in both `dev.vars` and your GitHub repository secrets:

```bash
BOT_TOKEN=123:xyz               # Telegram Bot Token from BotFather
BOT_WEBHOOK=...                 # Cloudflare Worker URL
BOT_WEBHOOK_SECRET=...          # Cloudflare Worker Secret
BOT_ADMINS=[1234,5678]          # Telegram User IDs
SUPABASE_URL=...                # Supabase URL
SUPABASE_SERVICE_KEY=...        # Supabase Service Key
TELEGRAM_APP_ID=12345678        # Telegram App ID
TELEGRAM_API_HASH=...           # Telegram API Hash
APP_PRIVATE_KEY=...             # GitHub App Private Key
APP_ID=123456                   # GitHub App ID
```

#### Supabase Configuration

1. Create or use an existing Supabase project.
2. Copy and run the SQL migration file from `./supabase/migrations` in the Supabase dashboard.
3. Add your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to your environment variables.

#### Telegram Configuration

1. Create a new bot using [BotFather](https://t.me/BotFather).
2. Add your `BOT_TOKEN`, `TELEGRAM_APP_ID`, `TELEGRAM_API_HASH`, and `BOT_ADMINS` to the environment variables.
3. Use [Smee.io](https://smee.io/new) to create a webhook and add the URL as `BOT_WEBHOOK`.
4. Generate a secret for `BOT_WEBHOOK_SECRET` to verify webhook requests.

#### GitHub Configuration

1. Ensure your Ubiquity OS Kernel is set up.
2. Add `APP_PRIVATE_KEY` and `APP_ID` to your environment variables.
3. Configure the plugin in your private organization’s repository:

```yaml
- uses:
    - plugin: http://localhost:3000
      runsOn: ["issues.opened", "issues.labeled", "issues.reopened", "issues.closed"]
      skipBotEvents: false
      with:
        botId: 00000000
        botUsername: yourBotName
```

### Usage

1. Follow each part of the environment setup to configure your bot.
2. Start your Ubiquity OS Kernel with the plugin installed in your repository.
3. Run `yarn sms-auth` to authenticate your personal Telegram account with MTProto.
4. Start the worker instance with `yarn worker`.
5. In another terminal, run `smee -u https://smee.io/your-webhook-url -P "/webhook"` to receive Telegram webhook payloads locally.
6. Interact with the bot in Telegram chats or trigger GitHub webhooks as defined in `manifest.json`.

### Commands

TODO: Commands are not fully implemented yet. A couple of helper commands for obtaining IDs etc are available.

## Repository Structure

```plaintext
.
├── .github/                    # GitHub Actions workflows (CI/CD, not for workflow-function logic)
├── manifest.json               # Plugin manifest for Ubiquity OS Kernel
├── supabase/                   # SQL migration files for Supabase schema
├── src/                        # Source code
│   ├── adapters/               # Storage adapters (e.g., Supabase integrations)
│   ├── bot/                    # Core Telegram bot functionality (Worker and Workflow)
│   │   ├── features/           # Bot features, including commands and event handlers
│   │   ├── filters/            # Grammy filters (e.g., isAdmin, isPrivateChat)
│   │   ├── handlers/           # Stateful command handlers based on chat types or user privileges
│   │   ├── helpers/            # Utility functions like logging and custom Grammy contexts
│   │   ├── middlewares/        # Middleware functions (e.g., rate limiting, session management)
│   │   ├── mtproto-api/        # MTProto API client for advanced Telegram features
│   │   │   ├── bot/            # MTProto API session management, 2FA auth scripts, Telegram client setup
│   │   │   ├── workrooms/      # A collection of Workflow-functions leveraging MTProto API
│   │   ├── index/              # Bot initialization, where commands and features are registered
│   ├── handlers/               # General plugin handlers (e.g., GitHub API functions, webhook processing)
│   ├── server/                 # Hono app for managing Cloudflare Worker instance of the bot
│   ├── types/                  # Typebox schemas, TypeScript types, Singleton classes
│   ├── utils/                  # General utility functions and helpers
│   ├── worker.ts               # Main entry point, routes events (GitHub or Telegram) to appropriate handlers
│   ├── plugin.ts               # GitHub event handler, forwards events to `workflow-entry.ts` or processes them
│   ├── workflow-entry.ts       # Handles forwarded GitHub events, MTProto API interactions, and workflow logic
```

## Considerations

The bot has two "branches" due to Cloudflare Workers' limitations in handling long-running processes. The **Worker** handles most bot commands and API interactions, while the **Workflow** manages features the bot cannot perform.

Most functionality is handled by the **Bot API**; the **Client API** is only used for advanced tasks. Due to the nature of the MTProto API, the owner of the personal account must run `yarn sms-auth` to authenticate the bot once, after which it can run uninterrupted. It is not fool-proof and it can be "knocked out" by erroneous auth replacement ceremonies.
