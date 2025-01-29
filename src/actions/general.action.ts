import { User } from '../models/user.model';
import { startText, helpText, settingText } from '../models/text.model';
import { settingMarkUp, startMarkUp, helpMarkup } from '../models/markup.model';
import { MyContext } from '../config/types';
import { getBalanceOfWallet } from '../utils/web3';

/**
 * The function to handle 'Setting' action
 * @param {MyContext} ctx
 */
export const settingAction = async (ctx: MyContext) => {
  try {
    const tgId = ctx.chat?.id;
    const user = await User.findOne({ tgId });
    if (!user) {
      throw new Error('User not found!');
    }
    await ctx.editMessageText(settingText, await settingMarkUp(user));
  } catch (error) {
    // ctx.session.state = '';
    console.error('Error while settingActioin:', error);
  }
};

/**
 * The function to handle 'Close' action
 * @param {MyContext} ctx
 */
export const closeAction = (ctx: MyContext) => {
  try {
    ctx.deleteMessage();
  } catch (error) {
    console.error('Error while closeAction:', error);
  }
};

/**
 * The function to handle 'Return' action
 * @param {MyContext} ctx
 */
export const returnAction = async (ctx: MyContext) => {
  try {
    const tgId = ctx.chat?.id;
    const user = await User.findOne({ tgId });
    if (!user) {
      throw new Error('User not found!');
    }
    await ctx.editMessageText(startText(user), { parse_mode: 'HTML', reply_markup: startMarkUp() });
  } catch (error) {
    console.error('Error while returnAction:', error);
  }
};

/**
 * The function to handle 'Help' action
 * @param {MyContext} ctx
 */
export const helpAction = async (ctx: MyContext) => {
  try {
    await ctx.editMessageText(helpText, { parse_mode: 'HTML', reply_markup: helpMarkup.reply_markup });
  } catch (error) {
    console.error('Error while helpAction:', error);
  }
};
