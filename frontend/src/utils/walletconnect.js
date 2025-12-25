import { UniversalConnector } from '@reown/appkit-universal-connector'

export const wcMetadata = {
  name: 'StacksBet Arena',
  description: 'Decentralized Prediction Markets on Stacks',
  url: window.location.origin,
  icons: [new URL('/logo.svg', window.location.origin).toString()],
}

export const stacksNamespace = {
  chains: ['stacks:1'],
  methods: ['stx_getAddresses', 'stx_signTransaction', 'stx_callContract', 'stx_transferStx'],
  events: ['accountsChanged', 'chainChanged'],
}

export let connector

export function initWalletConnect() {
  if (connector) return connector

  connector = new UniversalConnector({
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    metadata: wcMetadata,
    networks: [stacksNamespace],
  })

  return connector
}

export async function wcConnect() {
  const conn = initWalletConnect()

  return new Promise((resolve, reject) => {
    conn.on('connect', (session) => {
      resolve(session)
    })

    conn.on('error', (error) => {
      reject(error)
    })

    conn.connect({
      requiredNamespaces: {
        stacks: stacksNamespace,
      },
    })
  })
}

export async function wcDisconnect() {
  if (connector) {
    await connector.disconnect()
  }
}

export async function getStacksAddresses(session) {
  if (!connector) throw new Error('Connector not initialized')

  try {
    const result = await connector.request({
      topic: session.topic,
      chainId: 'stacks:1',
      request: {
        method: 'stx_getAddresses',
        params: {},
      },
    })

    // Find STX address
    const stxAccount = result.addresses.find(addr => addr.symbol === 'STX') || result.addresses[0]
    return {
      address: stxAccount.address,
      publicKey: stxAccount.publicKey,
    }
  } catch (error) {
    console.warn('stx_getAddresses failed, falling back to session accounts', error)
    // Fallback to session accounts
    const account = session.namespaces.stacks.accounts[0]
    if (account) {
      const [, , address] = account.split(':')
      return { address }
    }
    throw error
  }
}

export async function signStacksTransaction(session, txHex) {
  if (!connector) throw new Error('Connector not initialized')

  return connector.request({
    topic: session.topic,
    chainId: 'stacks:1',
    request: {
      method: 'stx_signTransaction',
      params: {
        txHex,
        broadcast: true,
      },
    },
  })
}
