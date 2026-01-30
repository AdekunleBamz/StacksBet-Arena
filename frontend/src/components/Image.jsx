import React, { useState, useRef, useEffect } from 'react'
import { HiPhotograph, HiExclamation } from 'react-icons/hi'

/**
 * Optimized Image components with lazy loading and fallbacks
 */

const Image = ({
  src,
  alt,
  width,
  height,
  fallback,
  placeholder = 'blur',
  objectFit = 'cover',
  rounded = 'xl',
  lazy = true,
  onLoad,
  onError,
  className = ''
}) => {
  const [status, setStatus] = useState('loading') // loading, loaded, error
  const [isInView, setIsInView] = useState(!lazy)
  const imgRef = useRef(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px', threshold: 0 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy])

  const handleLoad = (e) => {
    setStatus('loaded')
    onLoad?.(e)
  }

  const handleError = (e) => {
    setStatus('error')
    onError?.(e)
  }

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  }

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none'
  }

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-800 ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder/Loading state */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {placeholder === 'blur' ? (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse" />
          ) : (
            <HiPhotograph className="w-8 h-8 text-gray-600 animate-pulse" />
          )}
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
          {fallback || (
            <>
              <HiExclamation className="w-8 h-8 mb-1" />
              <span className="text-xs">Failed to load</span>
            </>
          )}
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full
            ${objectFitClasses[objectFit]}
            ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-300
          `}
        />
      )}
    </div>
  )
}

// Avatar Image (specific for profile pictures)
export const AvatarImage = ({
  src,
  alt,
  size = 'md',
  fallbackText,
  status, // online, offline, away, busy
  className = ''
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl'
  }

  const statusColors = {
    online: 'bg-arena-green',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  }

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
  }

  const getInitials = (text) => {
    if (!text) return '?'
    return text.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <Image
        src={src}
        alt={alt || 'Avatar'}
        rounded="full"
        className={sizes[size]}
        fallback={
          <div className="w-full h-full flex items-center justify-center 
                        bg-gradient-to-br from-arena-purple to-arena-pink text-white font-bold">
            {getInitials(fallbackText)}
          </div>
        }
      />
      
      {status && (
        <span className={`
          absolute bottom-0 right-0 rounded-full border-2 border-arena-dark
          ${statusColors[status]} ${statusSizes[size]}
        `} />
      )}
    </div>
  )
}

// Background Image with overlay
export const BackgroundImage = ({
  src,
  alt,
  overlay = true,
  overlayOpacity = 0.6,
  gradientDirection = 'to-t',
  children,
  className = ''
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full"
        rounded="none"
      />
      
      {overlay && (
        <div 
          className={`absolute inset-0 bg-gradient-${gradientDirection} from-arena-dark via-arena-dark/80 to-transparent`}
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Image Gallery
export const ImageGallery = ({
  images = [],
  columns = 3,
  gap = 'md',
  onImageClick,
  className = ''
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  }

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onImageClick?.(image, index)}
          className="relative aspect-square overflow-hidden rounded-xl 
                   group focus:outline-none focus:ring-2 focus:ring-arena-purple"
        >
          <Image
            src={image.src}
            alt={image.alt || `Image ${index + 1}`}
            className="w-full h-full"
            rounded="none"
          />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                        transition-opacity flex items-center justify-center">
            <span className="text-white font-medium">View</span>
          </div>
        </button>
      ))}
    </div>
  )
}

// Logo Image with fallback
export const LogoImage = ({
  src,
  alt = 'Logo',
  size = 'md',
  fallbackIcon,
  className = ''
}) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={`${sizes[size]} ${className}`}
      objectFit="contain"
      rounded="lg"
      fallback={
        fallbackIcon || (
          <div className="w-full h-full flex items-center justify-center 
                        bg-arena-purple/20 text-arena-purple">
            <HiPhotograph className="w-1/2 h-1/2" />
          </div>
        )
      }
    />
  )
}

// NFT/Token Image
export const NFTImage = ({
  src,
  alt,
  name,
  collection,
  verified = false,
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-xl
        bg-arena-card border border-gray-700
        hover:border-arena-purple/50 transition-colors
        focus:outline-none focus:ring-2 focus:ring-arena-purple
        ${className}
      `}
    >
      <Image
        src={src}
        alt={alt || name}
        className="aspect-square w-full"
        rounded="none"
      />
      
      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 
                    bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-1">
          <p className="font-medium text-white truncate text-sm">{name}</p>
          {verified && <span className="text-arena-cyan">✓</span>}
        </div>
        {collection && (
          <p className="text-xs text-gray-400 truncate">{collection}</p>
        )}
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-arena-purple/20 opacity-0 
                    group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

// Image with caption
export const ImageWithCaption = ({
  src,
  alt,
  caption,
  credit,
  aspectRatio = '16/9',
  className = ''
}) => {
  return (
    <figure className={className}>
      <div 
        className="relative overflow-hidden rounded-xl"
        style={{ aspectRatio }}
      >
        <Image
          src={src}
          alt={alt || caption}
          className="w-full h-full"
          rounded="none"
        />
      </div>
      
      {(caption || credit) && (
        <figcaption className="mt-2 text-sm text-gray-400">
          {caption}
          {credit && (
            <span className="text-gray-500"> — {credit}</span>
          )}
        </figcaption>
      )}
    </figure>
  )
}

// Responsive Image Container
export const AspectRatioImage = ({
  src,
  alt,
  ratio = '16/9',
  className = ''
}) => {
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full"
        rounded="none"
      />
    </div>
  )
}

// Placeholder images for development
export const PlaceholderImage = ({
  width = 400,
  height = 300,
  text,
  className = ''
}) => {
  return (
    <div 
      className={`
        flex items-center justify-center
        bg-gradient-to-br from-gray-700 to-gray-800
        text-gray-500 rounded-xl
        ${className}
      `}
      style={{ width, height }}
    >
      <div className="text-center">
        <HiPhotograph className="w-12 h-12 mx-auto mb-2" />
        <span className="text-sm">{text || `${width}×${height}`}</span>
      </div>
    </div>
  )
}

export default Image
