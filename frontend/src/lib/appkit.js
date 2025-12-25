import { createAppKit } from '@reown/appkit'
import { stacks } from '@reown/appkit/networks'
import { CONFIG, APP_METADATA } from './config'

// Create AppKit instance with Stacks support
// Only initialize if we have a valid project ID
let appKit = null

if (CONFIG.reownProjectId) {
  try {
    appKit = createAppKit({
      networks: [stacks.mainnet, stacks.testnet],
      defaultNetwork: stacks.mainnet,
      metadata: APP_METADATA,
      projectId: CONFIG.reownProjectId,
      features: {
        analytics: true,
        email: false,
        socials: ['google', 'x', 'discord', 'farcaster', 'github'],
        emailShowWallets: true,
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-color-mix': '#1a1a1a',
        '--w3m-color-mix-strength': 40,
      },
    })
  } catch (error) {
    console.warn('Failed to initialize AppKit:', error)
  }
} else {
  console.warn('VITE_REOWN_PROJECT_ID is not set. Wallet connection will be disabled.')
}

export { appKit }
export default appKit
