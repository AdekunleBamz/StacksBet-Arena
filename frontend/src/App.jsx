import React, { useState, useEffect } from 'react'
import { StacksMainnet } from '@stacks/network'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import Header from './components/Header'
import Hero from './components/Hero'
import Stats from './components/Stats'
import MarketList from './components/MarketList'
import CreateMarket from './components/CreateMarket'
import Leaderboard from './components/Leaderboard'
import Footer from './components/Footer'

import { CONFIG, assertFrontendConfig } from './lib/config'

// Network configuration (mainnet for SP addresses)
const network = new StacksMainnet()

// Contract details (mainnet)
const CONTRACT_ADDRESS = CONFIG.contractAddress
const CONTRACT_NAME = CONFIG.contractName

// Stacks Connect setup
const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

function App() {
  const [activeTab, setActiveTab] = useState('markets')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        assertFrontendConfig()
      } catch (e) {
        console.error(e)
      }

      try {
        // IMPORTANT: after the wallet approves connect, Stacks Connect redirects back with an authResponse.
        // If we don't handle the pending sign-in, the UI will look like it "never connected".
        if (userSession.isSignInPending()) {
          const data = await userSession.handlePendingSignIn()
          if (!cancelled) setUserData(data)
          // Clean up URL params/hash used during auth.
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, document.title, window.location.pathname)
          }
          return
        }

        if (userSession.isUserSignedIn()) {
          if (!cancelled) setUserData(userSession.loadUserData())
        }
      } catch (e) {
        console.error('Stacks Connect init failed:', e)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  const connectWallet = () => {
    setIsConnecting(true)
    showConnect({
      appDetails: {
        name: 'StacksBet Arena',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData())
        setIsConnecting(false)
      },
      onCancel: () => {
        setIsConnecting(false)
      },
      userSession,
    })
  }

  const disconnectWallet = () => {
    userSession.signUserOut('/')
    setUserData(null)
  }

  const getUserAddress = () => {
    if (!userData) return null
    const stxAddress = userData.profile?.stxAddress
    if (!stxAddress) return null
    if (typeof stxAddress === 'string') return stxAddress
    return stxAddress.mainnet || stxAddress.testnet || null
  }

  return (
    <div className="min-h-screen bg-arena-dark relative">
      <div className="fixed inset-0 bg-mesh-gradient opacity-50 pointer-events-none" />
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-arena-purple/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-arena-pink/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10">
        <Header 
          userData={userData}
          userAddress={getUserAddress()}
          isConnecting={isConnecting}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />
        
        <main>
          <Hero 
            onConnect={connectWallet} 
            isConnected={!!userData} 
            onCreateMarket={() => setShowCreateModal(true)}
          />
          
          <Stats />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="flex space-x-4 border-b border-arena-purple/20">
              <button
                onClick={() => setActiveTab('markets')}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === 'markets' ? 'tab-active text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                🎯 Markets
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === 'leaderboard' ? 'tab-active text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                🏆 Leaderboard
              </button>
              {userData && (
                <button
                  onClick={() => setActiveTab('my-bets')}
                  className={`px-6 py-3 font-medium transition-all ${
                    activeTab === 'my-bets' ? 'tab-active text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📊 My Bets
                </button>
              )}
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'markets' && (
              <MarketList 
                userData={userData}
                userAddress={getUserAddress()}
                userSession={userSession}
                network={network}
                contractAddress={CONTRACT_ADDRESS}
                contractName={CONTRACT_NAME}
                onConnect={connectWallet}
              />
            )}
            
            {activeTab === 'leaderboard' && <Leaderboard />}
            
            {activeTab === 'my-bets' && userData && (
              <MarketList 
                userData={userData}
                userAddress={getUserAddress()}
                userSession={userSession}
                network={network}
                contractAddress={CONTRACT_ADDRESS}
                contractName={CONTRACT_NAME}
                onConnect={connectWallet}
                filterUserBets={true}
              />
            )}
          </div>
        </main>
        
        <Footer />
      </div>

      {showCreateModal && (
        <CreateMarket
          userData={userData}
          userAddress={getUserAddress()}
          userSession={userSession}
          network={network}
          contractAddress={CONTRACT_ADDRESS}
          contractName={CONTRACT_NAME}
          onClose={() => setShowCreateModal(false)}
          onConnect={connectWallet}
        />
      )}
    </div>
  )
}

export default App
