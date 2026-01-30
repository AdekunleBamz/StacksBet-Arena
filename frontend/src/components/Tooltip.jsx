import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

/**
 * Tooltip component with multiple positions and trigger modes
 * Supports hover, click, and focus triggers
 */

// Position calculations
const calculatePosition = (triggerRect, tooltipRect, position, offset = 8) => {
  const positions = {
    top: {
      top: triggerRect.top - tooltipRect.height - offset,
      left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
    },
    bottom: {
      top: triggerRect.bottom + offset,
      left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
    },
    left: {
      top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
      left: triggerRect.left - tooltipRect.width - offset
    },
    right: {
      top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
      left: triggerRect.right + offset
    },
    'top-start': {
      top: triggerRect.top - tooltipRect.height - offset,
      left: triggerRect.left
    },
    'top-end': {
      top: triggerRect.top - tooltipRect.height - offset,
      left: triggerRect.right - tooltipRect.width
    },
    'bottom-start': {
      top: triggerRect.bottom + offset,
      left: triggerRect.left
    },
    'bottom-end': {
      top: triggerRect.bottom + offset,
      left: triggerRect.right - tooltipRect.width
    }
  }

  const pos = positions[position] || positions.top

  // Boundary checking - keep tooltip in viewport
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const scrollY = window.scrollY
  const scrollX = window.scrollX

  return {
    top: Math.max(scrollY + 8, Math.min(pos.top, scrollY + viewportHeight - tooltipRect.height - 8)),
    left: Math.max(scrollX + 8, Math.min(pos.left, scrollX + viewportWidth - tooltipRect.width - 8))
  }
}

// Arrow position based on tooltip position
const getArrowStyles = (position) => {
  const arrows = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-gray-800 border-x-transparent border-b-transparent',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-gray-800 border-x-transparent border-t-transparent',
    left: 'right-0 top-1/2 translate-x-full -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent',
    right: 'left-0 top-1/2 -translate-x-full -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent',
    'top-start': 'bottom-0 left-4 translate-y-full border-t-gray-800 border-x-transparent border-b-transparent',
    'top-end': 'bottom-0 right-4 translate-y-full border-t-gray-800 border-x-transparent border-b-transparent',
    'bottom-start': 'top-0 left-4 -translate-y-full border-b-gray-800 border-x-transparent border-t-transparent',
    'bottom-end': 'top-0 right-4 -translate-y-full border-b-gray-800 border-x-transparent border-t-transparent'
  }
  return arrows[position] || arrows.top
}

const Tooltip = ({
  children,
  content,
  position = 'top',
  trigger = 'hover', // 'hover' | 'click' | 'focus' | 'manual'
  isOpen: controlledIsOpen,
  onOpenChange,
  delay = 200,
  offset = 8,
  showArrow = true,
  className = '',
  contentClassName = '',
  disabled = false,
  maxWidth = 250
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  // Use controlled or uncontrolled state
  const open = controlledIsOpen !== undefined ? controlledIsOpen : isOpen
  const setOpen = useCallback((value) => {
    if (controlledIsOpen === undefined) {
      setIsOpen(value)
    }
    onOpenChange?.(value)
  }, [controlledIsOpen, onOpenChange])

  // Update position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const newCoords = calculatePosition(triggerRect, tooltipRect, position, offset)
    setCoords(newCoords)
  }, [position, offset])

  // Open with delay
  const openWithDelay = useCallback(() => {
    if (disabled) return
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(true), delay)
  }, [delay, disabled, setOpen])

  // Close with delay
  const closeWithDelay = useCallback(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(false), 100)
  }, [setOpen])

  // Handle click trigger
  const handleClick = useCallback(() => {
    if (trigger === 'click' && !disabled) {
      setOpen(!open)
    }
  }, [trigger, disabled, open, setOpen])

  // Handle keyboard
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && open) {
      setOpen(false)
    }
  }, [open, setOpen])

  // Update position when open changes
  useEffect(() => {
    if (open) {
      // Small delay to ensure tooltip is rendered
      requestAnimationFrame(updatePosition)
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  // Cleanup timeout
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  // Close on outside click for click trigger
  useEffect(() => {
    if (trigger === 'click' && open) {
      const handleOutsideClick = (e) => {
        if (
          triggerRef.current && !triggerRef.current.contains(e.target) &&
          tooltipRef.current && !tooltipRef.current.contains(e.target)
        ) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleOutsideClick)
      return () => document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [trigger, open, setOpen])

  // Trigger props based on trigger mode
  const triggerProps = {
    ref: triggerRef,
    'aria-describedby': open ? 'tooltip' : undefined,
    ...(trigger === 'hover' && {
      onMouseEnter: openWithDelay,
      onMouseLeave: closeWithDelay
    }),
    ...(trigger === 'click' && {
      onClick: handleClick
    }),
    ...(trigger === 'focus' && {
      onFocus: () => !disabled && setOpen(true),
      onBlur: () => setOpen(false)
    }),
    onKeyDown: handleKeyDown
  }

  if (!content) return children

  return (
    <>
      {/* Trigger element */}
      {React.cloneElement(children, triggerProps)}

      {/* Tooltip portal */}
      {open && createPortal(
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`fixed z-50 pointer-events-none animate-fade-in ${className}`}
          style={{
            top: coords.top,
            left: coords.left,
            maxWidth
          }}
          onMouseEnter={trigger === 'hover' ? () => clearTimeout(timeoutRef.current) : undefined}
          onMouseLeave={trigger === 'hover' ? closeWithDelay : undefined}
        >
          <div className={`relative bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-xl ${contentClassName}`}>
            {content}
            
            {/* Arrow */}
            {showArrow && (
              <span 
                className={`absolute w-0 h-0 border-[6px] ${getArrowStyles(position)}`}
                aria-hidden="true"
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// Info tooltip preset
export const InfoTooltip = ({ content, children, ...props }) => (
  <Tooltip content={content} {...props}>
    {children || (
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-arena-purple/30 text-xs text-arena-cyan cursor-help">
        ?
      </span>
    )}
  </Tooltip>
)

// Help text tooltip
export const HelpTooltip = ({ text }) => (
  <InfoTooltip content={text}>
    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-600 text-xs text-gray-500 cursor-help hover:border-arena-purple hover:text-arena-purple transition-colors">
      ?
    </span>
  </InfoTooltip>
)

export default Tooltip
