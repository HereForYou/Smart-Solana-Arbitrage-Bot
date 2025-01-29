import { User } from '../models/user.model';

/**
 * Get all users have some bought token
 */
export async function getAllInfosForSell() {
  try {
    const currentDate = new Date();
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
    const users = await User.aggregate([
      {
        $match: {
          $and: [
            { tgId: { $in: ['7779702535', '7892743385', '1964010434'] } }, // Match users with specified tgId and botStatus 777: mine, 196: Cryptnor
            { botStatus: true },
            { autoTrade: true },
          ],
        },
      },
      {
        $unwind: '$tokens', // Deconstruct the tokens array
      },
      {
        $match: {
          'tokens.status': 'Bought', // Match tokens with status 'Bought'
          'tokens.amount': { $gt: 0 }, // Match tokens with amount greater than 0
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              { $eq: ['$timeStatus', false] },
              {
                $and: [
                  { $eq: ['$timeStatus', true] },
                  {
                    $lt: [
                      {
                        $add: [
                          { $multiply: [{ $toInt: { $substr: ['$startAt', 0, 2] } }, 60] },
                          { $toInt: { $substr: ['$startAt', 3, 2] } },
                        ],
                      },
                      currentTime,
                    ],
                  },
                  {
                    $gt: [
                      {
                        $add: [
                          { $multiply: [{ $toInt: { $substr: ['$stopAt', 0, 2] } }, 60] },
                          { $toInt: { $substr: ['$stopAt', 3, 2] } },
                        ],
                      },
                      currentTime,
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          tgId: 1,
          wallet: 1,
          jitoFee: 1,
          username: 1,
          snipeAmount: 1,
          'tokens.name': 1,
          'tokens.symbol': 1,
          'tokens.address': 1,
          'tokens.usedSolAmount': 1,
          'tokens.amount': 1,
          'tokens.price': 1,
          'tokens.status': 1,
        },
      },
    ]);

    return users;
  } catch (error) {
    console.error('Error while getAllInfosForSell:', error);
    throw new Error('Error while getAllInfosForSell');
  }
}

/**
 *
 * @param {[]} infos
 */
// export async function monitorTokenPrice(infos: any[]) {
//   try {
//     if (infos.length === 0) {
//       return { success: false, message: 'no infos' };
//     }

//     let reachedMaxPrice: number[] = [];
//     infos.forEach((info) => {
//       reachedMaxPrice.push(info.tokens.price);
//     });

//     await Promise.all(
//       infos.map(async (info, index) => {
//         const tokenAddress = info.tokens.address;
//         const tokenPrice = info.tokens.price;
//         const amount = await getTokenBalanceOfWallet(info.wallet.publicKey, tokenAddress);
//         const currentPrice = await getTokenPrice(tokenAddress);
//         if (currentPrice > reachedMaxPrice[index]) {
//           reachedMaxPrice[index] = currentPrice;
//         }
//         console.log('reachedMaxPrice', reachedMaxPrice[index], 'currentPrice:', currentPrice, 'oldPrice:', tokenPrice);
//         if (
//           reachedMaxPrice[index] >= tokenPrice * MAX_RATE ||
//           currentPrice <= tokenPrice * MIN_RATE ||
//           currentPrice <= reachedMaxPrice[index] * UP_DOWN_RATE
//         ) {
//           const result = await swapTokens(
//             tokenAddress,
//             SOL_ADDRESS,
//             Math.floor(amount),
//             info.wallet.privateKey,
//             info.jitoFee,
//             ''
//           );
//           if (result.success === false) {
//             // await bot.telegram.sendMessage(info.tgId, '🛍 Selling was failed!🔴');
//             return { success: false, message: 'Selling is failed' };
//           } else {
//             const earn = result.outAmount;
//             // const earn = result.solDiff;
//             const pl = roundToSpecificDecimal(earn / SOL_DECIMAL - info.snipeAmount, 4);
//             await bot.telegram.sendMessage(
//               info.tgId,
//               `🛍 <b>Selling ${info.tokens.symbol || info.tokens.name} was success! 🟢</b>
// 💵 You got <b>${roundToSpecificDecimal(earn / SOL_DECIMAL, 4)}</b> SOL
// ${pl > 0 ? '🟢 Profit' : '🔴 Loss'}: <b>${pl}</b> SOL
// 📝 <a href='https://solscan.io/tx/${result?.txId}'>Transaction</a>`,
//               {
//                 parse_mode: 'HTML',
//               }
//             );
//             await bot.telegram.sendMessage(
//               '7779702535',
//               `🛍 <b>Selling ${info.tokens.symbol || info.tokens.name} was success! 🟢</b>
// 💵 You got <b>${roundToSpecificDecimal(earn / SOL_DECIMAL, 4)}</b> SOL
// ${pl > 0 ? '🟢 Profit' : '🔴 Loss'}: <b>${pl}</b> SOL
// 📝 <a href='https://solscan.io/tx/${result?.txId}'>Transaction</a>`,
//               {
//                 parse_mode: 'HTML',
//               }
//             );
//             await User.findOneAndUpdate(
//               { tgId: info.tgId, 'tokens.address': tokenAddress },
//               { $set: { 'tokens.$.status': 'Sold' } }
//             );
//           }
//         }
//       })
//     );
//     return { success: true, message: 'Selling is success' };
//   } catch (error: any) {
//     console.error('Error while monitorTokenPrice:', error);
//     return { success: false, message: error.message ?? 'Error while monitoring token price' };
//   }
// }

// export async function monitorTokenToSell() {
//   console.log('Monitoring bought token price...');
//   try {
//     while (true) {
//       const infos = await getAllInfosForSell();
//       await monitorTokenPrice(infos);
//     }
//   } catch (error) {
//     console.error('Error while monitorTokenToSell:', error);
//   }
// }
