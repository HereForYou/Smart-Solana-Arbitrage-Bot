import { Context } from 'telegraf';

export interface SessionData {
  state: string;
  msgId?: number | undefined;
}

export interface MyContext extends Context {
  ctx: {};
  session: SessionData;
}

export interface TokenInfoType {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  risk: number;
  price: any;
  poolAddress?: string;
}

export interface TokenDataType {
  name?: string;
  symbol?: string;
  address: string;
  dexId?: string;
  pairAddress?: string;
  program?: string;
  type?: string;
  decimals?: number;
}

export interface PairType {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels: string[] | undefined;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: number;
  priceUsd: number;
  txns: { m5: [Object]; h1: [Object]; h6: [Object]; h24: [Object] };
  volume: { h24: number; h6: number; h1: number; m5: number };
  priceChange: { h24: number };
  liquidity: { usd: number; base: number; quote: number };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info: {
    imageUrl: string;
    header: string;
    openGraph: string;
    websites: any;
    socials: any;
  };
  boosts: { active: number };
}

export interface Liquidity {
  usd: number;
  base: number;
  quote: number;
}

export interface Volume {
  h24: number;
  h6: number;
  h1: number;
  m5: number;
}

export interface PriceInfo {
  priceUsd: number;
  priceNative: number;
  dexId: string;
  labels: string[];
  pairAddress: string;
  liquidity: Liquidity;
  volume: Volume;
  dexName: string;
}

export interface ArbitrageType {
  numOfPools: number;
  address: string;
  min: PriceInfo;
  max: PriceInfo;
  jupiterPrice: number;
}
