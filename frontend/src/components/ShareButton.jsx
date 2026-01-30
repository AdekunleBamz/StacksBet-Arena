import React, { useState } from 'react'
import { HiShare, HiLink, HiCheck, HiMail } from 'react-icons/hi'
import { FaTwitter, FaDiscord, FaTelegram, FaReddit } from 'react-icons/fa'

/**
 * Share button component with social media integrations
 */

// Social platform configurations
const PLATFORMS = {
  twitter: {
    name: 'Twitter / X',
    icon: FaTwitter,
    color: 'hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2]',
    getUrl: (url, text) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  },
  farcaster: {
    name: 'Farcaster',
    icon: () => <span className="text-lg">🟣</span>,
    color: 'hover:bg-purple-500/20 hover:text-purple-400',
    getUrl: (url, text) => 
      `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`
  },
  telegram: {
    name: 'Telegram',
    icon: FaTelegram,
    color: 'hover:bg-[#0088cc]/20 hover:text-[#0088cc]',
    getUrl: (url, text) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  },
  discord: {
    name: 'Discord',
    icon: FaDiscord,
    color: 'hover:bg-[#5865F2]/20 hover:text-[#5865F2]',
    // Discord doesn't have a share URL, we copy to clipboard for Discord
    getUrl: null
  },
  reddit: {
    name: 'Reddit',
    icon: FaReddit,
    color: 'hover:bg-[#FF4500]/20 hover:text-[#FF4500]',
    getUrl: (url, title) => 
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  email: {
    name: 'Email',
    icon: HiMail,
    color: 'hover:bg-gray-500/20 hover:text-gray-300',
    getUrl: (url, subject, body) => 
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\n' + url)}`
  }
}

// Share Button
const ShareButton = ({
  url,
  title = '',
  text = '',
  platforms = ['twitter', 'farcaster', 'telegram', 'copy'],
  variant = 'icon', // 'icon', 'button', 'dropdown'
  size = 'md',
  onShare,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const shareText = text || title || 'Check this out!'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onShare?.('copy', shareUrl)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = (platform) => {
    const config = PLATFORMS[platform]
    if (!config) return

    if (config.getUrl) {
      const targetUrl = config.getUrl(shareUrl, shareText, title)
      window.open(targetUrl, '_blank', 'noopener,noreferrer,width=600,height=400')
    } else {
      handleCopy()
    }
    
    onShare?.(platform, shareUrl)
    setIsOpen(false)
  }

  // Native share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl
        })
        onShare?.('native', shareUrl)
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    } else {
      setIsOpen(true)
    }
  }

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  }

  // Simple icon variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleNativeShare}
        className={`
          ${sizes[size]} rounded-xl flex items-center justify-center
          bg-arena-card border border-gray-700 text-gray-400
          hover:border-arena-purple/50 hover:text-white
          transition-all duration-200
          ${className}
        `}
        aria-label="Share"
      >
        <HiShare className="w-5 h-5" />
      </button>
    )
  }

  // Button with text
  if (variant === 'button') {
    return (
      <button
        onClick={handleNativeShare}
        className={`
          px-4 py-2 rounded-xl flex items-center gap-2
          bg-arena-card border border-gray-700 text-white font-medium
          hover:border-arena-purple/50 hover:bg-arena-purple/10
          transition-all duration-200
          ${className}
        `}
      >
        <HiShare className="w-5 h-5" />
        Share
      </button>
    )
  }

  // Dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-4 py-2 rounded-xl flex items-center gap-2
          bg-arena-card border border-gray-700 text-white font-medium
          hover:border-arena-purple/50 hover:bg-arena-purple/10
          transition-all duration-200
        `}
      >
        <HiShare className="w-5 h-5" />
        Share
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 z-50 w-56
                        bg-arena-card border border-gray-700 rounded-xl
                        shadow-2xl overflow-hidden animate-dropdown">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Share to
              </p>
              
              {platforms.map((platform) => {
                if (platform === 'copy') {
                  return (
                    <button
                      key="copy"
                      onClick={handleCopy}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                               text-gray-300 hover:bg-gray-700/50 transition-colors"
                    >
                      {copied ? (
                        <HiCheck className="w-5 h-5 text-arena-green" />
                      ) : (
                        <HiLink className="w-5 h-5" />
                      )}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  )
                }

                const config = PLATFORMS[platform]
                if (!config) return null
                const Icon = config.icon

                return (
                  <button
                    key={platform}
                    onClick={() => handleShare(platform)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg
                               text-gray-300 transition-colors ${config.color}`}
                  >
                    <Icon className="w-5 h-5" />
                    {config.name}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Copy Link Button
