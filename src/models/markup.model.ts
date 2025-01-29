import { SOL_DECIMAL } from '../config/config';
import { Markup, Types } from 'telegraf';
import { UserType } from './user.model';
import { getBalanceOfWallet } from '../utils/web3';

/**
 * The Markup be sent when 'start' command
 * @returns
 */
export const startMarkUp = () => {
  try {
    return Markup.inlineKeyboard([
      [Markup.button.callback('Setting', 'Setting'), Markup.button.callback('Help', 'Help')],
    ]).reply_markup;
  } catch (error) {
    console.error('Error while startMarkUp:', error);
    throw new Error('Failed to create markup for start command');
  }
};

/**
 * The Markup of Setting page
 * @param {*} user
 * @param {Number} amount
 * @returns
 */
export const settingMarkUp = async (user: UserType) => {
  let amount = 0;
  if (user.wallet.privateKey) {
    amount = await getBalanceOfWallet(user.wallet.publicKey);
  }
  try {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(`💳 Wallet (${amount / SOL_DECIMAL})`, 'Wallet'),
        Markup.button.callback(
          `${!user.wallet.privateKey ? '🔴 Import Wallet 🔴' : `💳 Change Wallet`}`,
          `${!user.wallet.privateKey ? 'Import Wallet' : 'Import Wallet'}`
        ),
      ],
      [Markup.button.callback(`${user.botStatus ? 'Bot On 🟢' : 'Bot Off 🔴'}`, 'On Off')],
      [
        Markup.button.callback(`💵 Amount: ${user.snipeAmount} SOL`, 'Snipe Amount'),
        Markup.button.callback(`💵 Priority Fee: ${user.priorityFee} lamport`, 'Priority Fee'),
      ],
      [
        Markup.button.callback(`💵 Jito Fee: ${user.jitoFee}`, 'Jito Fee'),
        Markup.button.callback(`💵 Slippage Bps: ${user.slippageBps}`, 'Slippage'),
      ],
      [Markup.button.callback('⬅ Return', 'Return'), Markup.button.callback('❌ Close', 'Close')],
    ]);
  } catch (error) {
    console.error('Error while settingMarkUp:', error);
    throw new Error('Failed to create markup for user settings.');
  }
};

/**
 * 'Close' Markup
 */
export const closeMarkUp = Markup.inlineKeyboard([[Markup.button.callback('❌ Close', 'Close')]]);

/**
 * The Markup of Wallet page
 */
export const walletMarkUp = Markup.inlineKeyboard([
  // [
  //   Markup.button.callback('🆕 Create New Wallet', 'Create Wallet'),
  //   Markup.button.callback('👝 Import Existing Wallet', 'Import Wallet'),
  // ],
  [Markup.button.callback('⬅ Return', 'Setting'), Markup.button.callback('❌ Close', 'Close')],
]);

/**
 * The Markup of Help page
 */
export const helpMarkup = Markup.inlineKeyboard([
  [Markup.button.callback('⬅ Return', 'Return'), Markup.button.callback('❌ Close', 'Close')],
]);
