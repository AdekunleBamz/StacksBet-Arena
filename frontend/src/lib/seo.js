import React, { useEffect } from 'react'

/**
 * SEO utilities and meta tag management for StacksBet Arena
 */

// Default SEO configuration
const DEFAULT_SEO = {
  siteName: 'StacksBet Arena',
  title: 'StacksBet Arena - Decentralized Prediction Markets on Stacks',
  description: 'Trade on the future with decentralized prediction markets powered by Stacks blockchain. Create markets, bet on outcomes, and earn rewards.',
  url: 'https://stacksbet.arena',
  image: '/og-image.png',
  twitterHandle: '@StacksBetArena',
  themeColor: '#8B5CF6'
}

/**
 * Update document meta tags dynamically
 */
export const updateMetaTags = ({
  title,
  description,
  image,
  url,
  type = 'website',
  article
}) => {
  const fullTitle = title 
    ? `${title} | ${DEFAULT_SEO.siteName}`
    : DEFAULT_SEO.title

  // Basic meta tags
  document.title = fullTitle
  
  const metaTags = {
    'description': description || DEFAULT_SEO.description,
    'theme-color': DEFAULT_SEO.themeColor,
    
    // Open Graph
    'og:title': fullTitle,
    'og:description': description || DEFAULT_SEO.description,
    'og:image': image || DEFAULT_SEO.image,
    'og:url': url || DEFAULT_SEO.url,
    'og:type': type,
    'og:site_name': DEFAULT_SEO.siteName,
    
    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:site': DEFAULT_SEO.twitterHandle,
    'twitter:title': fullTitle,
    'twitter:description': description || DEFAULT_SEO.description,
    'twitter:image': image || DEFAULT_SEO.image
  }

  // Add article-specific meta tags
  if (type === 'article' && article) {
    metaTags['article:published_time'] = article.publishedTime
    metaTags['article:modified_time'] = article.modifiedTime
    metaTags['article:author'] = article.author
  }

  // Update or create meta tags
  Object.entries(metaTags).forEach(([name, content]) => {
    if (!content) return

    const isOg = name.startsWith('og:')
    const isTwitter = name.startsWith('twitter:')
    const isArticle = name.startsWith('article:')
    
    let selector, attribute
    if (isOg || isArticle) {
      selector = `meta[property="${name}"]`
      attribute = 'property'
    } else {
      selector = `meta[name="${name}"]`
      attribute = 'name'
    }

    let element = document.querySelector(selector)
    
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attribute, name)
      document.head.appendChild(element)
    }
    
    element.setAttribute('content', content)
  })
}

/**
 * Hook for managing SEO in functional components
 */
export const useSEO = (options = {}) => {
  useEffect(() => {
    updateMetaTags(options)
    
    // Cleanup: restore defaults when component unmounts
    return () => {
      updateMetaTags({})
    }
  }, [options.title, options.description, options.image, options.url])
}

/**
 * SEO Component for declarative usage
 */
const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false,
  noFollow = false,
  canonical,
  children
}) => {
  useEffect(() => {
    updateMetaTags({ title, description, image, url, type })

    // Handle robots meta tag
    if (noIndex || noFollow) {
      const robots = []
      if (noIndex) robots.push('noindex')
      if (noFollow) robots.push('nofollow')
      
      let robotsTag = document.querySelector('meta[name="robots"]')
      if (!robotsTag) {
        robotsTag = document.createElement('meta')
        robotsTag.setAttribute('name', 'robots')
        document.head.appendChild(robotsTag)
      }
      robotsTag.setAttribute('content', robots.join(', '))
    }

    // Handle canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]')
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', canonical)
    }
  }, [title, description, image, url, type, noIndex, noFollow, canonical])

  return children || null
}

/**
 * Generate SEO data for a market
 */
export const getMarketSEO = (market) => {
  return {
    title: market.title,
    description: `Bet on "${market.title}". Current odds: ${market.yesPercentage}% Yes / ${market.noPercentage}% No. Trade now on StacksBet Arena.`,
    url: `${DEFAULT_SEO.url}/market/${market.id}`,
    image: market.image || DEFAULT_SEO.image,
    type: 'website'
  }
}

/**
 * Generate SEO data for user profile
 */
export const getUserProfileSEO = (user) => {
  const truncatedAddress = `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
  
  return {
    title: `${user.name || truncatedAddress} - Trader Profile`,
    description: `View ${user.name || truncatedAddress}'s trading history on StacksBet Arena. ${user.totalBets} bets with ${user.winRate}% win rate.`,
    url: `${DEFAULT_SEO.url}/profile/${user.address}`,
    type: 'profile'
  }
}

/**
 * Structured Data (JSON-LD) for rich snippets
 */
export const StructuredData = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * Generate Organization structured data
 */
export const getOrganizationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: DEFAULT_SEO.siteName,
  url: DEFAULT_SEO.url,
  logo: `${DEFAULT_SEO.url}/logo.png`,
  sameAs: [
    'https://twitter.com/StacksBetArena',
    'https://warpcast.com/stacksbet'
  ]
})

/**
 * Generate WebApplication structured data
 */
export const getWebApplicationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: DEFAULT_SEO.siteName,
  url: DEFAULT_SEO.url,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  }
})

/**
 * Generate FAQ structured data
 */
export const getFAQStructuredData = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
})

/**
 * Page-specific SEO components
 */
export const HomePageSEO = () => (
  <SEO
    title={null}
    description="Trade on the future with decentralized prediction markets on Stacks blockchain. Create markets, bet on outcomes, and earn rewards."
  >
    <StructuredData data={getOrganizationStructuredData()} />
    <StructuredData data={getWebApplicationStructuredData()} />
  </SEO>
)

export const MarketPageSEO = ({ market }) => {
  const seo = getMarketSEO(market)
  return (
    <SEO
      title={seo.title}
      description={seo.description}
      url={seo.url}
      image={seo.image}
    />
  )
}

export const CreateMarketPageSEO = () => (
  <SEO
    title="Create a Prediction Market"
    description="Create your own prediction market on StacksBet Arena. Set the question, define outcomes, and let the community trade."
  />
)

export const LeaderboardPageSEO = () => (
  <SEO
    title="Leaderboard - Top Traders"
    description="See the top traders on StacksBet Arena. Rankings based on profit, win rate, and trading volume."
  />
)

export const ProfilePageSEO = ({ user }) => {
  const seo = getUserProfileSEO(user)
  return (
    <SEO
      title={seo.title}
      description={seo.description}
      url={seo.url}
    />
  )
}

/**
 * Social sharing meta tags generator
 */
export const generateShareMeta = (content) => {
  const encodedTitle = encodeURIComponent(content.title)
  const encodedUrl = encodeURIComponent(content.url)
  
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    farcaster: `https://warpcast.com/~/compose?text=${encodedTitle}&embeds[]=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
  }
}

export default SEO
