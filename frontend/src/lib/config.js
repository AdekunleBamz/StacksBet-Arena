// ============================================================
// StacksBet Arena - Configuration
// ============================================================

export const CONFIG = {
  reownProjectId: import.meta.env.VITE_REOWN_PROJECT_ID || '',
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '',
  contractName: import.meta.env.VITE_CONTRACT_NAME || 'stacksbet-arena',
  hiroApiUrl: import.meta.env.VITE_HIRO_API_URL || 'https://api.mainnet.hiro.so',
}

// Outcome constants (must match Clarity contract)
export const OUTCOME = {
  YES: 1,
  NO: 2,
  INVALID: 3,
}

// Fee constants (basis points)
export const FEES = {
  PLATFORM: 200, // 2%
  CREATOR: 50,   // 0.5%
  LIQUIDITY: 50, // 0.5%
}

// App metadata for Reown / WalletConnect
export const APP_METADATA = {
  name: 'StacksBet Arena',
  description: 'Decentralized Prediction Markets on Stacks',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://stacksbet.arena',
  icons: ['/logo.png'],
}

export function assertFrontendConfig() {
  const missing = []
  if (!CONFIG.contractAddress) missing.push('VITE_CONTRACT_ADDRESS')
  if (!CONFIG.contractName) missing.push('VITE_CONTRACT_NAME')
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }
}

