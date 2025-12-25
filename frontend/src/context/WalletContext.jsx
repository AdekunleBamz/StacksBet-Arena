import React, { createContext, useContext, useState, useEffect } from 'react'
import { initWalletConnect, wcConnect, wcDisconnect, getStacksAddresses } from '../utils/walletconnect'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const [userData, setUserData] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [wcUri, setWcUri] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)

  useEffect(() => {
    const connector = initWalletConnect()

    connector.on('display_uri', (uri) => {
      setWcUri(uri)
      setShowQRModal(true)
    })

    connector.on('connect', (session) => {
      console.log('WalletConnect session created', session)
      setShowQRModal(false)
      setWcUri(null)
      // Get addresses after connection
      getAddressesFromSession(session)
    })

    connector.on('disconnect', () => {
      console.log('WalletConnect disconnected')
      setUserData(null)
      setWcUri(null)
      setShowQRModal(false)
    })

    connector.on('error', (error) => {
      console.error('WalletConnect error', error)
      setIsConnecting(false)
      setShowQRModal(false)
      setWcUri(null)
    })

    // Check for existing session
    if (connector.session) {
      getAddressesFromSession(connector.session)
    }

    return () => {
      // Cleanup if needed
    }
  }, [])

  const getAddressesFromSession = async (session) => {
    try {
      const addresses = await getStacksAddresses(session)
      setUserData({
        session,
        address: addresses.address,
        publicKey: addresses.publicKey,
      })
    } catch (error) {
      console.error('Failed to get addresses', error)
      // Still set userData with session info as fallback
      const account = session.namespaces.stacks.accounts[0]
      if (account) {
        const [, , address] = account.split(':')
        setUserData({
          session,
          address,
        })
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const connectWallet = async () => {
    if (userData) return // Already connected

    setIsConnecting(true)

    try {
      await wcConnect()
      // Connection handled by event listeners
    } catch (error) {
      console.error('Failed to initiate WalletConnect', error)
      setIsConnecting(false)
      setShowQRModal(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await wcDisconnect()
      setUserData(null)
    } catch (error) {
      console.error('Failed to disconnect', error)
    }
  }

  const closeQRModal = () => {
    setShowQRModal(false)
    setWcUri(null)
    setIsConnecting(false)
  }

  const value = {
    userData,
    isConnecting,
    wcUri,
    showQRModal,
    connectWallet,
    disconnectWallet,
    closeQRModal,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
