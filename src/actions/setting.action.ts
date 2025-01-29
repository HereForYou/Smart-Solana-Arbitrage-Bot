import { MyContext } from '../config/types';
import { User } from '../models/user.model';
import { newUserText, settingText } from '../models/text.model';
import { walletMarkUp, settingMarkUp } from '../models/markup.model';
import { getBalanceOfWallet } from '../utils/web3';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';

/**
 * The function to handle 'Wallet' action
 * @param {MyContext} ctx
 */
export const walletAction = async (ctx: MyContext) => {
  try {
    const tgId = ctx.chat?.id;
    const user = await User.findOne({ tgId });
    if (!user) {
      await ctx.reply("We can't find you. Please enter /start command and then try again.");
      return;
    }
    ctx.editMessageText(newUserText(user), { parse_mode: 'MarkdownV2', reply_markup: walletMarkUp.reply_markup });
  } catch (error) {
    console.error('Error while walletAction:', error);
  }
};

/**
 * The function to handle 'Wallet' action
 * @param {MyContext} ctx
 */
export const importWalletAction = async (ctx: MyContext) => {
  try {
    const tgId = ctx.chat?.id;
    const user = await User.findOne({ tgId });
    if (!user) {
      await ctx.reply("We can't find you. Please enter /start command and then try again.");
      return;
    }
    const msg = await ctx.reply('✍ Enter the Phantom wallet private key.\nThe format should be 4TYcXh*********LL5SqM');
    ctx.session.state = 'Import Wallet';
    ctx.session.msgId = msg.message_id;
  } catch (error) {
    console.error('Error while walletAction:', error);
  }
};

/**
 * The function to handle 'On Off' action
 * @param {MyContext} ctx
 */
export const onOffAction = async (ctx: MyContext) => {
  try {
    const tgId = ctx.chat?.id;
    const user = await User.findOne({ tgId });
    if (!user) {
      await ctx.reply("We can't find you. Please enter /start command and then try again.");
      return;
    }
    user.botStatus = !user.botStatus;
    await user.save();
    ctx.editMessageText(settingText, await settingMarkUp(user));
  } catch (error) {
    console.error('Error while walletAction:', error);
  }
};

/**
 * The function to handle 'Time On Off' action
 * @param {MyContext} ctx
 */
export const timeOnOffAction = async (ctx: MyContext) => {
  try {
    const tgId = ctx.chat?.id;
    const user = await User.findOne({ tgId });
    if (!user) {
      await ctx.reply("We can't find you. Please enter /start command and then try again.");
      return;
    }
    user.timeStatus = !user.timeStatus;
    await user.save();
    await ctx.editMessageText(settingText, await settingMarkUp(user));
  } catch (error) {
    console.error('Error while walletAction:', error);
  }
};

/**
 * The function to handle 'Snipe Amount || Jito Fee' action Context<Update>.callbackQuery: CallbackQuery | undefined
 * @param {MyContext} ctx
 */
export const inputAction = async (ctx: MyContext) => {
  try {
    const action = (ctx.callbackQuery as CallbackQuery.DataQuery).data;
    let replyMessage = '';
    if (action === 'Snipe Amount') replyMessage = '✍ Input the *SOL* amount you want to consume for buy';
    else if (action === 'Priority Fee') replyMessage = '✍ Input the *SOL* amount you want to consume as priority fee';
    else if (action === 'Slippage') replyMessage = '✍ Input the Slippage Bps \\(1 Slippage Bps \\= 0\\.01%\\)';
    else replyMessage = '✍ Input the Jito fee amount';
    await ctx.reply(replyMessage, { parse_mode: 'MarkdownV2' });
    ctx.session.state = action;
  } catch (error) {
    console.error('Error while snipeAmountAction:', error);
  }
};

/**
 * The function to handle 'Start Time || Stop Time' action
 * @param {MyContext} ctx
 */
export const timeAction = async (ctx: MyContext) => {
  const tgId = ctx.chat?.id;
  const action = (ctx.callbackQuery as CallbackQuery.DataQuery).data;
  try {
    const user = await User.findOne({ tgId });
    if (!user) {
      await ctx.reply("We can't find you. Please enter /start command and then try again.");
    }
    await ctx.reply(
      `Please enter the time when you want to ${action
        .split(' ')[0]
        .toLowerCase()} bot automatically. It must be this kind of format: <code>00:00</code>`,
      { parse_mode: 'HTML' }
    );
    ctx.session.state = action;
  } catch (error) {
    console.error('Error while timeAction:', error);
  }
};

/**
 * The function to handle 'Auto Trade' action
 * Change the status of Auto Trade according to users' action
 * @param {MyContext} ctx
 */
export const autoTradeAction = async (ctx: MyContext) => {
  const tgId = ctx.chat?.id;
  try {
    const user = await User.findOne({ tgId });
    if (!user) {
      await ctx.reply("We can't find you. Please enter /start command and then try again.");
      return;
    }
    user.autoTrade = !user.autoTrade;
    await user.save();
    await ctx.editMessageText(settingText, await settingMarkUp(user));
  } catch (error) {
    console.error('Error while autoTradeAction:', error);
  }
};

/**
 * The function to handle 'Simulation Mode' action
 * Change the status of simulation mode according to users' action
 * @param {MyContext} ctx
 */
export const simulationModeAction = async (ctx: MyContext) => {
  const tgId = ctx.chat?.id;
  try {
    const user = await User.findOne({ tgId });
    if (!user) {
      await ctx.reply("We can't find you. Please enter /start command and then try again.");
      return;
    }
    user.simulationMode = !user.simulationMode;
    await user.save();
    await ctx.editMessageText(settingText, await settingMarkUp(user));
  } catch (error) {
    console.error('Error while autoTradeAction:', error);
  }
};
