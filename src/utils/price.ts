import { Raydium } from '@raydium-io/raydium-sdk-v2';
import { PublicKey } from '@solana/web3.js';

import { SOL_ADDRESS, connection } from '../config/config';
import { dexes, tokens } from '../config/tokens';
import fetch from 'cross-fetch';
import { ArbitrageType, PairType, TokenDataType } from '../config/types';
import { getTokenPrice } from './jupiter';

export async function getTokenPriceOnRaydium() {
  try {
    console.log('price');
    const raydium = await Raydium.load({
      connection,
      owner: new PublicKey('CZNxJx5su1m32GhdjXxtHpoCaF7UnXDwtDPeZLd4k7G3'),
    });

    const data = await raydium.api.fetchPoolByMints({
      mint2: SOL_ADDRESS,
      mint1: tokens[0].address,
    });
    console.log(data.data);
    const data1 = await raydium.api.fetchPoolByMints({
      mint2: SOL_ADDRESS,
      mint1: tokens[1].address,
    });
    console.log(data1.data);
    const solPrice = await getTokenPrice(SOL_ADDRESS);
    return data.data[0].mintA.address === SOL_ADDRESS ? solPrice / data.data[0].price : solPrice * data.data[0].price;
  } catch (error) {
    console.error(error);
  }
}
//20229.680671699945
async function fetchLPsFromDexScreen(token: TokenDataType) {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.address}`);
    const data = await response.json();
    console.log(data.pairs[0].info)
    const pairs = data.pairs.filter((p: PairType) => {
      return (
        dexes.includes(p.dexId) &&
        Number(p.priceUsd) > 0 &&
        p.quoteToken.address === SOL_ADDRESS &&
        p.liquidity.usd > 1000
      );
    });
    return pairs;
  } catch (error) {
    console.error(error);
  }
}

export async function getTokenPriceUsingDexScreener(token: TokenDataType) {
  try {
    const pairs: PairType[] = await fetchLPsFromDexScreen(token);
    const raydiumAmmPairs = pairs
      .filter((p: PairType) => {
        return p.dexId === 'raydium' && p.labels === undefined;
      })
      .sort((a, b) => b.liquidity.usd - a.liquidity.usd);

    const raydiumClmmPairs = pairs
      .filter((p: PairType) => {
        return p.dexId === 'raydium' && p.labels?.includes('CLMM');
      })
      .sort((a, b) => b.liquidity.usd - a.liquidity.usd);

    const raydiumCpmmPairs = pairs
      .filter((p: PairType) => {
        return p.dexId === 'raydium' && p.labels?.includes('CPMM');
      })
      .sort((a, b) => b.liquidity.usd - a.liquidity.usd);

    const meteoraAmmPairs = pairs
      .filter((p: PairType) => {
        return p.dexId === 'meteora' && p.labels === undefined;
      })
      .sort((a, b) => b.liquidity.usd - a.liquidity.usd);

    const meteoraDlmmPairs = pairs
      .filter((p: PairType) => {
        return p.dexId === 'meteora' && p.labels?.includes('DLMM');
      })
      .sort((a, b) => b.liquidity.usd - a.liquidity.usd);

    const orcaPairs = pairs
      .filter((p: PairType) => {
        return p.dexId === 'orca';
      })
      .sort((a, b) => b.liquidity.usd - a.liquidity.usd);

    const fluxbeamPairs = pairs
      .filter((p: PairType) => {
        return p.dexId === 'fluxbeam';
      })
      .sort((a, b) => b.liquidity.usd - a.liquidity.usd);

      const newPairs: any[] = [];
      if (raydiumAmmPairs.length > 0) newPairs.push({ ...raydiumAmmPairs[0], dexName: 'Raydium' });
      if (raydiumClmmPairs.length > 0) newPairs.push({ ...raydiumClmmPairs[0], dexName: 'Raydium CLMM' });
      if (raydiumCpmmPairs.length > 0) newPairs.push({ ...raydiumCpmmPairs[0], dexName: 'Raydium CP' });
      if (meteoraDlmmPairs.length > 0) newPairs.push({ ...meteoraDlmmPairs[0], dexName: 'Meteora DLMM' });
      if (meteoraAmmPairs.length > 0) newPairs.push({ ...meteoraAmmPairs[0], dexName: 'Meteora' });
      if (orcaPairs.length > 0) newPairs.push({ ...orcaPairs[0], dexName: 'Orca V1' });
      if (fluxbeamPairs.length > 0) newPairs.push({ ...fluxbeamPairs[0], dexName: 'FluxBeam' });
      const jupiterPrice = await getTokenPrice(token.address);
      newPairs.push({
        priceNative: 0,
        priceUsd: jupiterPrice,
        dexId: 'Jupiter',
        labels: [],
        pairAddress: '',
        liquidity: {
          base: 0,
          usd: 0,
          quote: 0,
        },
        volume: {
          h1: 0,
          h24: 0,
          h6: 0,
          m5: 0,
        },
        dexName: 'Jupiter',
      });

    newPairs.sort((a, b) => Number(a.priceUsd) - Number(b.priceUsd));

    return {
      numOfPools: pairs.length,
      address: token.address,
      min: {
        priceNative: newPairs[0].priceNative,
        priceUsd: newPairs[0].priceUsd,
        dexId: newPairs[0].dexId,
        labels: newPairs[0].labels || [],
        pairAddress: newPairs[0].pairAddress,
        liquidity: newPairs[0].liquidity,
        volume: newPairs[0].volume,
        dexName: newPairs[0].dexName,
      },
      max: {
        priceUsd: newPairs[newPairs.length - 1].priceUsd,
        priceNative: newPairs[newPairs.length - 1].priceNative,
        dexId: newPairs[newPairs.length - 1].dexId,
        labels: newPairs[newPairs.length - 1].labels || [],
        pairAddress: newPairs[newPairs.length - 1].pairAddress,
        liquidity: newPairs[newPairs.length - 1].liquidity,
        volume: newPairs[newPairs.length - 1].volume,
        dexName: newPairs[newPairs.length - 1].dexName,
      },
      jupiterPrice,
    } as ArbitrageType;
  } catch (error) {
    console.error(error);
  }
}
