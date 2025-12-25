import React, { useState } from 'react'
import { FiMenu, FiX, FiExternalLink, FiLink } from 'react-icons/fi'
import { HiOutlineLightningBolt, HiQrcode } from 'react-icons/hi'

const Header = ({ userData, userAddress, isConnecting, onConnect, onDisconnect }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const truncateAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-purple to-arena-pink flex items-center justify-center hover:scale-110 transition-transform duration-200">
              <HiOutlineLightningBolt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                <span className="gradient-text">StacksBet</span>
                <span className="text-white"> Arena</span>
              </h1>
              <p className="text-xs text-gray-500">Powered by Reown</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#markets" className="text-gray-300 hover:text-white hover:underline transition-all duration-200">Markets</a>
            <a href="#leaderboard" className="text-gray-300 hover:text-white hover:underline transition-all duration-200">Leaderboard</a>
            <a href="https://docs.stacks.co" target="_blank" rel="noopener noreferrer"
               className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center gap-1">
              Docs <FiExternalLink className="w-3 h-3" />
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {userData ? (
              <div className="flex items-center space-x-3">
                <div className="glass-card px-4 py-2 rounded-xl border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-xs text-green-400">Connected</p>
                  </div>
                  <p className="text-sm font-mono font-medium text-white">{truncateAddress(userAddress)}</p>
                </div>
                <button onClick={onDisconnect} className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-all">
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                disabled={isConnecting}
                className="btn-primary px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-purple-500/25 transition-all"
              >
                {isConnecting ? (
                  <><div className="spinner w-4 h-4" />Connecting...</>
                ) : (
                  <>
                    <FiLink className="w-4 h-4" />
                    <span>Connect Wallet</span>
                    <HiQrcode className="w-4 h-4 opacity-60" />
                  </>
                )}
              </button>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg glass">
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        <div className={`md:hidden py-4 border-t border-arena-purple/20 transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
        }`}>
            <nav className="flex flex-col space-y-4">
              <a href="#markets" className="text-gray-300 hover:text-white transition-colors">Markets</a>
              <a href="#leaderboard" className="text-gray-300 hover:text-white transition-colors">Leaderboard</a>
              {userData ? (
                <div className="pt-4 border-t border-arena-purple/20">
                  <p className="text-sm text-gray-400 mb-2">Connected</p>
                  <p className="text-sm font-mono font-medium text-white mb-4">{truncateAddress(userAddress)}</p>
                  <button onClick={onDisconnect} className="btn-secondary w-full px-4 py-2 rounded-xl text-sm font-medium">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={onConnect}
                  disabled={isConnecting}
                  className="btn-primary w-full px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
