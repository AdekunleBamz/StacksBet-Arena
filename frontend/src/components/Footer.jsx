import React from 'react'
import { FiGithub, FiTwitter, FiExternalLink } from 'react-icons/fi'
import { HiOutlineLightningBolt } from 'react-icons/hi'
import { SiFarcaster } from 'react-icons/si'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/AdekunleBamz',
      icon: FiGithub,
      hoverColor: 'hover:bg-gray-700/50'
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/hrh_mckay',
      icon: FiTwitter,
      hoverColor: 'hover:bg-blue-500/20'
    },
    {
      name: 'Farcaster',
      href: 'https://warpcast.com/bamzzz',
      icon: SiFarcaster,
      hoverColor: 'hover:bg-purple-500/20'
    }
  ]

  const platformLinks = [
    { name: 'Markets', href: '#markets' },
    { name: 'Leaderboard', href: '#leaderboard' },
    { name: 'Create Market', href: '#create' },
    { name: 'My Bets', href: '#my-bets' }
  ]

  const resourceLinks = [
    { name: 'Documentation', href: 'https://docs.stacks.co', external: true },
    { name: 'Reown AppKit', href: 'https://reown.com', external: true },
    { name: 'GitHub Repo', href: 'https://github.com/AdekunleBamz/StacksBet-Arena', external: true },
    { name: 'Stacks Explorer', href: 'https://explorer.hiro.so', external: true }
  ]

  return (
    <footer 
      className="border-t border-arena-purple/20 mt-20"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-purple to-arena-pink flex items-center justify-center"
                aria-hidden="true"
              >
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
            
            {/* Social Links */}
            <div className="flex space-x-3" role="list" aria-label="Social media links">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-lg glass-card flex items-center justify-center ${social.hoverColor} transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-arena-purple`}
                  aria-label={`Follow us on ${social.name}`}
                  role="listitem"
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Platform</h4>
            <nav aria-label="Platform navigation">
              <ul className="space-y-2 text-sm">
                {platformLinks.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:text-white"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <nav aria-label="Resources navigation">
              <ul className="space-y-2 text-sm">
                {resourceLinks.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 focus:outline-none focus:text-white"
                      aria-label={link.external ? `${link.name} (opens in new tab)` : link.name}
                    >
                      {link.name}
                      {link.external && (
                        <FiExternalLink className="w-3 h-3" aria-hidden="true" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-arena-purple/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} StacksBet Arena. Built with Reown AppKit.
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <span>Powered by</span>
            <span className="text-arena-purple font-medium">Stacks</span>
            <span>•</span>
            <span>Secured by</span>
            <span className="text-arena-gold font-medium">Bitcoin</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
