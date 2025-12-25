import React from 'react'
import { FiGithub, FiTwitter, FiExternalLink } from 'react-icons/fi'
import { HiOutlineLightningBolt } from 'react-icons/hi'

const Footer = () => {
  return (
    <footer className="border-t border-arena-purple/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-purple to-arena-pink flex items-center justify-center">
                <HiOutlineLightningBolt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  <span className="gradient-text">StacksBet</span>
                  <span className="text-white"> Arena</span>
                </h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm max-w-md mb-6">
              Decentralized prediction markets on Stacks. Bet on anything, create your own markets, 
              and earn rewards. Powered by Reown AppKit.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/AdekunleBamz" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:bg-arena-purple/20 transition-colors">
                <FiGithub className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/hrh_mckay" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:bg-arena-purple/20 transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#markets" className="text-gray-400 hover:text-white transition-colors">Markets</a></li>
              <li><a href="#leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</a></li>
              <li><a href="#create" className="text-gray-400 hover:text-white transition-colors">Create Market</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://docs.stacks.co" target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  Documentation <FiExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://reown.com" target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  Reown <FiExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://github.com/AdekunleBamz/stacksbet-arena" target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  GitHub <FiExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-arena-purple/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-500 text-sm">© 2025 StacksBet Arena. Built with Reown AppKit.</p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0">
            Powered by <span className="text-arena-purple">Stacks</span> • Secured by <span className="text-arena-gold">Bitcoin</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
