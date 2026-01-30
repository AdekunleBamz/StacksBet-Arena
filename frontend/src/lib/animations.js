import React, { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Animation utilities and components for StacksBet Arena
 */

// Animation timing functions
export const easings = {
  linear: t => t,
  easeIn: t => t * t,
  easeOut: t => t * (2 - t),
  easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - (--t) * t * t * t,
  easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1,
  easeOutBounce: t => {
    if (t < 1 / 2.75) return 7.5625 * t * t
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
  }
}

// CSS animation keyframes as strings for injection
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,
  slideInUp: `
    @keyframes slideInUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  slideInDown: `
    @keyframes slideInDown {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  slideInLeft: `
    @keyframes slideInLeft {
      from { transform: translateX(-20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `,
  slideInRight: `
    @keyframes slideInRight {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `,
  scaleIn: `
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,
  scaleOut: `
    @keyframes scaleOut {
      from { transform: scale(1); opacity: 1; }
      to { transform: scale(0.9); opacity: 0; }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `,
  shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `,
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `,
  glow: `
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
      50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
    }
  `,
  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
  `
}

// Inject keyframes into document
const injectedKeyframes = new Set()

export const injectKeyframes = (name) => {
  if (injectedKeyframes.has(name) || typeof document === 'undefined') return
  
  if (keyframes[name]) {
    const style = document.createElement('style')
    style.textContent = keyframes[name]
    document.head.appendChild(style)
    injectedKeyframes.add(name)
  }
}

/**
 * Hook for number animation (counting up/down)
 */
export const useCountAnimation = (target, duration = 1000, easing = easings.easeOutCubic) => {
  const [current, setCurrent] = useState(0)
  const previousTarget = useRef(target)

  useEffect(() => {
    const startValue = previousTarget.current
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)
      
      const newValue = startValue + (target - startValue) * easedProgress
      setCurrent(newValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        previousTarget.current = target
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration, easing])

  return current
}

/**
 * Hook for intersection-based animations
 */
export const useIntersectionAnimation = (options = {}) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setHasAnimated(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible, hasAnimated }
}

/**
 * Hook for spring animations
 */
export const useSpring = (targetValue, config = {}) => {
  const { stiffness = 170, damping = 26, mass = 1 } = config
  const [value, setValue] = useState(targetValue)
  const velocityRef = useRef(0)
  const targetRef = useRef(targetValue)

  useEffect(() => {
    targetRef.current = targetValue
    let animationFrame

    const animate = () => {
      const displacement = targetRef.current - value
      const springForce = stiffness * displacement
      const dampingForce = damping * velocityRef.current
      const acceleration = (springForce - dampingForce) / mass
      
      velocityRef.current += acceleration * 0.016 // ~60fps
      const newValue = value + velocityRef.current * 0.016

      if (Math.abs(velocityRef.current) < 0.01 && Math.abs(displacement) < 0.01) {
        setValue(targetRef.current)
        return
      }

      setValue(newValue)
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [targetValue, stiffness, damping, mass, value])

  return value
}

/**
 * Animated wrapper component
 */
export const Animated = ({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
  easing = 'ease-out',
  fillMode = 'forwards',
  iterationCount = 1,
  style = {},
  className = '',
  onAnimationEnd,
  ...props
}) => {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    injectKeyframes(animation)
  }, [animation])

  const handleAnimationEnd = useCallback((e) => {
    setIsAnimating(false)
    onAnimationEnd?.(e)
  }, [onAnimationEnd])

  const animationStyle = {
    animation: `${animation} ${duration}ms ${easing} ${delay}ms ${iterationCount} ${fillMode}`,
    ...style
  }

  return (
    <div
      style={animationStyle}
      className={className}
      onAnimationEnd={handleAnimationEnd}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Fade transition component
 */
export const Fade = ({ 
  show, 
  children, 
  duration = 200, 
  unmountOnExit = true,
  className = '' 
}) => {
  const [shouldRender, setShouldRender] = useState(show)

  useEffect(() => {
    if (show) setShouldRender(true)
  }, [show])

  const handleAnimationEnd = () => {
    if (!show && unmountOnExit) {
      setShouldRender(false)
    }
  }

  if (!shouldRender) return null

  return (
    <div
      className={className}
      style={{
        animation: `${show ? 'fadeIn' : 'fadeOut'} ${duration}ms ease-out forwards`
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  )
}

/**
 * Slide transition component
 */
export const Slide = ({
  show,
  direction = 'up',
  children,
  duration = 300,
  distance = 20,
  className = ''
}) => {
  const [shouldRender, setShouldRender] = useState(show)

  useEffect(() => {
    if (show) setShouldRender(true)
  }, [show])

  if (!shouldRender) return null

  const transforms = {
    up: `translateY(${show ? 0 : distance}px)`,
    down: `translateY(${show ? 0 : -distance}px)`,
    left: `translateX(${show ? 0 : distance}px)`,
    right: `translateX(${show ? 0 : -distance}px)`
  }

  return (
    <div
      className={className}
      style={{
        transform: transforms[direction],
        opacity: show ? 1 : 0,
        transition: `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`
      }}
      onTransitionEnd={() => !show && setShouldRender(false)}
    >
      {children}
    </div>
  )
}

/**
 * Scale transition component
 */
export const Scale = ({
  show,
  children,
  duration = 200,
  initialScale = 0.95,
  className = ''
}) => {
  const [shouldRender, setShouldRender] = useState(show)

  useEffect(() => {
    if (show) setShouldRender(true)
  }, [show])

  if (!shouldRender) return null

  return (
    <div
      className={className}
      style={{
        transform: `scale(${show ? 1 : initialScale})`,
        opacity: show ? 1 : 0,
        transition: `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`
      }}
      onTransitionEnd={() => !show && setShouldRender(false)}
    >
      {children}
    </div>
  )
}

/**
 * Staggered children animation
 */
export const Stagger = ({
  children,
  staggerDelay = 50,
  animation = 'slideInUp',
  duration = 300,
  className = ''
}) => {
  useEffect(() => {
    injectKeyframes(animation)
  }, [animation])

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            animation: `${animation} ${duration}ms ease-out ${index * staggerDelay}ms forwards`,
            opacity: 0
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

/**
 * Collapse/Expand animation
 */
export const Collapse = ({ show, children, duration = 300, className = '' }) => {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(show ? 'auto' : 0)

  useEffect(() => {
    if (show) {
      const contentHeight = contentRef.current?.scrollHeight || 0
      setHeight(contentHeight)
      // After animation, set to auto to handle dynamic content
      const timer = setTimeout(() => setHeight('auto'), duration)
      return () => clearTimeout(timer)
    } else {
      // First set to current height, then to 0 for animation
      const contentHeight = contentRef.current?.scrollHeight || 0
      setHeight(contentHeight)
      requestAnimationFrame(() => setHeight(0))
    }
  }, [show, duration])

  return (
    <div
      ref={contentRef}
      className={className}
      style={{
        height,
        overflow: 'hidden',
        transition: `height ${duration}ms ease-out`
      }}
    >
      {children}
    </div>
  )
}

/**
 * Ripple effect component
 */
export const Ripple = ({ color = 'rgba(255, 255, 255, 0.3)', duration = 600 }) => {
  const [ripples, setRipples] = useState([])

  const addRipple = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    const newRipple = { x, y, size, id: Date.now() }
    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, duration)
  }, [duration])

  return {
    ripples,
    addRipple,
    RippleContainer: () => (
      <>
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              borderRadius: '50%',
              backgroundColor: color,
              transform: 'scale(0)',
              animation: `ripple ${duration}ms ease-out`,
              pointerEvents: 'none'
            }}
          />
        ))}
        <style>{`
          @keyframes ripple {
            to { transform: scale(2); opacity: 0; }
          }
        `}</style>
      </>
    )
  }
}

