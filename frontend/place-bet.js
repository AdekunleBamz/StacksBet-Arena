#!/usr/bin/env node
/**
 * Place Bet Script for StacksBet Arena
 * Usage: node place-bet.js <market_id> <outcome: 1=YES, 2=NO> <amount_stx>
 */

import {
  makeContractCall,
  broadcastTransaction,
  uintCV,
  AnchorMode,
  PostConditionMode,
  TransactionVersion,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';
const CONTRACT_NAME = 'stacksbet-arena';
const MNEMONIC = process.env.MNEMONIC || 'tourist chief old shadow clap injury join spoil birth copper valid skate';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node place-bet.js <market_id> <outcome: 1=YES, 2=NO> <amount_stx>');
    console.log('Example: node place-bet.js 1 1 0.5  # Bet 0.5 STX on YES for market 1');
    process.exit(1);
  }

  const [marketIdStr, outcomeStr, amountStxStr] = args;
  const marketId = parseInt(marketIdStr);
  const outcome = parseInt(outcomeStr);
  const amountStx = parseFloat(amountStxStr);
  const amountMicro = Math.floor(amountStx * 1_000_000);
  const outcomeName = outcome === 1 ? 'YES' : 'NO';

  console.log(`\n🎲 Placing bet...`);
  console.log(`   Market ID: ${marketId}`);
  console.log(`   Outcome: ${outcomeName}`);
  console.log(`   Amount: ${amountStx} STX (${amountMicro} μSTX)`);

  // Derive key from mnemonic
  const { generateWallet, getStxAddress } = await import('@stacks/wallet-sdk');
  const wallet = await generateWallet({
    secretKey: MNEMONIC,
    password: '',
  });
  const account = wallet.accounts[0];
  const privateKey = account.stxPrivateKey;
  const senderAddress = getStxAddress({ account, transactionVersion: TransactionVersion.Mainnet });

  console.log(`\n📍 Sender: ${senderAddress}`);

  // Get nonce
  const nonceRes = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${senderAddress}`);
  const nonceData = await nonceRes.json();
  const nonce = nonceData.nonce;
  console.log(`   Nonce: ${nonce}`);

  const network = new StacksMainnet();

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'place-bet',
    functionArgs: [
      uintCV(marketId),
      uintCV(outcome),
      uintCV(amountMicro),
    ],
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 30000n, // 0.03 STX
    nonce: BigInt(nonce),
  };

  console.log('\n🚀 Building transaction...');
  const tx = await makeContractCall(txOptions);

  console.log('📤 Broadcasting transaction...');
  const result = await broadcastTransaction(tx, network);

  if (result.error) {
    console.error('❌ Error:', result.error, result.reason);
  } else {
    console.log('✅ Bet placed successfully!');
    console.log(`   TxID: ${result.txid}`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${result.txid}?chain=mainnet`);
  }
}

main().catch(console.error);
