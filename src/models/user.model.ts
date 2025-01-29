import { Schema, model, Document } from 'mongoose';

interface Token {
  name: string;
  symbol: string;
  address: string;
  usedSolAmount: number;
  decimals: number;
  amount: number;
  price: number;
  status?: string;
  risk: number;
}

// Define the Wallet interface
interface Wallet {
  publicKey: string;
  privateKey: string;
  amount: number;
}

// Define the User interface
export interface UserType extends Document {
  tgId: string;
  username: string;
  wallet: Wallet;
  snipeAmount: number;
  jitoFee: number;
  priorityFee: number;
  slippageBps: number;
  chian?: string;
  botStatus: boolean;
  simulationMode?: boolean;
  autoTrade: boolean;
  timeStatus: boolean;
  startAt: string;
  stopAt: string;
  tokens: Token[];
}

const UserSchema = new Schema({
  tgId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    default: '',
  },
  wallet: {
    publicKey: {
      type: String,
    },
    privateKey: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  snipeAmount: {
    type: Number,
    default: 0,
  },
  jitoFee: {
    type: Number,
    default: 0.001,
  },
  priorityFee: {
    type: Number,
    default: 5000,
  },
  slippageBps: {
    type: Number,
    default: 50,
  },
  chian: {
    type: String,
    default: 'Solana',
  },
  botStatus: {
    type: Boolean,
    default: false,
  },
  simulationMode: {
    type: Boolean,
    default: false,
  },
  autoTrade: {
    type: Boolean,
    default: false,
  },
  timeStatus: {
    type: Boolean,
    default: false,
  },
  startAt: {
    type: String,
    default: '00:00',
  },
  stopAt: {
    type: String,
    default: '23:59',
  },
  tokens: [
    {
      name: {
        type: String,
        default: '',
      },
      symbol: {
        type: String,
        default: '',
      },
      address: {
        type: String,
        required: true,
      },
      usedSolAmount: {
        type: Number,
        default: 0,
      },
      decimals: {
        type: Number,
        default: 0,
      },
      amount: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        default: 'Bought',
      },
      risk: {
        type: Number,
        default: 0,
      },
    },
  ],
});

export const User = model<UserType>('User', UserSchema, 'User');
