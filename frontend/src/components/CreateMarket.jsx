import React, { useEffect, useState, useCallback } from 'react'
import { HiX, HiPlusCircle, HiExclamationCircle, HiCheckCircle } from 'react-icons/hi'
import { openContractCall } from '@stacks/connect'
import { uintCV, stringUtf8CV, stringAsciiCV, PostConditionMode, makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions'
import toast from 'react-hot-toast'

import { CONFIG } from '../lib/config'
import { fetchStacksTipHeight } from '../lib/hiro'

// Validation rules
const VALIDATION_RULES = {
  title: {
    minLength: 10,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s.,?!'"$%&()-]+$/,
    messages: {
      required: 'Market question is required',
      minLength: 'Question must be at least 10 characters',
      maxLength: 'Question cannot exceed 200 characters',
      pattern: 'Question contains invalid characters'
    }
  },
  description: {
    maxLength: 500,
    messages: {
      maxLength: 'Description cannot exceed 500 characters'
    }
  },
  resolutionSource: {
    maxLength: 200,
    messages: {
      maxLength: 'Resolution source cannot exceed 200 characters'
    }
  },
  endDays: {
    min: 1,
    max: 365,
    messages: {
      min: 'Duration must be at least 1 day',
      max: 'Duration cannot exceed 365 days'
    }
  },
  initialLiquidity: {
    min: 1,
    max: 100000,
    messages: {
      min: 'Minimum initial liquidity is 1 STX',
      max: 'Maximum initial liquidity is 100,000 STX'
    }
  }
}

const CreateMarket = ({ userData, userAddress, userSession, network, contractAddress, contractName, onClose, onConnect }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Crypto',
    resolutionSource: '',
    endDays: 30,
    initialLiquidity: 10
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [tipHeight, setTipHeight] = useState(null)
  const [isTipLoading, setIsTipLoading] = useState(true)
  const [tipError, setTipError] = useState(null)
  const [step, setStep] = useState(1)

  const categories = ['Crypto', 'Sports', 'Finance', 'Politics', 'Entertainment', 'Technology', 'Other']

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const rules = VALIDATION_RULES[name]
    if (!rules) return null

    if (rules.minLength && (!value || value.length < rules.minLength)) {
      return rules.messages.minLength
    }
    if (rules.maxLength && value && value.length > rules.maxLength) {
      return rules.messages.maxLength
    }
    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.messages.pattern
    }
    if (rules.min !== undefined && (value === '' || value < rules.min)) {
      return rules.messages.min
    }
    if (rules.max !== undefined && value > rules.max) {
      return rules.messages.max
    }
    return null
  }, [])

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {}
    Object.keys(VALIDATION_RULES).forEach(field => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })
    return newErrors
  }, [formData, validateField])

  // Real-time validation on blur
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  // Update form data with real-time validation
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadTip() {
      setIsTipLoading(true)
      setTipError(null)
      try {
        const height = await fetchStacksTipHeight(CONFIG.hiroApiUrl)
        if (!cancelled) setTipHeight(height)
      } catch (e) {
        if (!cancelled) setTipError(e)
      } finally {
        if (!cancelled) setIsTipLoading(false)
      }
    }
    loadTip()
    return () => { cancelled = true }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const isStep1Valid = () => {
    return formData.title.length >= 10 && !errors.title && !errors.description
  }

  const isStep2Valid = () => {
    return !errors.endDays && !errors.initialLiquidity && formData.endDays >= 1 && formData.initialLiquidity >= 1
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userData) { onConnect(); return }

    // Final validation
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setTouched(Object.keys(VALIDATION_RULES).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
      toast.error('Please fix the errors before submitting')
      return
    }

    if (!userAddress) {
      toast.error('Wallet address not found. Reconnect your wallet and try again.')
      return
    }

    if (!userSession) {
      toast.error('Wallet session not initialized. Refresh and reconnect.')
      return
    }

    if (isTipLoading) {
      toast.error('Loading chain data—try again in a moment.')
      return
    }

    if (!tipHeight || typeof tipHeight !== 'number') {
      toast.error('Could not load chain data. Check your connection and try again.')
      return
    }

    setIsLoading(true)
    try {
      const liquidityInMicroSTX = Math.floor(formData.initialLiquidity * 1000000)
      const blocksPerDay = 144
      const endTime = tipHeight + (formData.endDays * blocksPerDay)
      const resolutionTime = endTime + (7 * blocksPerDay)

      openContractCall({
        appDetails: {
          name: 'StacksBet Arena',
          icon: window.location.origin + '/logo.png',
        },
        network,
        stxAddress: userAddress,
        contractAddress,
        contractName,
        functionName: 'create-market',
        functionArgs: [
          stringUtf8CV(formData.title),
          stringUtf8CV(formData.description || 'No description provided'),
          stringAsciiCV(formData.category),
          stringUtf8CV(formData.resolutionSource || 'Manual resolution'),
          uintCV(endTime),
          uintCV(resolutionTime),
          uintCV(liquidityInMicroSTX)
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [makeStandardSTXPostCondition(userAddress, FungibleConditionCode.LessEqual, liquidityInMicroSTX)],
        userSession,
        onFinish: (data) => {
          console.log('Transaction finished:', data)
          setIsLoading(false)
          toast.success('Market created successfully!')
          onClose()
        },
        onCancel: () => {
          console.log('Transaction cancelled by user')
          setIsLoading(false)
          toast.error('Transaction cancelled')
        }
      })
    } catch (error) {
      console.error('Failed to create market:', error)
      setIsLoading(false)
      toast.error(`Failed to create market: ${error.message || 'Unknown error'}`)
    }
  }

  const InputField = ({ name, label, type = 'text', placeholder, required, as = 'input', rows, min, max, step: inputStep, helpText }) => {
    const Component = as
    const hasError = touched[name] && errors[name]
    const isValid = touched[name] && !errors[name] && formData[name]

    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label} {required && <span className="text-arena-pink">*</span>}
        </label>
        <div className="relative">
          <Component
            type={type}
            value={formData[name]}
            onChange={(e) => handleChange(name, type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
            onBlur={() => handleBlur(name)}
            placeholder={placeholder}
            className={`input-field w-full px-4 py-3 rounded-xl text-white transition-all duration-200 ${
              hasError ? 'ring-2 ring-red-500/50 border-red-500' : isValid ? 'ring-2 ring-arena-green/50 border-arena-green' : ''
            } ${as === 'select' ? 'bg-arena-darker' : ''}`}
            rows={rows}
            min={min}
            max={max}
            step={inputStep}
            maxLength={VALIDATION_RULES[name]?.maxLength}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? `${name}-error` : undefined}
          >
            {as === 'select' && categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </Component>
          {(hasError || isValid) && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${as === 'textarea' ? 'top-4 translate-y-0' : ''}`}>
              {hasError ? (
                <HiExclamationCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
              ) : (
                <HiCheckCircle className="w-5 h-5 text-arena-green" aria-hidden="true" />
              )}
            </span>
          )}
        </div>
        {hasError && (
          <p id={`${name}-error`} className="text-red-400 text-xs mt-1 flex items-center gap-1" role="alert">
            <HiExclamationCircle className="w-3 h-3" />
            {errors[name]}
          </p>
        )}
        {helpText && !hasError && (
          <p className="text-xs text-gray-500 mt-1">{helpText}</p>
        )}
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-market-title"
    >
      <div className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-arena-purple/20 flex items-center justify-between">
          <div>
            <h2 id="create-market-title" className="text-xl font-bold">
              <span className="gradient-text">Create Market</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Step {step} of 2</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-arena-purple/20 transition-colors"
            aria-label="Close modal"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-arena-purple' : 'bg-gray-700'}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-arena-purple' : 'bg-gray-700'}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {step === 1 && (
            <>
              <InputField
                name="title"
                label="Market Question"
                placeholder="Will BTC reach $100K by December 2025?"
                required
                helpText={`${formData.title.length}/${VALIDATION_RULES.title.maxLength} characters`}
              />

              <InputField
                name="description"
                label="Description"
                as="textarea"
                rows={3}
                placeholder="Additional context about this prediction..."
                helpText="Optional: Provide more details about the market"
              />

              <InputField
                name="category"
                label="Category"
                as="select"
                required
              />

              <InputField
                name="resolutionSource"
                label="Resolution Source"
                placeholder="e.g., CoinGecko, ESPN, Official announcement"
                helpText="Optional: Where will the outcome be verified?"
              />

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!isStep1Valid()}
                className="w-full btn-primary py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue to Step 2 →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-400 hover:text-white transition-colors mb-2 flex items-center gap-1"
              >
                ← Back to Step 1
              </button>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  name="endDays"
                  label="Duration (days)"
                  type="number"
                  min={1}
                  max={365}
                  required
                />
                <InputField
                  name="initialLiquidity"
                  label="Initial Liquidity (STX)"
                  type="number"
                  min={1}
                  inputStep={0.1}
                  required
                />
              </div>

              {/* Summary Card */}
              <div className="glass-card p-4 rounded-xl border border-arena-purple/20">
                <h4 className="font-medium mb-3 text-arena-cyan">📋 Market Summary</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Question:</dt>
                    <dd className="text-white text-right max-w-[200px] truncate">{formData.title || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Category:</dt>
                    <dd className="text-white">{formData.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Duration:</dt>
                    <dd className="text-white">{formData.endDays} days</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Liquidity:</dt>
                    <dd className="text-arena-green font-semibold">{formData.initialLiquidity} STX</dd>
                  </div>
                </dl>
              </div>

              {/* Benefits Card */}
              <div className="glass-card p-4 rounded-xl">
                <h4 className="font-medium mb-2">💡 Market Creator Benefits</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Earn 0.5% of all trading volume</li>
                  <li>• Initial liquidity sets starting odds at 50/50</li>
                  <li>• Resolution happens 7 days after market ends</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading || !tipHeight || !isStep2Valid()}
                className="w-full btn-primary py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <div className="spinner w-5 h-5" />
                ) : isTipLoading ? (
                  'Loading chain…'
                ) : tipError ? (
                  'Chain unavailable'
                ) : (
                  <><HiPlusCircle className="w-5 h-5" />Create Market ({formData.initialLiquidity} STX)</>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default CreateMarket
