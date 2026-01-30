import React, { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { HiX } from 'react-icons/hi'

/**
 * Reusable Modal component with accessibility features
 * Supports different sizes, animations, and focus trapping
 */

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  className = '',
  overlayClassName = '',
  contentClassName = '',
}) => {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  // Handle escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose()
    }
    // Focus trap
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }, [closeOnEscape, onClose])

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }

  // Lock body scroll and manage focus when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
      
      // Focus first focusable element
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }, 100)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      previousActiveElement.current?.focus()
    }

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop ${overlayClassName}`}
      onClick={handleOverlayClick}
      role="presentation"
    >
      {/* Overlay animation */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        className={`relative glass-card rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden animate-scale-in ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-arena-purple/20">
            <div>
              {title && (
                <h2 id="modal-title" className="text-xl font-bold">
                  <span className="gradient-text">{title}</span>
                </h2>
              )}
              {description && (
                <p id="modal-description" className="text-sm text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-arena-purple/20 transition-colors -mr-2"
                aria-label="Close modal"
              >
                <HiX className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`overflow-y-auto ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  )

  // Use portal to render modal at document body
  return createPortal(modalContent, document.body)
}

// Confirmation modal preset
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary', // 'primary' | 'danger'
  isLoading = false,
}) => {
  const buttonStyles = {
    primary: 'btn-primary',
    danger: 'bg-red-500 hover:bg-red-600',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="p-6">
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl glass-card hover:bg-arena-purple/20 transition-colors font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${buttonStyles[confirmVariant]} disabled:opacity-50`}
          >
            {isLoading && <div className="spinner w-4 h-4" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// Alert modal preset
export const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  icon = '⚠️',
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="sm"
    showCloseButton={false}
  >
    <div className="p-6 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      {title && <h3 className="text-lg font-bold text-white mb-2">{title}</h3>}
      <p className="text-gray-300 mb-6">{message}</p>
      <button
        onClick={onClose}
        className="btn-primary px-6 py-2 rounded-xl font-medium"
      >
        {buttonText}
      </button>
    </div>
  </Modal>
)

// Wallet connect modal
export const WalletModal = ({
  isOpen,
  onClose,
  onConnect,
  wallets = [
    { id: 'leather', name: 'Leather', icon: '👝', description: 'Stacks native wallet' },
    { id: 'xverse', name: 'Xverse', icon: '🔮', description: 'Bitcoin & Stacks wallet' },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', description: 'Connect any wallet' },
  ]
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Connect Wallet"
    description="Choose a wallet to connect"
    size="sm"
  >
    <div className="p-6 space-y-3">
      {wallets.map((wallet) => (
        <button
          key={wallet.id}
          onClick={() => onConnect(wallet.id)}
          className="w-full flex items-center gap-4 p-4 rounded-xl glass-card hover:bg-arena-purple/20 transition-all hover:scale-[1.02] group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">
            {wallet.icon}
          </span>
          <div className="text-left">
            <p className="font-medium text-white">{wallet.name}</p>
            <p className="text-sm text-gray-400">{wallet.description}</p>
          </div>
        </button>
      ))}
    </div>
  </Modal>
)

// Add custom animations to tailwind (add to index.css or tailwind config)
const styles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scale-in {
    from { 
      opacity: 0; 
      transform: scale(0.95) translateY(10px);
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  
  .animate-scale-in {
    animation: scale-in 0.2s ease-out;
  }
`

export default Modal
