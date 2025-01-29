# Smart 🦊 Solana Arbitrage Bot 🤖

## Description

Smart Solana Arbitrage Bot is a sophisticated arbitrage trading bot designed to operate on the Solana blockchain. Built using TypeScript, this bot intelligently monitors multiple decentralized exchanges (DEXs) including Raydium, Meteora, Orca, and Fluxbeam to identify and capitalize on profitable arbitrage opportunities in real-time.

## Features

⚡️ Multi-DEX Integration\
⚡️ Real-Time Price Monitoring\
⚡️ Fast Execution\
⚡️ Customizable Parameters\
⚡️ Risk Management

## How to set this bot 🔧

#### Start bot

Enter `/start` to start and create your wallet.

```
/start
```

This command registers you and creates your own wallet to use this bot.

#### Set configuration to control the bot actions

Enter `/setting` command or click setting button

```
/setting
```

If so, there are buttons to set the parameters to use this bot.

1. Click `Wallet (...)` button to see the wallet address and private key.

2. Click `Amount: ... SOL` button to set the amount for trade.

3. Click `Priority Fee: ... lamport` button to set the fee for executing transaction.

4. Click `Jito Fee: ...` button to set the jito fee.

5. Click `Slippage Bps: ...` button to set the slippage.\
**Note** `1 slippage Bps = 0.01%`

#### Save the token list you want to trade.

Copy the token list on ./config/tokens.ts file in the following format.

```bash
{
    address: 'Address of token',
},
```

#### Start arbitrage

Enter `/arbitrage` command to start trade.

```
/arbitrage
```

---

## Getting Started 🚀

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites 📋

You'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [NPM](http://npmjs.com)) installed on your computer.

```
node@22.3.0 or higher
npm@10.8.1 or higher
git@2.45.1 or higher
```

Also, you can use [Yarn](https://yarnpkg.com/) instead of NPM ☝️

```
yarn@v1.22.10 or higher
```

---

### Creating a bot 🤖

[<img src="img/botfather.png" width="400"/>](img/botfather.png)

1. Search for the BotFather.

2. Send the message `/start` to the BotFather.

3. Send `/newbot`.

4. Give the bot a name e.g `testing_xyz`.

5. Give the bot a username `testing_xyz_bot`.

6. Now capture the HTTP API token it's very important!

7. Copy API token into `.env` file.

8. Now search for the bot name `testing_xyz` and send a message to the bot contact.

Using NPM: Simply run the below commands.

```bash
# Install dependencies
$ npm install

# Start the development server
$ npm run dev
```

Using Yarn: Be aware of that you'll need to delete the `package-lock.json` file before executing the below commands.

```bash
# Install dependencies
$ yarn

# Start the development server
$ yarn start
```

**NOTE**:
If your run into issues installing the dependencies with NPM, use this below command:

```bash
# Install dependencies with all permissions
$ sudo npm install --unsafe-perm=true --allow-root
```