import React, { useEffect, useState } from 'react'
import { HiArrowRight, HiPlusCircle } from 'react-icons/hi'

const Hero = ({ onConnect, isConnected, onCreateMarket }) => {
  const [isVisible, setIsVisible] = useState(false)

  // Trigger entrance animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      emoji: '🎯',
      title: 'Binary Markets',
      description: 'Simple YES/NO predictions with dynamic odds based on market activity'
    },
    {
      emoji: '💰',
      title: 'Earn Fees',
      description: 'Create markets and earn 0.5% of all trading volume on your markets'
    },
    {
      emoji: '🏆',
      title: 'Leaderboard',
      description: 'Compete with other traders and climb the rankings to earn rewards'
    }
  ]

  const wallets = [
    { name: 'Leather', color: 'bg-orange-500', letter: 'L' },
    { name: 'Xverse', color: 'bg-green-500', letter: 'X' },
    { name: 'WalletConnect', color: 'bg-blue-500', icon: true }
  ]

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Status Badge with animation */}
          <div 
            className={`inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8 transform transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="pulse-dot" aria-hidden="true" />
            <span className="text-sm text-gray-300">Live Prediction Markets</span>
          </div>
          
          {/* Main Heading with staggered animation */}
          <h1 
            className={`text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 transform transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="text-white inline-block hover:scale-105 transition-transform cursor-default">
              Predict.
            </span>
            <br />
            <span className="gradient-text inline-block animate-gradient-shift">
              Bet. Win.
            </span>
          </h1>
          
          {/* Description with animation */}
          <p 
            className={`text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 transform transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Decentralized prediction markets on Stacks. Bet on crypto prices, sports, 
            politics, and more. Create your own markets and earn fees.
          </p>
          
          {/* CTA Buttons with animation */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transform transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {!isConnected ? (
              <button
                onClick={onConnect}
                className="btn-primary px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-3 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 group"
                aria-label="Connect your wallet to start betting"
              >
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
                </svg>
                Connect Wallet
                <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
            ) : null}
            <button
              onClick={onCreateMarket}
              className="btn-primary px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2 w-full sm:w-auto hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Create a new prediction market"
            >
              <HiPlusCircle className="w-5 h-5" aria-hidden="true" /> 
              Create Market
            </button>
            <a 
              href="#markets" 
              className="btn-secondary px-8 py-4 rounded-2xl font-semibold text-lg w-full sm:w-auto text-center hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-arena-purple"
            >
              Explore Markets
            </a>
          </div>
          
          {/* Feature Cards with staggered animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={`glass-card p-6 rounded-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:shadow-arena-purple/20 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                <div 
                  className="text-3xl mb-3 transform hover:scale-125 hover:rotate-12 transition-transform inline-block"
                  role="img" 
                  aria-label={feature.title}
                >
                  {feature.emoji}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Supported Wallets with animation */}
          <div 
            className={`mt-12 pt-8 border-t border-arena-purple/20 transform transition-all duration-700 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-sm text-gray-500 mb-4">Supported Wallets</p>
            <div className="flex flex-wrap items-center justify-center gap-6" role="list" aria-label="Supported wallets">
              {wallets.map((wallet, index) => (
                <div 
                  key={wallet.name}
                  className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 hover:bg-arena-purple/10 transition-all cursor-default"
                  style={{ animationDelay: `${800 + index * 100}ms` }}
                  role="listitem"
                >
                  <div className={`w-6 h-6 rounded ${wallet.color} flex items-center justify-center text-xs font-bold`}>
                    {wallet.icon ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                        <path d="M4.91 7.52L12 3l7.09 4.52-7.09 4.52-7.09-4.52zm0 8.96L12 21l7.09-4.52-7.09-4.52-7.09 4.52z"/>
                      </svg>
                    ) : wallet.letter}
                  </div>
                  <span className="text-sm text-gray-300">{wallet.name}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-4">Powered by Reown AppKit</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
