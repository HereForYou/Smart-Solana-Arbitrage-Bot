import dotenv from 'dotenv';
dotenv.config({
  path: './.env',
});

import { SOL_ADDRESS, SOL_DECIMAL, bot } from './config/config';
import { User } from './models/user.model';
import { checkTimeFormat } from './utils/functions';
import { settingText } from './models/text.model';
import { settingMarkUp } from './models/markup.model';
import { checkAction } from './utils/middleware';
import { startCommand, helpCommand, settingCommand, setCommands } from './commands/commands';
import {
  generateWalletFromKey,
  getBalanceOfWallet,
  getTokenBalanceOfWallet,
  getTokenInfo,
  swapTokens,
} from './utils/web3';
import { getTokenPriceOnRaydium, getTokenPriceUsingDexScreener } from './utils/price';
import { tokens } from './config/tokens';
import { settingAction, closeAction, returnAction, helpAction } from './actions/general.action';
import { walletAction, onOffAction, inputAction, importWalletAction } from './actions/setting.action';
import { isTradable } from './utils/jupiter';

let loop = false;

//-------------------------------------------------------------------------------------------------------------+
//                                             Set the commands                                                |
//-------------------------------------------------------------------------------------------------------------+

bot.command('arbitrage', async (ctx) => {
  const tgId = ctx.chat.id;
  try {
    const user = await User.findOne({ tgId });
    if (!user) {
      await ctx.reply('I can not find you. Please input /start command to let me verify you.');
      return;
    }
    if (!user?.wallet.privateKey) {
      await ctx.reply('Please import your wallet and then try again.\n/setting');
      return;
    }
    if (user.snipeAmount < 0.01 || user.priorityFee < 0.000005 || user.slippageBps === 0) {
      await ctx.reply(
        `Please set up the bot correctly.\n` +
          `Amount must be greater than 0.01.\n` +
          `Priority fee must be greater than 5000.\n` +
          `Slippage Bps must be greater than 0.\n` +
          `Jito fee must be greater than 0.001.`
      );
      return;
    }
    if (user.snipeAmount < 0.02) {
      await ctx.reply('Trade amount is too small to make a profit.\nSet the amount at least 0.02 SOL.');
      return;
    }
    // const solAmount = await getBalanceOfWallet(user.wallet.publicKey);
    // if (solAmount < user.snipeAmount * SOL_DECIMAL + user.priorityFee * 2 + 0.02 * SOL_DECIMAL) {
    //   await ctx.reply('Insufficient balance. Please top up your wallet.');
    //   return;
    // }
    loop = true;
    // let prevTime = Date.now();
    // Looping all tokens
    while (loop) {
      for (const token of tokens) {
        // Get the highest and lowest prices through multiple dexes
        const pools = await getTokenPriceUsingDexScreener(token);
        console.log('pools:', pools);

        // If there is one or no pool or max price equals min price
        if (!pools) {
          console.log(`There is no or one pool or the diff of prices is too low with this token ${token.address}`);
          await ctx.reply('There is no pool that the total liquidity is greater than 10K for this token.');
          continue;
        }

        // Get token metadata
        const tokenInfo = await getTokenInfo(token.address);

        if (pools.numOfPools <= 1 || pools.min.priceUsd === pools.max.priceUsd) {
          console.log(`There is no or one pool or the diff of prices is too low with this token ${token.address}`);
          await ctx.reply('There is no or one pool that the total liquidity is greater than 10K for this token');
          continue; // Skip to the next token
        }

        if (pools.min.priceUsd * 1.01 > pools.max.priceUsd) {
          await ctx.reply(`The difference between max and min price is too low to get profit.`);
          continue;
        }

        await ctx.reply(
          `Token: ${tokenInfo?.name}/${tokenInfo?.symbol}\n` +
            `____________________\n` +
            `BuyPrice: $${pools.min.priceUsd}\n` +
            `Dex: ${pools.min.dexId}\n` +
            `____________________\n` +
            `Sell Price: $${pools.max.priceUsd}\n` +
            `Dex: ${pools.max.dexId}`
        );

        const isEnableToBuy = await isTradable(
          SOL_ADDRESS,
          token.address,
          user.snipeAmount * SOL_DECIMAL,
          pools.min.dexName
        );

        const isEnableToSell = await isTradable(
          token.address,
          SOL_ADDRESS,
          user.snipeAmount * SOL_DECIMAL,
          pools.max.dexName
        );

        if (!isEnableToBuy || !isEnableToSell) {
          if (!isEnableToBuy) {
            console.log(`This token is not possible to buy on ${pools.min.dexName}`);
            await ctx.reply(`This token is not possible to buy on ${pools.min.dexName}`);
          } else {
            console.log(`This token is not possible to sell on ${pools.max.dexName}`);
            await ctx.reply(`This token is not possible to sell on ${pools.max.dexName}`);
          }
          continue;
        }

        // let pendingMsg = await ctx.reply('The purchase transaction is pending...');

        // Purchase the tokens
        // const buyResult = await swapTokens(
        //   SOL_ADDRESS,
        //   token.address,
        //   user.snipeAmount * SOL_DECIMAL,
        //   user.wallet.privateKey.toString(),
        //   user.priorityFee,
        //   user.jitoFee,
        //   user.slippageBps,
        //   pools.min.dexName
        // );
        // console.log('buy result:', buyResult);

        // // If the purchase is successful
        // if (buyResult.success) {
        //   const tokenBalance = await getTokenBalanceOfWallet(user.wallet.publicKey.toString(), token.address);
        //   await ctx.deleteMessage(pendingMsg.message_id);
        //   await ctx.reply(
        //     `Buy Success\nUsed ${buyResult.solDiff / SOL_DECIMAL} SOL\nGot ${
        //       (buyResult.outAmount || 0) / (tokenInfo?.decimals || 1e9)
        //     } ${tokenInfo?.symbol}`
        //   );
        //   pendingMsg = await ctx.reply('Sale transaction is pending...');
        //   let times = 0;

        //   // Looping until the sale is successful
        //   while (true) {
        //     const sellResult = await swapTokens(
        //       token.address,
        //       SOL_ADDRESS,
        //       tokenBalance || buyResult.outAmount || 0,
        //       user.wallet.privateKey.toString(),
        //       user.priorityFee,
        //       user.jitoFee,
        //       user.slippageBps,
        //       pools.max.dexName
        //     );
        //     console.log('sell result:', sellResult);

        //     // If the sale is successful
        //     if (sellResult.success) {
        //       // const pl = (Math.abs(sellResult.solDiff) - Math.abs(buyResult.solDiff)) / SOL_DECIMAL;
        //       await ctx.deleteMessage(pendingMsg.message_id);
        //       // await ctx.reply(`Sell success!\nGot ${sellResult.solDiff / SOL_DECIMAL} SOL\n P/L: ${pl}`);
        //       await ctx.reply(`Sell success!`);
        //       break; // Exit the loop after successful sale
        //     } else if (times < 5) {
        //       times += 1;
        //     } else {
        //       await ctx.reply('Your sale transaction has failed. Please increase the priority fee.');
        //       break; // Exit the loop after 5 attempts
        //     }
        //   }
        // } else {
        //   await ctx.deleteMessage(pendingMsg.message_id);
        //   await ctx.reply(
        //     buyResult.message || 'Your purchase transaction has failed. Please increase the priority fee.'
        //   );
        //   break;
        // }
      }
    }
  } catch (error) {
    console.error(error);
  }
});

