import React from 'react'
import { HiArrowRight, HiPlusCircle } from 'react-icons/hi'

const Hero = ({ onConnect, isConnected, onCreateMarket }) => {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8">
            <div className="pulse-dot" />
            <span className="text-sm text-gray-300">Live Prediction Markets</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">Predict.</span>
            <br />
            <span className="gradient-text">Bet. Win.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Decentralized prediction markets on Stacks. Bet on crypto prices, sports, 
            politics, and more. Create your own markets and earn fees.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {!isConnected ? (
              <button
                onClick={onConnect}
                className="btn-primary px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-3 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-purple-500/30 transition-all"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
                </svg>
                Connect Wallet
                <HiArrowRight className="w-5 h-5" />
              </button>
            ) : null}
            <button
              onClick={onCreateMarket}
              className="btn-primary px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2 w-full sm:w-auto"
            >
              <HiPlusCircle className="w-5 h-5" /> Create Market
            </button>
            <a href="#markets" className="btn-secondary px-8 py-4 rounded-2xl font-semibold text-lg w-full sm:w-auto text-center">
              Explore Markets
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Binary Markets</h3>
              <p className="text-gray-400 text-sm">Simple YES/NO predictions with dynamic odds based on market activity</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold mb-2">Earn Fees</h3>
              <p className="text-gray-400 text-sm">Create markets and earn 0.5% of all trading volume on your markets</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
              <p className="text-gray-400 text-sm">Compete with other traders and climb the rankings to earn rewards</p>
            </div>
          </div>

          {/* Supported Wallets */}
          <div className="mt-12 pt-8 border-t border-arena-purple/20">
            <p className="text-sm text-gray-500 mb-4">Supported Wallets</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-xs font-bold">L</div>
                <span className="text-sm text-gray-300">Leather</span>
              </div>
              <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center text-xs font-bold">X</div>
                <span className="text-sm text-gray-300">Xverse</span>
              </div>
              <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                    <path d="M4.91 7.52L12 3l7.09 4.52-7.09 4.52-7.09-4.52zm0 8.96L12 21l7.09-4.52-7.09-4.52-7.09 4.52z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-300">WalletConnect</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">Powered by Reown AppKit</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