export const CopyLinkButton = ({
  url,
  label = 'Copy Link',
  successLabel = 'Copied!',
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const urlToCopy = url || (typeof window !== 'undefined' ? window.location.href : '')
    try {
      await navigator.clipboard.writeText(urlToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  }

  const variants = {
    default: 'bg-arena-card border border-gray-700 hover:border-arena-purple/50',
    ghost: 'hover:bg-gray-700/50',
    outline: 'border border-gray-600 hover:border-arena-purple'
  }

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-2 rounded-xl font-medium
        text-white transition-all duration-200
        ${sizes[size]}
        ${variants[variant]}
        ${copied ? 'bg-arena-green/20 border-arena-green/30' : ''}
        ${className}
      `}
    >
      {copied ? (
        <>
          <HiCheck className="w-4 h-4 text-arena-green" />
          {successLabel}
        </>
      ) : (
        <>
          <HiLink className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  )
}

// Social Share Bar (horizontal icons)
export const SocialShareBar = ({
  url,
  title = '',
  text = '',
  platforms = ['twitter', 'farcaster', 'telegram', 'reddit'],
  size = 'md',
  className = ''
}) => {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const shareText = text || title

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {platforms.map((platform) => {
        const config = PLATFORMS[platform]
        if (!config) return null
        const Icon = config.icon

        const handleClick = () => {
          if (config.getUrl) {
            const targetUrl = config.getUrl(shareUrl, shareText, title)
            window.open(targetUrl, '_blank', 'noopener,noreferrer,width=600,height=400')
          }
        }

        return (
          <button
            key={platform}
            onClick={handleClick}
            className={`
              ${sizes[size]} rounded-xl flex items-center justify-center
              bg-arena-card border border-gray-700 text-gray-400
              transition-all duration-200 ${config.color}
            `}
            aria-label={`Share on ${config.name}`}
          >
            <Icon className="w-5 h-5" />
          </button>
        )
      })}
    </div>
  )
}

// Market Share Card
export const MarketShareCard = ({
  market,
  className = ''
}) => {
  const shareText = `${market.title} - Currently trading at ${market.yesPercentage}% YES on StacksBet Arena!`
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/market/${market.id}` 
    : ''

  return (
    <div className={`bg-arena-card border border-gray-700/50 rounded-xl p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-400 mb-3">Share this market</h4>
      
      <SocialShareBar
        url={shareUrl}
        title={market.title}
        text={shareText}
        platforms={['twitter', 'farcaster', 'telegram']}
      />
      
      <div className="mt-3 pt-3 border-t border-gray-700/50">
        <CopyLinkButton url={shareUrl} variant="ghost" size="sm" />
      </div>
    </div>
  )
}

// Share with Preview
export const ShareWithPreview = ({
  url,
  title,
  description,
  image,
  className = ''
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={`bg-arena-card border border-gray-700/50 rounded-xl overflow-hidden ${className}`}>
      {/* Preview */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex gap-3">
          {image && (
            <img 
              src={image} 
              alt="" 
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-white truncate">{title}</h4>
            <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
            <p className="text-xs text-gray-500 mt-1 truncate">{url}</p>
          </div>
        </div>
      </div>

      {/* Copy URL */}
      <div className="p-3 flex items-center gap-2 bg-gray-800/30">
        <input
          type="text"
          value={url}
          readOnly
          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700
                   text-sm text-gray-300 truncate"
        />
        <button
          onClick={handleCopy}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all
            ${copied 
              ? 'bg-arena-green text-white' 
              : 'bg-arena-purple text-white hover:bg-arena-purple/80'}
          `}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

// Animation styles
const styles = `
  @keyframes dropdown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-dropdown {
    animation: dropdown 0.15s ease-out;
  }
`

if (typeof document !== 'undefined') {
  const existing = document.querySelector('[data-share-styles]')
  if (!existing) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-share-styles', 'true')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default ShareButton
