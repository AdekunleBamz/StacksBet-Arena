import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
import { FiArrowRight, FiArrowLeft, FiX, FiCheck, FiChevronRight } from 'react-icons/fi'

/**
 * Onboarding tour system for StacksBet Arena
 */

// Onboarding context
const OnboardingContext = createContext(null)

// Tour step positions
const POSITIONS = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
  left: 'right-full top-1/2 -translate-y-1/2 mr-3',
  right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  'top-left': 'bottom-full left-0 mb-3',
  'top-right': 'bottom-full right-0 mb-3',
  'bottom-left': 'top-full left-0 mt-3',
  'bottom-right': 'top-full right-0 mt-3'
}

// Arrow positions
const ARROW_POSITIONS = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800'
}

/**
 * Onboarding Provider
 */
export const OnboardingProvider = ({ children, steps = [], storageKey = 'stacksbet_onboarding' }) => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [dismissedForever, setDismissedForever] = useState(false)

  // Load state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const data = JSON.parse(saved)
        setHasCompleted(data.completed || false)
        setDismissedForever(data.dismissed || false)
      }
    } catch (e) {
      console.error('Error loading onboarding state:', e)
    }
  }, [storageKey])

  // Save state to localStorage
  const saveState = useCallback((completed, dismissed) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ completed, dismissed }))
    } catch (e) {
      console.error('Error saving onboarding state:', e)
    }
  }, [storageKey])

  // Start tour
  const startTour = useCallback(() => {
    setCurrentStep(0)
    setIsActive(true)
  }, [])

  // End tour
  const endTour = useCallback((completed = false) => {
    setIsActive(false)
    if (completed) {
      setHasCompleted(true)
      saveState(true, dismissedForever)
    }
  }, [dismissedForever, saveState])

  // Dismiss forever
  const dismissForever = useCallback(() => {
    setDismissedForever(true)
    setIsActive(false)
    saveState(hasCompleted, true)
  }, [hasCompleted, saveState])

  // Reset tour
  const resetTour = useCallback(() => {
    setHasCompleted(false)
    setDismissedForever(false)
    setCurrentStep(0)
    saveState(false, false)
  }, [saveState])

  // Navigation
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1)
    } else {
      endTour(true)
    }
  }, [currentStep, steps.length, endTour])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((index) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStep(index)
    }
  }, [steps.length])

  return (
    <OnboardingContext.Provider value={{
      isActive,
      currentStep,
      totalSteps: steps.length,
      currentStepData: steps[currentStep],
      hasCompleted,
      dismissedForever,
      startTour,
      endTour,
      dismissForever,
      resetTour,
      nextStep,
      prevStep,
      goToStep
    }}>
      {children}
      {isActive && steps[currentStep] && (
        <TourOverlay steps={steps} />
      )}
    </OnboardingContext.Provider>
  )
}

// Hook to use onboarding
export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}

/**
 * Tour Overlay
 */
const TourOverlay = ({ steps }) => {
  const { currentStep, currentStepData, endTour } = useOnboarding()
  const [targetRect, setTargetRect] = useState(null)
  const [position, setPosition] = useState(currentStepData?.position || 'bottom')

  // Find and highlight target element
  useEffect(() => {
    if (!currentStepData?.target) return

    const findTarget = () => {
      const element = document.querySelector(currentStepData.target)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
        
        // Auto-position based on available space
        if (!currentStepData.position) {
          const viewportHeight = window.innerHeight
          const viewportWidth = window.innerWidth
          
          if (rect.bottom + 200 < viewportHeight) {
            setPosition('bottom')
          } else if (rect.top > 200) {
            setPosition('top')
          } else if (rect.left > viewportWidth / 2) {
            setPosition('left')
          } else {
            setPosition('right')
          }
        } else {
          setPosition(currentStepData.position)
        }
      }
    }

    findTarget()
    window.addEventListener('resize', findTarget)
    window.addEventListener('scroll', findTarget)

    return () => {
      window.removeEventListener('resize', findTarget)
      window.removeEventListener('scroll', findTarget)
    }
  }, [currentStepData])

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Backdrop with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Highlighted border around target */}
      {targetRect && (
        <div
          className="absolute border-2 border-purple-500 rounded-lg pointer-events-none"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.3)'
          }}
        />
      )}

      {/* Tooltip */}
      {targetRect && (
        <TourTooltip
          targetRect={targetRect}
          position={position}
          step={currentStepData}
        />
      )}

      {/* Close button */}
      <button
        onClick={() => endTour(false)}
        className="
          absolute top-4 right-4
          p-2 rounded-full
          bg-slate-800 text-slate-400
          hover:text-white transition-colors
        "
      >
        <FiX className="w-5 h-5" />
      </button>
    </div>
  )
}

/**
 * Tour Tooltip
 */
