// ============================================================
// Stacks Blockchain Helpers - Read & Write Functions
// ============================================================

import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
} from '@stacks/transactions'
import { StacksMainnet } from '@stacks/network'
import { CONFIG } from './config'

const network = new StacksMainnet({ url: CONFIG.hiroApiUrl })
const CONTRACT_ADDRESS = CONFIG.contractAddress
const CONTRACT_NAME = CONFIG.contractName

// ============================================================
// Read-Only Helpers
// ============================================================

/**
 * Fetch a single market by ID
 */
export async function getMarket(marketId) {
  try {
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-market',
      functionArgs: [uintCV(marketId)],
      senderAddress: CONTRACT_ADDRESS,
    })
    const json = cvToJSON(result)
    if (json.value === null) return null
    return parseMarket(marketId, json.value)
  } catch (err) {
    console.error('getMarket error:', err)
    return null
  }
}

/**
 * Fetch markets (iterate 1..totalMarkets)
 */
export async function getMarkets(limit = 20) {
  const total = await getTotalMarkets()
  const markets = []
  const start = Math.max(1, total - limit + 1)
  for (let id = total; id >= start; id--) {
    const m = await getMarket(id)
    if (m) markets.push(m)
  }
  return markets
}

/**
 * Get total number of markets
 */
export async function getTotalMarkets() {
  try {
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-total-markets',
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
    })
    return Number(cvToJSON(result).value)
  } catch {
    return 0
  }
}

/**
 * Get total bets count
 */
export async function getTotalBets() {
  try {
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-total-bets',
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
    })
    return Number(cvToJSON(result).value)
  } catch {
    return 0
  }
}

/**
 * Get total volume (in micro-STX)
 */
export async function getTotalVolume() {
  try {
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-total-volume',
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
    })
    return Number(cvToJSON(result).value)
  } catch {
    return 0
  }
}

/**
 * Get a user's position on a market
 */
export async function getPosition(marketId, userAddress) {
  try {
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-position',
      functionArgs: [uintCV(marketId), principalCV(userAddress)],
      senderAddress: CONTRACT_ADDRESS,
    })
    const json = cvToJSON(result)
    return {
      yesShares: Number(json.value['yes-shares'].value),
      noShares: Number(json.value['no-shares'].value),
      totalInvested: Number(json.value['total-invested'].value),
      claimed: json.value.claimed.value,
    }
  } catch {
    return { yesShares: 0, noShares: 0, totalInvested: 0, claimed: false }
  }
}

/**
 * Get user stats
 */
export async function getUserStats(userAddress) {
  try {
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-stats',
      functionArgs: [principalCV(userAddress)],
      senderAddress: CONTRACT_ADDRESS,
    })
    const json = cvToJSON(result)
    return {
      totalBets: Number(json.value['total-bets'].value),
      totalVolume: Number(json.value['total-volume'].value),
      totalWinnings: Number(json.value['total-winnings'].value),
      totalLosses: Number(json.value['total-losses'].value),
      marketsCreated: Number(json.value['markets-created'].value),
      winRate: Number(json.value['win-rate'].value),
    }
  } catch {
    return { totalBets: 0, totalVolume: 0, totalWinnings: 0, totalLosses: 0, marketsCreated: 0, winRate: 0 }
  }
}

/**
 * Get odds for a market
 */
export async function getOdds(marketId) {
  try {
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-odds',
      functionArgs: [uintCV(marketId)],
      senderAddress: CONTRACT_ADDRESS,
    })
    const json = cvToJSON(result)
    return {
      yesOdds: Number(json.value['yes-odds'].value) / 100,
      noOdds: Number(json.value['no-odds'].value) / 100,
    }
  } catch {
    return { yesOdds: 50, noOdds: 50 }
  }
}

/**
 * Calculate payout for a user on a market
 */
export async function calculatePayout(marketId, userAddress) {
  try {
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'calculate-payout',
      functionArgs: [uintCV(marketId), principalCV(userAddress)],
      senderAddress: CONTRACT_ADDRESS,
    })
    return Number(cvToJSON(result).value)
  } catch {
    return 0
  }
}

// ============================================================
// Helpers
// ============================================================

function parseMarket(id, v) {
  return {
    id,
    creator: v.creator.value,
    title: v.title.value,
    description: v.description.value,
    category: v.category.value,
    resolutionSource: v['resolution-source'].value,
    endTime: Number(v['end-time'].value),
    resolutionTime: Number(v['resolution-time'].value),
    totalYes: Number(v['total-yes-amount'].value),
    totalNo: Number(v['total-no-amount'].value),
    resolved: v.resolved.value,
    outcome: Number(v.outcome.value),
    createdAt: Number(v['created-at'].value),
    isActive: v['is-active'].value,
  }
}
