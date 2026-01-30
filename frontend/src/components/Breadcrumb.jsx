import React from 'react'
import { HiChevronRight, HiHome } from 'react-icons/hi'

/**
 * Breadcrumb navigation component for showing page hierarchy
 */

const Breadcrumb = ({
  items = [],
  separator = 'chevron', // 'chevron', 'slash', 'dot'
  homeIcon = true,
  maxItems,
  className = ''
}) => {
  const separators = {
    chevron: <HiChevronRight className="w-4 h-4 text-gray-500" />,
    slash: <span className="text-gray-500">/</span>,
    dot: <span className="text-gray-500">•</span>,
    arrow: <span className="text-gray-500">→</span>
  }

  // Handle truncation for long breadcrumbs
  const getDisplayItems = () => {
    if (!maxItems || items.length <= maxItems) return items
    
    const firstItems = items.slice(0, 1)
    const lastItems = items.slice(-(maxItems - 2))
    
    return [
      ...firstItems,
      { label: '...', href: null, collapsed: true },
      ...lastItems
    ]
  }

  const displayItems = getDisplayItems()

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-1.5">
        {displayItems.map((item, index) => {
          const isFirst = index === 0
          const isLast = index === displayItems.length - 1
          const isCollapsed = item.collapsed

          return (
            <li key={index} className="flex items-center gap-1.5">
              {/* Separator (not for first item) */}
              {!isFirst && separators[separator]}
              
              {/* Breadcrumb item */}
              {isCollapsed ? (
                <span className="px-2 py-1 text-gray-500 cursor-default">
                  {item.label}
                </span>
              ) : isLast ? (
                <span 
                  className="px-2 py-1 text-gray-300 font-medium"
                  aria-current="page"
                >
                  {isFirst && homeIcon ? (
                    <span className="flex items-center gap-2">
                      <HiHome className="w-4 h-4" />
                      {item.label}
                    </span>
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className="px-2 py-1 text-gray-400 hover:text-arena-cyan 
                           transition-colors rounded-lg hover:bg-gray-700/30"
                >
                  {isFirst && homeIcon ? (
                    <span className="flex items-center gap-2">
                      <HiHome className="w-4 h-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </span>
                  ) : (
                    item.label
                  )}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Breadcrumb with dropdown for collapsed items
export const BreadcrumbWithDropdown = ({
  items = [],
  maxItems = 4,
  onNavigate,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false)

  if (items.length <= maxItems) {
    return <Breadcrumb items={items} className={className} />
  }

  const firstItem = items[0]
  const collapsedItems = items.slice(1, items.length - (maxItems - 2))
  const lastItems = items.slice(-(maxItems - 2))

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-1.5">
        {/* First item (Home) */}
        <li className="flex items-center gap-1.5">
          <a
            href={firstItem.href}
            onClick={(e) => {
              e.preventDefault()
              onNavigate?.(firstItem)
            }}
            className="px-2 py-1 text-gray-400 hover:text-arena-cyan 
                     transition-colors rounded-lg hover:bg-gray-700/30
                     flex items-center gap-2"
          >
            <HiHome className="w-4 h-4" />
            <span className="hidden sm:inline">{firstItem.label}</span>
          </a>
        </li>

        {/* Collapsed items dropdown */}
        <li className="flex items-center gap-1.5 relative">
          <HiChevronRight className="w-4 h-4 text-gray-500" />
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-2 py-1 text-gray-400 hover:text-arena-cyan 
                     transition-colors rounded-lg hover:bg-gray-700/30"
          >
            •••
          </button>
          
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-1 z-50
                            bg-arena-card border border-gray-700 rounded-xl
                            shadow-xl py-1 min-w-[150px]">
                {collapsedItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      setShowDropdown(false)
                      onNavigate?.(item)
                    }}
                    className="block px-3 py-2 text-sm text-gray-300
                             hover:bg-gray-700/50 hover:text-arena-cyan"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </>
          )}
        </li>

        {/* Visible last items */}
        {lastItems.map((item, index) => {
          const isLast = index === lastItems.length - 1
          return (
            <li key={index} className="flex items-center gap-1.5">
              <HiChevronRight className="w-4 h-4 text-gray-500" />
              {isLast ? (
                <span className="px-2 py-1 text-gray-300 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate?.(item)
                  }}
                  className="px-2 py-1 text-gray-400 hover:text-arena-cyan 
                           transition-colors rounded-lg hover:bg-gray-700/30"
                >
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Page header with breadcrumb
export const PageHeader = ({
  breadcrumbs = [],
  title,
  description,
  actions,
  badge,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-gray-400">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// Market breadcrumb (specific to StacksBet)
export const MarketBreadcrumb = ({
  category,
  marketTitle,
  onHomeClick,
  onCategoryClick,
  className = ''
}) => {
  const items = [
    { 
      label: 'Markets', 
      href: '/markets',
      onClick: (e) => {
        e.preventDefault()
        onHomeClick?.()
      }
    }
  ]

  if (category) {
    items.push({
      label: category,
      href: `/markets?category=${category}`,
      onClick: (e) => {
        e.preventDefault()
        onCategoryClick?.(category)
      }
    })
  }

  if (marketTitle) {
    items.push({
      label: marketTitle.length > 50 ? `${marketTitle.slice(0, 50)}...` : marketTitle,
      href: null
    })
  }

  return <Breadcrumb items={items} className={className} />
}

// Back button with breadcrumb-style navigation
export const BackNavigation = ({
  label = 'Back',
  href,
  onClick,
  showIcon = true,
  className = ''
}) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault()
          onClick()
        }
      }}
      className={`
        inline-flex items-center gap-2 text-gray-400 hover:text-arena-cyan
        transition-colors group
        ${className}
      `}
    >
      {showIcon && (
        <span className="transform group-hover:-translate-x-1 transition-transform">
          ←
        </span>
      )}
      {label}
    </a>
  )
}

// Stepped breadcrumb (for multi-step forms)
export const StepBreadcrumb = ({
  steps = [],
  currentStep,
  onStepClick,
  allowNavigation = true,
  className = ''
}) => {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isClickable = allowNavigation && (isCompleted || isCurrent)

          return (
            <li 
              key={index} 
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <button
                onClick={() => isClickable && onStepClick?.(stepNumber)}
                disabled={!isClickable}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg
                  transition-all duration-200
                  ${isCompleted 
                    ? 'text-arena-green hover:bg-arena-green/10' 
                    : isCurrent 
                      ? 'text-arena-purple font-medium' 
                      : 'text-gray-500'}
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                <span className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${isCompleted 
                    ? 'bg-arena-green text-white' 
                    : isCurrent 
                      ? 'bg-arena-purple text-white' 
                      : 'bg-gray-700 text-gray-400'}
                `}>
                  {isCompleted ? '✓' : stepNumber}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2">
                  <div className={`h-full ${isCompleted ? 'bg-arena-green' : 'bg-gray-700'}`} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
