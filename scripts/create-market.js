#!/usr/bin/env node
/**
 * Create Market Script for StacksBet Arena
 * Usage: node create-market.js "Title" "Description" "Category" <end_blocks> <liquidity_stx>
 */

const {
  makeContractCall,
  broadcastTransaction,
  stringUtf8CV,
  stringAsciiCV,
  uintCV,
  AnchorMode,
  PostConditionMode,
} = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');

const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';
const CONTRACT_NAME = 'stacksbet-arena';
const MNEMONIC = process.env.MNEMONIC || 'tourist chief old shadow clap injury join spoil birth copper valid skate';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 5) {
    console.log('Usage: node create-market.js "Title" "Description" "Category" <end_blocks> <liquidity_stx>');
    console.log('Example: node create-market.js "Will BTC hit 100k?" "Bitcoin prediction" "Crypto" 1000 10');
    process.exit(1);
  }

  const [title, description, category, endBlocksStr, liquidityStxStr] = args;
  const endBlocks = parseInt(endBlocksStr);
  const liquidityStx = parseFloat(liquidityStxStr);
  const liquidityMicro = Math.floor(liquidityStx * 1_000_000);

  // Get current block height
  console.log('📊 Fetching current block height...');
  const infoRes = await fetch('https://api.mainnet.hiro.so/v2/info');
  const info = await infoRes.json();
  const tipHeight = info.stacks_tip_height;
  
  const endTime = tipHeight + endBlocks;
  const resolutionTime = endTime + 1008; // +7 days

  console.log(`\n📊 Creating market...`);
  console.log(`   Title: ${title}`);
  console.log(`   Description: ${description}`);
  console.log(`   Category: ${category}`);
  console.log(`   Current block: ${tipHeight}`);
  console.log(`   End block: ${endTime}`);
  console.log(`   Resolution block: ${resolutionTime}`);
  console.log(`   Liquidity: ${liquidityStx} STX (${liquidityMicro} μSTX)`);

  // Derive key from mnemonic
  const { generateWallet } = require('@stacks/wallet-sdk');
  const wallet = await generateWallet({
    secretKey: MNEMONIC,
    password: '',
  });
  const account = wallet.accounts[0];
  const privateKey = account.stxPrivateKey;

  console.log(`\n📍 Sender: ${account.address}`);

  // Get nonce
  const nonceRes = await fetch(`https://api.mainnet.hiro.so/v2/accounts/${account.address}`);
  const nonceData = await nonceRes.json();
  const nonce = nonceData.nonce;
  console.log(`   Nonce: ${nonce}`);

  const network = new StacksMainnet();

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-market',
    functionArgs: [
      stringUtf8CV(title),
      stringUtf8CV(description),
      stringAsciiCV(category),
      stringUtf8CV('Manual resolution'),
      uintCV(endTime),
      uintCV(resolutionTime),
      uintCV(liquidityMicro),
    ],
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 50000n, // 0.05 STX
    nonce: BigInt(nonce),
  };

  console.log('\n🚀 Building transaction...');
  const tx = await makeContractCall(txOptions);

  console.log('📤 Broadcasting transaction...');
  const result = await broadcastTransaction({ transaction: tx, network });

  if (result.error) {
    console.error('❌ Error:', result.error, result.reason);
  } else {
    console.log('✅ Transaction broadcast successfully!');
    console.log(`   TxID: ${result.txid}`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${result.txid}?chain=mainnet`);
  }
}

main().catch(console.error);
