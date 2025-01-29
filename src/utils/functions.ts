import { SOL_DECIMAL, bot } from '../config/config';
import { ArbitrageType, TokenInfoType } from '../config/types';
import { User, UserType } from '../models/user.model';

/**
 * Convert Uint8Array type hexadecimal string type.
 *
 * @param {Uint8Array} uint8Array
 * @returns Return hexadecimal string
 */

export function uint8ArrayToHex(uint8Array: Uint8Array) {
  try {
    return Array.from(uint8Array)
      .map((byte) => byte.toString(16).padStart(2, '0')) // Convert each byte to hex and pad with zeros
      .join(''); // Join all hex strings together
  } catch (error) {
    console.error('Error while uint8ArrayToHex function:', error);
    throw new Error('Failed to convert uint8Array to hexadecimal string.');
  }
}

/**
 * Send message to all users based on the information of token
 * @param {*} tokenInfo
 */
export async function sendMessageToAllActiveUsers(tokenInfo: TokenInfoType) {
  try {
    const users = await User.find({ botStatus: true });
    await Promise.all(
      users.map(async (user) => {
        await bot.telegram.sendMessage(
          user.tgId,
          `🔔 New Migration (${tokenInfo.name} / ${tokenInfo.symbol}) 🔔
💶 <code>${tokenInfo.address}</code>
📊 <a href="https://solscan.io/token/${tokenInfo.address}">Contract</a> • <a href="https://birdeye.so/token/${tokenInfo.address}?chain=solana">Birdeye</a> • <a href="https://dexscreener.com/solana/${tokenInfo.address}">Dexscreener</a>`,
          { parse_mode: 'HTML' }
        );
      })
    );
  } catch (error) {
    console.error('Error while sendMessageToAllActiveUsers:', error);
  }
}

/**
 * Round up the number into the specific decimal position number.
 *
 * @param {Number} num The number you want to round up.
 * @param {Number} decimal The number of decimal position you want to round up
 * @returns Return the number that rounded up into the specific decimal position.
 */
export function roundToSpecificDecimal(num: number, decimal = 0) {
  const decimals = 10 ** decimal;
  return Math.floor(num * decimals) / decimals;
}

export function isNumber(str: string) {
  return !isNaN(Number(str)) && str != 'Infinity' && str?.toString()?.trim() !== '';
}

/**
 *
 * @param {string} time
 * @returns
 */
export function checkTimeFormat(time: string) {
  if (time.split(':').length !== 2) {
    return {
      ok: false,
    };
  }
  const [hour, minute] = time.split(':');
  if (!isNumber(hour) || !isNumber(minute)) {
    return {
      ok: false,
    };
  }
  if (Number(hour) < 0 || Number(hour) > 23 || Number(minute) < 0 || Number(minute) > 59) {
    return { ok: false };
  }
  return { ok: true };
}

/**
 *
 * @param {string} item
 * @param {string[]} array
 */
export function addItemToArray(item: string, array: string[]) {
  array.push(item);
  if (array.length > 10) {
    array.splice(0, 1);
  }
}

export async function predictProfitability(pool: ArbitrageType | undefined, user: UserType) {
  try {
    if (!pool) {
      return { success: false };
    }
    const usedAmount = user.snipeAmount + ((user.priorityFee + 5000) / SOL_DECIMAL) * 2;
    const gotAmount = (user.snipeAmount / pool.min.priceNative) * pool.max.priceNative;
    if (gotAmount > usedAmount) {
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
