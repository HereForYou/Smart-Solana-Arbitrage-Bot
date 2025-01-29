import fetch from 'cross-fetch';
import { DEXES } from '../config/config';

async function getAllDexes() {
  const programIdToLabelHash = await (await fetch('https://quote-api.jup.ag/v6/program-id-to-label')).json();
  let excludeDexes: any[] = [];
  Object.values(programIdToLabelHash).forEach((value) => {
    excludeDexes.push(value);
  })
  return excludeDexes;
}

/**
 *
 * @param {string} inputAddr
 * @param {string} outputAddr
 * @param {number} amount
 * @param {number} slippageBps
 * @returns
 */
export async function getQuoteForSwap(
  inputAddr: string,
  outputAddr: string,
  amount: number,
  dexName: string,
  slippageBps = 50
) {
  try {
    let excludeDexes: string[] = []
    if (dexName === 'Jupiter') {
      excludeDexes = [];
    } else if (dexName === 'Orca V1') {
      excludeDexes = DEXES.filter((dex) => dex !== dexName && dex !== 'Orca V2' && dex !== 'Whirlpool');
    } else {
      excludeDexes = DEXES.filter((dex) => dex !== dexName);
    }
    console.log('exclude dexes:', excludeDexes)
    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputAddr}&outputMint=${outputAddr}&amount=${amount}&slippageBps=${slippageBps}&excludeDexes=${excludeDexes.join(
        ','
      )}`
    );
    const quote = await response.json();
    console.log('quote:', quote);
    return quote;
  } catch (error) {
    console.error('Error while getQuoteForSwap:', error);
    throw new Error('Error while getQuoteForSwap');
  }
}

export async function isTradable(
  inputAddr: string,
  outputAddr: string,
  amount: number,
  dexName: string,
  slippageBps = 50
) {
  try {
    let excludeDexes: string[] = []
    if (dexName === 'Jupiter') {
      excludeDexes = [];
    } else if (dexName === 'Orca V1') {
      excludeDexes = DEXES.filter((dex) => dex !== dexName && dex !== 'Orca V2' && dex !== 'Whirlpool');
    } else {
      excludeDexes = DEXES.filter((dex) => dex !== dexName);
    }
    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputAddr}&outputMint=${outputAddr}&amount=${amount}&slippageBps=${slippageBps}&excludeDexes=${excludeDexes.join(
        ','
      )}`
    );
    const quote = await response.json();
    console.log('quote:', quote);
    if (quote?.error) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error while getQuoteForSwap:', error);
    throw new Error('Error while getQuoteForSwap');
  }
}

/**
 *
 * @param {any} quote
 * @param {string} publicKey
 * @returns
 */
export async function getSerializedTransaction(quote: any, publicKey: string, priorityFee: number) {
  try {
    const response = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: publicKey,
        wrapAndUnwrapSol: true,
        prioritizationFeeLamports: priorityFee,
      }),
    });
    const { swapTransaction } = await response.json();
    return swapTransaction;
  } catch (error) {
    console.log('Error while getSerializedTransaction:', error);
    throw new Error('Error while getSerializedTransaction');
  }
}

/**
 * Get token price using its address using jupiter API
 * @param {string} token
 * @returns
 */
export async function getTokenPrice(token: string) {
  try {
    const response = await fetch(`https://api.jup.ag/price/v2?ids=${token}`, {
      method: 'get',
      redirect: 'follow',
    });
    const { data } = await response.json();
    return Number(data[token]?.price);
  } catch (error) {
    console.error('Error while getTokenPrice:', error);
    throw new Error('Error while getTokenPrice');
  }
}