const TourTooltip = ({ targetRect, position, step }) => {
  const { currentStep, totalSteps, nextStep, prevStep, endTour } = useOnboarding()
  const isLast = currentStep === totalSteps - 1

  // Calculate tooltip position
  const getTooltipStyle = () => {
    const padding = 16
    const tooltipWidth = 320

    switch (position) {
      case 'bottom':
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)'
        }
      case 'top':
        return {
          bottom: window.innerHeight - targetRect.top + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)'
        }
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          right: window.innerWidth - targetRect.left + padding,
          transform: 'translateY(-50%)'
        }
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: 'translateY(-50%)'
        }
      default:
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left
        }
    }
  }

  return (
    <div
      className="absolute w-80 bg-slate-800 rounded-xl shadow-2xl overflow-hidden"
      style={getTooltipStyle()}
    >
      {/* Progress bar */}
      <div className="h-1 bg-slate-700">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        {step.icon && (
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
            {step.icon}
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-white mb-2">
          {step.title}
        </h3>
        
        <p className="text-slate-300 text-sm leading-relaxed">
          {step.content}
        </p>

        {step.tip && (
          <div className="mt-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-sm text-purple-300">💡 {step.tip}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-slate-900/50 flex items-center justify-between">
        <span className="text-sm text-slate-400">
          Step {currentStep + 1} of {totalSteps}
        </span>
        
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="
                px-3 py-1.5 rounded-lg
                text-slate-400 hover:text-white
                transition-colors flex items-center gap-1
              "
            >
              <FiArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={nextStep}
            className="
              px-4 py-1.5 rounded-lg
              bg-purple-500 hover:bg-purple-600
              text-white font-medium
              transition-colors flex items-center gap-1
            "
          >
            {isLast ? (
              <>
                Finish
                <FiCheck className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Tour Step Indicator
 */
export const TourStepIndicator = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isComplete = index < currentStep
        const isCurrent = index === currentStep
        const isClickable = index <= currentStep

        return (
          <button
            key={index}
            onClick={() => isClickable && onStepClick?.(index)}
            disabled={!isClickable}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-200
              ${isCurrent 
                ? 'bg-purple-500 text-white scale-110' 
                : isComplete
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-700 text-slate-400'}
              ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
            `}
          >
            {isComplete ? (
              <FiCheck className="w-4 h-4" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Welcome Modal for new users
 */
export const WelcomeModal = ({
  isOpen,
  onClose,
  onStartTour,
  onSkip
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="
        relative bg-slate-900 border border-slate-700
        rounded-2xl shadow-2xl max-w-md w-full
        overflow-hidden
      ">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Logo */}
          <div className="
            w-20 h-20 mx-auto mb-6
            rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500
            flex items-center justify-center
            shadow-lg shadow-purple-500/30
          ">
            <span className="text-3xl font-bold text-white">SB</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to StacksBet Arena! 🎉
          </h2>
          
          <p className="text-slate-400 mb-6">
            The decentralized prediction market on Stacks blockchain. 
            Trade on the future and earn rewards.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                onClose()
                onStartTour?.()
              }}
              className="
                w-full py-3 rounded-xl
                bg-gradient-to-r from-purple-500 to-pink-500
                text-white font-semibold
                hover:opacity-90 transition-opacity
                flex items-center justify-center gap-2
              "
            >
              Take the Tour
              <FiChevronRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                onClose()
                onSkip?.()
              }}
              className="
                w-full py-3 rounded-xl
                bg-slate-800 text-slate-300
                font-medium
                hover:bg-slate-700 transition-colors
              "
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Tooltip highlight for features
 */
export const FeatureHighlight = ({
  children,
  title,
  description,
  isNew = false,
  position = 'bottom'
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const ref = useRef(null)

  // Show highlight after a delay
  useEffect(() => {
    if (isNew && !dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [isNew, dismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setDismissed(true)
  }

  return (
    <div ref={ref} className="relative inline-block">
      {children}
      
      {isVisible && (
        <div className={`
          absolute z-50 ${POSITIONS[position]}
          w-64 p-4
          bg-slate-800 border border-purple-500/50
          rounded-xl shadow-xl
          animate-fadeIn
        `}>
          {/* New badge */}
          {isNew && (
            <span className="
              absolute -top-2 -right-2
              px-2 py-0.5
              bg-purple-500 text-white text-xs font-bold
              rounded-full
            ">
              NEW
            </span>
          )}

          <h4 className="font-semibold text-white mb-1">{title}</h4>
          <p className="text-sm text-slate-400 mb-3">{description}</p>
          
          <button
            onClick={handleDismiss}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Got it!
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

/**
 * Default tour steps for StacksBet Arena
 */
export const DEFAULT_TOUR_STEPS = [
  {
    target: '[data-tour="connect-wallet"]',
    title: 'Connect Your Wallet',
    content: 'Start by connecting your Stacks wallet to access all features of the platform.',
    tip: 'We support Leather and Xverse wallets.',
    position: 'bottom'
  },
  {
    target: '[data-tour="markets"]',
    title: 'Browse Markets',
    content: 'Explore prediction markets across various categories like crypto, sports, politics, and more.',
    position: 'bottom'
  },
  {
    target: '[data-tour="create-market"]',
    title: 'Create a Market',
    content: 'Have a prediction? Create your own market and let others trade on it.',
    position: 'left'
  },
  {
    target: '[data-tour="leaderboard"]',
    title: 'Climb the Leaderboard',
    content: 'Compete with other traders. Top performers earn special badges and rewards.',
    position: 'bottom'
  },
  {
    target: '[data-tour="bet-panel"]',
    title: 'Place Your Bets',
    content: 'Choose Yes or No, enter your amount, and confirm to place a bet. Winnings are automatically sent to your wallet.',
    tip: 'Start small and learn the ropes!',
    position: 'left'
  }
]

export default OnboardingProvider