/**
 * Typewriter effect hook
 */
export const useTypewriter = (text, speed = 50, startDelay = 0) => {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayText('')
    setIsComplete(false)
    
    const startTimeout = setTimeout(() => {
      setIsTyping(true)
      let index = 0
      
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, index + 1))
        index++
        
        if (index >= text.length) {
          clearInterval(interval)
          setIsTyping(false)
          setIsComplete(true)
        }
      }, speed)

      return () => clearInterval(interval)
    }, startDelay)

    return () => clearTimeout(startTimeout)
  }, [text, speed, startDelay])

  return { displayText, isTyping, isComplete }
}

/**
 * Shake animation trigger
 */
export const useShake = () => {
  const [isShaking, setIsShaking] = useState(false)
  const elementRef = useRef(null)

  const shake = useCallback(() => {
    setIsShaking(true)
    injectKeyframes('shake')
    
    setTimeout(() => setIsShaking(false), 500)
  }, [])

  const shakeStyle = isShaking ? {
    animation: 'shake 0.5s ease-in-out'
  } : {}

  return { shake, shakeStyle, isShaking, elementRef }
}

/**
 * Scroll-linked animation hook
 */
export const useScrollAnimation = (options = {}) => {
  const { start = 0, end = 1, clamp = true } = options
  const [progress, setProgress] = useState(0)
  const elementRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return

      const rect = elementRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const elementTop = rect.top
      const elementHeight = rect.height

      // Calculate progress (0 when element enters, 1 when it leaves)
      let rawProgress = (windowHeight - elementTop) / (windowHeight + elementHeight)
      
      if (clamp) {
        rawProgress = Math.max(start, Math.min(end, rawProgress))
      }

      // Normalize to 0-1 range based on start/end
      const normalizedProgress = (rawProgress - start) / (end - start)
      setProgress(normalizedProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [start, end, clamp])

  return { progress, elementRef }
}

/**
 * Preset animation classes (CSS strings)
 */
export const animationClasses = {
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  slideUp: 'animate-slideUp',
  slideDown: 'animate-slideDown',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  shake: 'animate-shake'
}

/**
 * Generate Tailwind-compatible animation CSS
 */
export const generateAnimationCSS = () => `
  .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
  .animate-fadeOut { animation: fadeOut 0.3s ease-out forwards; }
  .animate-slideUp { animation: slideInUp 0.3s ease-out forwards; }
  .animate-slideDown { animation: slideInDown 0.3s ease-out forwards; }
  .animate-pulse { animation: pulse 2s ease-in-out infinite; }
  .animate-spin { animation: spin 1s linear infinite; }
  .animate-bounce { animation: bounce 1s ease-in-out infinite; }
  .animate-shake { animation: shake 0.5s ease-in-out; }
  .animate-shimmer { 
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  .animate-glow { animation: glow 2s ease-in-out infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
`

export default {
  easings,
  keyframes,
  injectKeyframes,
  useCountAnimation,
  useIntersectionAnimation,
  useSpring,
  Animated,
  Fade,
  Slide,
  Scale,
  Stagger,
  Collapse,
  Ripple,
  useTypewriter,
  useShake,
  useScrollAnimation,
  animationClasses,
  generateAnimationCSS
}