bot.command('price', async (ctx) => {
  try {
    const price = await getTokenPriceOnRaydium();
    console.log(price);
    await ctx.reply(price?.toString() || 'Something went wrong.');
  } catch (error) {
    console.error(error);
  }
});

bot.command('stop', async (ctx) => {
  try {
    loop = false;
    await ctx.reply('Arbitrage is successfully stopped.');
  } catch (error) {
    console.error(error);
  }
});

/**
 * The part to handle when 'start' command is inputted
 */
bot.command('start', startCommand);

/**
 * The part to handle when 'help' command is inputted
 */
bot.command('help', helpCommand);

/**
 * The part to handle when 'setting' command is inputted
 */
bot.command('setting', settingCommand);

//-------------------------------------------------------------------------------------------------------------+
//                                   The part to listen the messages from bot                                  |
//-------------------------------------------------------------------------------------------------------------+

bot.on('text', async (ctx) => {
  const botState = ctx.session.state;
  const text = ctx.message.text;
  const tgId = ctx.chat.id;
  try {
    const user = await User.findOne({ tgId });
    if (!user) {
      throw new Error('User not found');
    }
    if (
      botState === 'Snipe Amount' ||
      botState === 'Jito Fee' ||
      botState === 'Priority Fee' ||
      botState === 'Slippage'
    ) {
      if (botState === 'Snipe Amount') user.snipeAmount = Number(text);
      else if (botState === 'Priority Fee') user.priorityFee = Number(text);
      else if (botState === 'Slippage') user.slippageBps = Number(text);
      else user.jitoFee = Number(text);
      await user.save();
      await ctx.reply(settingText, await settingMarkUp(user));
      ctx.session.state = '';
    } else if (/(Start|Stop) Time/.test(botState as string)) {
      const { ok } = checkTimeFormat(text);
      if (ok === false) {
        await ctx.reply('Invalid time format. Please enter in this format <code>00:00</code>', { parse_mode: 'HTML' });
        return;
      }
      const [hour, minute] = text.split(':');
      const time = hour.trim().padStart(2, '0') + ':' + minute.trim().padStart(2, '0');
      if (botState.split(' ')[0] === 'Start') {
        const [stopHour, stopMin] = user.stopAt.split(':');
        if (
          Number(hour) > Number(stopHour) ||
          (Number(hour) == Number(stopHour) && Number(minute) >= Number(stopMin))
        ) {
          await ctx.reply('Invalid time! start time must be less than stop time');
          return;
        }
        user.startAt = time;
      } else {
        user.stopAt = time;
      }
      await user.save();
      await ctx.reply(settingText, await settingMarkUp(user));
    } else if (botState === 'Import Wallet') {
      const wallet = await generateWalletFromKey(text);
      if (wallet.privateKey) {
        user.wallet.publicKey = wallet?.publicKey || '';
        user.wallet.privateKey = wallet?.privateKey || '';
        user.wallet.amount = 0;
        await ctx.deleteMessage(ctx.message.message_id);
        await user.save();
        await ctx.reply(settingText, await settingMarkUp(user));
      } else {
        console.log('Error', wallet.message);
        await ctx.reply(wallet.message);
      }
    } else {
      if (text.startsWith('/')) {
        ctx.reply('⚠️ Unrecognizable commands. Input /help to see the help.');
        return;
      }
    }
  } catch (error) {
    console.error('Error while on text:', error);
  }
});

