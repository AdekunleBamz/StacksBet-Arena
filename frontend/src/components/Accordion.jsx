import React, { useState, createContext, useContext, useRef, useEffect } from 'react'
import { HiChevronDown, HiPlus, HiMinus } from 'react-icons/hi'

/**
 * Accordion component for expandable content sections
 */

const AccordionContext = createContext({})
const AccordionItemContext = createContext({})

const Accordion = ({
  children,
  type = 'single', // 'single' or 'multiple'
  defaultValue = type === 'single' ? null : [],
  collapsible = true, // Only for single type
  variant = 'default',
  className = ''
}) => {
  const [value, setValue] = useState(defaultValue)

  const toggleItem = (itemValue) => {
    if (type === 'single') {
      if (value === itemValue && collapsible) {
        setValue(null)
      } else {
        setValue(itemValue)
      }
    } else {
      if (value.includes(itemValue)) {
        setValue(value.filter(v => v !== itemValue))
      } else {
        setValue([...value, itemValue])
      }
    }
  }

  const isOpen = (itemValue) => {
    if (type === 'single') {
      return value === itemValue
    }
    return value.includes(itemValue)
  }

  return (
    <AccordionContext.Provider value={{ toggleItem, isOpen, variant }}>
      <div className={`space-y-2 ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

// Accordion Item
export const AccordionItem = ({
  value,
  children,
  disabled = false,
  className = ''
}) => {
  const { isOpen, variant } = useContext(AccordionContext)
  const open = isOpen(value)

  const variants = {
    default: 'bg-arena-card border border-gray-700/50 rounded-xl overflow-hidden',
    bordered: 'border-b border-gray-700 last:border-b-0',
    filled: 'bg-gray-800/50 rounded-xl overflow-hidden',
    ghost: ''
  }

  return (
    <AccordionItemContext.Provider value={{ value, open, disabled }}>
      <div className={`${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

// Accordion Trigger
export const AccordionTrigger = ({
  children,
  icon,
  iconType = 'chevron', // 'chevron' or 'plus-minus'
  className = ''
}) => {
  const { toggleItem, variant } = useContext(AccordionContext)
  const { value, open, disabled } = useContext(AccordionItemContext)

  const IconComponent = () => {
    if (iconType === 'plus-minus') {
      return open ? <HiMinus className="w-5 h-5" /> : <HiPlus className="w-5 h-5" />
    }
    return (
      <HiChevronDown 
        className={`w-5 h-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      />
    )
  }

  const variantStyles = {
    default: 'px-4 py-4',
    bordered: 'py-4',
    filled: 'px-4 py-4',
    ghost: 'py-3'
  }

  return (
    <button
      type="button"
      onClick={() => !disabled && toggleItem(value)}
      disabled={disabled}
      aria-expanded={open}
      aria-controls={`accordion-content-${value}`}
      className={`
        w-full flex items-center justify-between gap-4
        text-left font-semibold text-white
        transition-colors duration-200
        hover:text-arena-cyan
        disabled:cursor-not-allowed disabled:hover:text-white
        focus:outline-none focus:ring-2 focus:ring-arena-purple/50 focus:ring-inset
        ${variantStyles[variant]}
        ${className}
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <span className={`flex-shrink-0 ${open ? 'text-arena-purple' : 'text-gray-400'}`}>
            {icon}
          </span>
        )}
        <span className="truncate">{children}</span>
      </div>
      <span className={`flex-shrink-0 transition-colors ${open ? 'text-arena-purple' : 'text-gray-400'}`}>
        <IconComponent />
      </span>
    </button>
  )
}

// Accordion Content
export const AccordionContent = ({
  children,
  className = ''
}) => {
  const { variant } = useContext(AccordionContext)
  const { value, open } = useContext(AccordionItemContext)
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? contentRef.current.scrollHeight : 0)
    }
  }, [open])

  const variantStyles = {
    default: 'px-4 pb-4',
    bordered: 'pb-4',
    filled: 'px-4 pb-4',
    ghost: 'pb-3'
  }

  return (
    <div
      id={`accordion-content-${value}`}
      role="region"
      aria-labelledby={`accordion-trigger-${value}`}
      style={{ height: `${height}px` }}
      className="overflow-hidden transition-all duration-300 ease-out"
    >
      <div ref={contentRef} className={`${variantStyles[variant]} ${className}`}>
        <div className="text-gray-400 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

// FAQ Accordion (specialized)
export const FAQAccordion = ({
  items = [],
  className = ''
}) => {
  return (
    <Accordion type="single" collapsible variant="default" className={className}>
      {items.map((item, index) => (
        <AccordionItem key={index} value={`faq-${index}`}>
          <AccordionTrigger>
            {item.question}
          </AccordionTrigger>
          <AccordionContent>
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// Expandable Section
export const ExpandableSection = ({
  title,
  children,
  defaultOpen = false,
  badge,
  icon,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`bg-arena-card border border-gray-700/50 rounded-xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 px-4 py-4 
                   text-left font-semibold text-white hover:text-arena-cyan transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-gray-400">{icon}</span>}
          <span>{title}</span>
          {badge !== undefined && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-arena-purple/20 text-arena-purple">
              {badge}
            </span>
          )}
        </div>
        <HiChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      <div
        className={`
          overflow-hidden transition-all duration-300
          ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 pb-4 text-gray-400 text-sm">
          {children}
        </div>
      </div>
    </div>
  )
}

// Collapsible Card
export const CollapsibleCard = ({
  header,
  children,
  defaultOpen = true,
  onToggle,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onToggle?.(newState)
  }

  return (
    <div className={`bg-arena-card border border-gray-700/50 rounded-2xl overflow-hidden ${className}`}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
        onClick={handleToggle}
      >
        {header}
        <button
          type="button"
          className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
          aria-expanded={isOpen}
        >
          <HiChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      
      <div
        className={`
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
        `}
      >
        <div className="border-t border-gray-700/50 p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// Details Component (HTML5 styled)
export const Details = ({
  summary,
  children,
  open = false,
  className = ''
}) => {
  return (
    <details 
      open={open}
      className={`
        bg-arena-card border border-gray-700/50 rounded-xl
        group
        ${className}
      `}
    >
      <summary className="
        px-4 py-3 cursor-pointer font-medium text-white
        hover:text-arena-cyan transition-colors
        list-none flex items-center justify-between
        [&::-webkit-details-marker]:hidden
      ">
        {summary}
        <HiChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 text-gray-400 text-sm">
        {children}
      </div>
    </details>
  )
}

// Market Rules Accordion (specific to StacksBet)
export const MarketRulesAccordion = ({
  rules = [],
  className = ''
}) => {
  const defaultRules = [
    {
      title: 'How Predictions Work',
      content: 'Markets are created around specific outcomes. Buy YES if you think the outcome will happen, or NO if you think it won\'t. Prices reflect the market\'s probability estimate.'
    },
    {
      title: 'Resolution',
      content: 'Markets are resolved by the creator based on the outcome. Once resolved, winning positions can claim their rewards.'
    },
    {
      title: 'Fees',
      content: 'A small fee is charged on winnings to support platform development and liquidity providers.'
    }
  ]

  const finalRules = rules.length > 0 ? rules : defaultRules

  return (
    <Accordion type="multiple" variant="bordered" className={className}>
      {finalRules.map((rule, index) => (
        <AccordionItem key={index} value={`rule-${index}`}>
          <AccordionTrigger iconType="plus-minus">
            {rule.title}
          </AccordionTrigger>
          <AccordionContent>
            {rule.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default Accordion
