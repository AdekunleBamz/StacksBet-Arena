import React, { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

const WalletConnectQRModal = ({ isOpen, onClose, wcUri }) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  if (!isOpen || !wcUri) return null

  const copyUri = () => {
    navigator.clipboard.writeText(wcUri)
    setCopied(true)
  }

  const mobileLink = `https://walletconnect.com/wc?uri=${encodeURIComponent(wcUri)}`

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 max-w-md w-full text-center">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold gradient-text">Connect Wallet</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400 mb-6">
          Scan the QR code with your mobile wallet app or copy the link below.
        </p>

        <div className="bg-white p-4 rounded-xl mb-4">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wcUri)}`}
            alt="WalletConnect QR Code"
            className="w-full h-auto"
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={copyUri}
            className="w-full btn-secondary py-3 rounded-xl font-medium"
          >
            {copied ? 'Copied!' : 'Copy WalletConnect URI'}
          </button>

          <a
            href={mobileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full btn-primary py-3 rounded-xl font-medium"
          >
            Open in Mobile Wallet
          </a>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Compatible with Xverse, Leather, and other Stacks wallets.
        </p>
      </div>
    </div>
  )
}

export default WalletConnectQRModal
