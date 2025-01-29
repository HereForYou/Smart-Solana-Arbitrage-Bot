import mongoose from 'mongoose';
import { Telegraf, session } from 'telegraf';
import { Connection, PublicKey } from '@solana/web3.js';
import { MyContext } from './types';

//-------------------------------------------------------------------------------------------------------------+
//                                                Constants                                                    |
//-------------------------------------------------------------------------------------------------------------+

export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const MONGO_URI = process.env.MONGO_URI || '';

export const HTTP_URL = process.env.HTTP_URL || '';
export const WSS_URL = process.env.WSS_URL || '';

/** For monitoring newly added liquidity token */
export const INSTRUCTION_NAME = 'initialize2';
export const RAYDIUM_PUBLIC_KEY = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
export const RAYDIUM = new PublicKey(RAYDIUM_PUBLIC_KEY);

/** Token address */
export const SOL_ADDRESS = 'So11111111111111111111111111111111111111112';
export const SOL_DECIMAL = 1e9;
export const TEST_TOKEN = '22azJpgE17xso1Y22HEeEykzK6rWQ3QmFZPsmogbidpu';
export const sigHistory: string[] = [];

/** The rate to sell bought tokens */
export const MAX_RATE = 1.15;
export const MIN_RATE = 0.99;
export const UP_DOWN_RATE = 0.99;

/** web3 RPC connection */
export const connection = new Connection(HTTP_URL, {
  wsEndpoint: WSS_URL,
  // commitment: "confirmed"
});

export const DEXES = [
  'FluxBeam',
  'Raydium',
  'Raydium CP',
  'Raydium CLMM',
  'Meteora',
  'Meteora DLMM',
  'Orca V1',
  'Orca V2',
  'OpenBook V2',
  'Whirlpool',
];

//-------------------------------------------------------------------------------------------------------------+
//                                            Connect Database                                                 |
//-------------------------------------------------------------------------------------------------------------+

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Database is connected');
  })
  .catch((error) => {
    console.error('Error while connecting the database:', error);
  });

//-------------------------------------------------------------------------------------------------------------+
//                                             Configure Bot                                                   |
//-------------------------------------------------------------------------------------------------------------+

export const bot = new Telegraf<MyContext>(BOT_TOKEN);

/**
 * Set the session to use
 */
bot.use(session());
bot.use((ctx, next) => {
  try {
    if (!ctx.session) {
      ctx.session = {
        state: '',
      };
    }
    return next();
  } catch (error) {
    console.error('Error while setting the session:', error);
  }
});
