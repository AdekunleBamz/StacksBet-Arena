import React, { useState } from 'react'
import { FiMenu, FiX, FiExternalLink, FiLink } from 'react-icons/fi'
import { HiOutlineLightningBolt, HiQrcode } from 'react-icons/hi'

const Header = ({ userData, userAddress, isConnecting, onConnect, onDisconnect }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const truncateAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Close mobile menu when clicking a link
  const handleNavClick = () => {
    setMobileMenuOpen(false)
  }

  // Handle keyboard navigation for mobile menu
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setMobileMenuOpen(false)
    }
  }

  return (
    <header 
      className="glass sticky top-0 z-50"
      role="banner"
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-purple to-arena-pink flex items-center justify-center hover:scale-110 transition-transform duration-200"
              aria-hidden="true"
            >
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

          <nav 
            className="hidden md:flex items-center space-x-8"
            role="navigation"
            aria-label="Main navigation"
          >
            <a 
              href="#markets" 
              className="text-gray-300 hover:text-white hover:underline transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-arena-purple focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-2 py-1"
            >
              Markets
            </a>
            <a 
              href="#leaderboard" 
              className="text-gray-300 hover:text-white hover:underline transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-arena-purple focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-2 py-1"
            >
              Leaderboard
            </a>
            <a 
              href="https://docs.stacks.co" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-arena-purple focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-2 py-1"
              aria-label="Documentation (opens in new tab)"
            >
              Docs <FiExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {userData ? (
              <div className="flex items-center space-x-3">
                <div 
                  className="glass-card px-4 py-2 rounded-xl border border-green-500/30"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full bg-green-500 animate-pulse" 
                      aria-hidden="true"
                    />
                    <p className="text-xs text-green-400">Connected</p>
                  </div>
                  <p 
                    className="text-sm font-mono font-medium text-white"
                    aria-label={`Wallet address: ${userAddress}`}
                  >
                    {truncateAddress(userAddress)}
                  </p>
                </div>
                <button 
                  onClick={onDisconnect} 
                  className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900" 
                  aria-label="Disconnect wallet"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                disabled={isConnecting}
                className="btn-primary px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-purple-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isConnecting ? 'Connecting to wallet...' : 'Connect your wallet to start betting'}
                aria-busy={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <div className="spinner w-4 h-4" aria-hidden="true" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <FiLink className="w-4 h-4" aria-hidden="true" />
                    <span>Connect Wallet</span>
                    <HiQrcode className="w-4 h-4 opacity-60" aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 rounded-lg glass focus:outline-none focus:ring-2 focus:ring-arena-purple"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <FiX className="w-6 h-6" aria-hidden="true" />
            ) : (
              <FiMenu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        <div 
          id="mobile-menu"
          className={`md:hidden py-4 border-t border-arena-purple/20 transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
          }`}
          role="navigation"
          aria-label="Mobile navigation"
          aria-hidden={!mobileMenuOpen}
        >
          <nav className="flex flex-col space-y-4">
            <a 
              href="#markets" 
              className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:text-white"
              onClick={handleNavClick}
              tabIndex={mobileMenuOpen ? 0 : -1}
            >
              Markets
            </a>
            <a 
              href="#leaderboard" 
              className="text-gray-300 hover:text-white transition-colors focus:outline-none focus:text-white"
              onClick={handleNavClick}
              tabIndex={mobileMenuOpen ? 0 : -1}
            >
              Leaderboard
            </a>
            {userData ? (
              <div className="pt-4 border-t border-arena-purple/20">
                <p className="text-sm text-gray-400 mb-2">Connected</p>
                <p 
                  className="text-sm font-mono font-medium text-white mb-4"
                  aria-label={`Wallet address: ${userAddress}`}
                >
                  {truncateAddress(userAddress)}
                </p>
                <button 
                  onClick={() => { onDisconnect(); handleNavClick(); }} 
                  className="btn-secondary w-full px-4 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  aria-label="Disconnect wallet"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onConnect(); handleNavClick(); }}
                disabled={isConnecting}
                className="btn-primary w-full px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                tabIndex={mobileMenuOpen ? 0 : -1}
                aria-label={isConnecting ? 'Connecting...' : 'Connect wallet'}
                aria-busy={isConnecting}
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
