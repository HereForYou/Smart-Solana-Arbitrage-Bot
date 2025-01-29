import axios from 'axios';
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';

import { Keypair, sendAndConfirmTransaction, Transaction, VersionedTransaction } from '@solana/web3.js';
import { connection } from '../config/config';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';

console.log('process.env.BOT_TOKEN', process.env.BOT_TOKEN);
const fetchTokenAccountData = async (address: string) => {
  const filters = [
    {
      dataSize: 165, //size of account (bytes)
    },
    {
      memcmp: {
        offset: 32, //location of our query in the account (bytes)
        bytes: address, //our search criteria, a base58 encoded string
      },
    },
  ];

  // const tokenAccounts1 = await connection.getTokenAccountsByOwner(new PublicKey(address), { programId: TOKEN_PROGRAM_ID })unts1)
  const tokenAccounts = await connection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID, //SPL Token Program, new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    { filters: filters }
  );
  // tokenAccounts.map((account: any) => {
  //   console.log('account', account)
  //   console.log('account.data', account.account.data)
  //   console.log('account.amount', account.account?.data?.parsed?.info?.tokenAmount)
  // })
  return { tokenAccounts };
};

const buyWithRaydium = async () => {
  const outputMint = '8i51XNNpGaKaj4G4nDdmQh95v4FKAxw8mhtaRoKd9tE8';
  const inputMint = 'So11111111111111111111111111111111111111112';
  const amount = 1000000;
  const slippage = 0.5;
  const txVersion = 'V0';
  const isV0Tx = txVersion === 'V0';

  const owner = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || ''));
  const [isInputSol, isOutputSol] = [inputMint === NATIVE_MINT.toBase58(), outputMint === NATIVE_MINT.toBase58()];

  const { tokenAccounts } = await fetchTokenAccountData(owner.publicKey.toBase58());
  // const inputTokenAcc = tokenAccounts.find((a) => a.account..toBase58() === inputMint)?.publicKey
  // const outputTokenAcc = tokenAccounts.find((a) => a.mint.toBase58() === outputMint)?.publicKey

  const { data: swapResponse } = await axios.get(
    `https://transaction-v1.raydium.io/compute/swap-base-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${
      slippage * 100
    }&txVersion=${txVersion}`
  ); //
  console.log('swapResponse', swapResponse);
  const { data: swapTransactions } = await axios.post<{
    id: string;
    version: string;
    success: boolean;
    data: { transaction: string }[];
  }>(`https://transaction-v1.raydium.io/transaction/swap-base-in`, {
    computeUnitPriceMicroLamports: '200000',
    swapResponse,
    txVersion,
    wallet: owner.publicKey.toBase58(),
    wrapSol: isInputSol,
    unwrapSol: isOutputSol, // true means output mint receive sol, false means output mint received wsol
    // inputAccount: isInputSol ? undefined : inputTokenAcc?.toBase58(),
    // outputAccount: isOutputSol ? undefined : outputTokenAcc?.toBase58(),
  });

  console.log('swapTransactions', swapTransactions);
  const allTxBuf = swapTransactions.data.map((tx) => Buffer.from(tx.transaction, 'base64'));
  const allTransactions = allTxBuf.map((txBuf) =>
    isV0Tx ? VersionedTransaction.deserialize(txBuf) : Transaction.from(txBuf)
  );

  console.log(`total ${allTransactions.length} transactions`, swapTransactions);

  let idx = 0;
  if (!isV0Tx) {
    for (const tx of allTransactions) {
      console.log(`${++idx} transaction sending...`);
      const transaction = tx as Transaction;
      transaction.sign(owner);
      const txId = await sendAndConfirmTransaction(connection, transaction, [owner], { skipPreflight: true });
      console.log(`${++idx} transaction confirmed, txId: ${txId}`);
    }
  } else {
    for (const tx of allTransactions) {
      idx++;
      const transaction = tx as VersionedTransaction;
      transaction.sign([owner]);
      const txId = await connection.sendTransaction(tx as VersionedTransaction, { skipPreflight: true });
      const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash({
        commitment: 'confirmed',
      });
      console.log(`${idx} transaction sending..., txId: ${txId}`);
      await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature: txId,
        },
        'confirmed'
      );
      console.log(`${idx} transaction confirmed`);
    }
  }
};

buyWithRaydium();