//-------------------------------------------------------------------------------------------------------------+
//                                             Set the actions                                                 |
//-------------------------------------------------------------------------------------------------------------+

//---------------------------------------------------------------------+
//                         General Actions                             |
//---------------------------------------------------------------------+

/**
 * Catch the action when user clicks the 'Close' callback button
 */
bot.action('Close', (ctx, next) => checkAction(ctx, next, 'Close'), closeAction);

//---------------------------------------------------------------------+
//                      Actions on Start page                          |
//---------------------------------------------------------------------+

/**
 * Catch the action when user clicks the 'Start' callback button
 */
bot.action('Help', (ctx, next) => checkAction(ctx, next, 'Help'), helpAction);

/**
 * Catch the action when user clicks the 'Setting' callback button
 */
bot.action('Setting', (ctx, next) => checkAction(ctx, next, 'Setting'), settingAction);

//---------------------------------------------------------------------+
//                       Actions on Setting page                       |
//---------------------------------------------------------------------+

/**
 * Catch the action when user clicks the '💳 Wallet' callback button
 */
bot.action('Wallet', (ctx, next) => checkAction(ctx, next, 'Wallet'), walletAction);

//---------------------------------------------------------------------+
//                        Actions on Wallet page                       |
//---------------------------------------------------------------------+

/**
 * Catch the action when user clicks the '💳 Wallet' callback button
 */
bot.action('Import Wallet', (ctx, next) => checkAction(ctx, next, 'Import Wallet'), importWalletAction);

/**
 * Catch the action when user clicks the 'Bot On 🟢 || Bot Off 🔴' callback button
 */
bot.action('On Off', onOffAction);

/**
 * Catch the action when user clicks the '💵 Snipe Amount: * SOL' callback button
 */
bot.action(/Snipe Amount|Jito Fee|Priority Fee|Slippage/, inputAction);

/**
 * Catch the action when user clicks the 'Start' callback button
 */
bot.action('Return', (ctx, next) => checkAction(ctx, next, 'Return'), returnAction);

//-------------------------------------------------------------------------------------------------------------+
//                                    Set menu button to see all commands                                      |
//-------------------------------------------------------------------------------------------------------------+

setCommands();

// Enable graceful stop
process.on('SIGINT', () => {
  console.log('sigint stopping...');
  bot.stop('SIGINT');
  loop = false;
  process.exit(0); // Exit the process
});

process.on('SIGTERM', () => {
  console.log('sigterm stopping...');
  bot.stop('SIGTERM');
  loop = false;
  process.exit(0); // Exit the process
});

/**
 * Launch the bot
 */
bot
  .launch(() => {
    console.log('Bot is running...');
  })
  .catch(console.error);
