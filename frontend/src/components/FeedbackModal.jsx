import React, { useState, useCallback } from 'react'
import { 
  FiX, FiStar, FiMessageSquare, FiSend, FiBug, FiHeart, 
  FiZap, FiAlertCircle, FiCheckCircle, FiThumbsUp, FiThumbsDown,
  FiMail, FiUser
} from 'react-icons/fi'

/**
 * Feedback modal and rating components for StacksBet Arena
 */

// Feedback categories
const FEEDBACK_CATEGORIES = [
  { id: 'bug', label: 'Bug Report', icon: FiBug, color: 'text-red-400' },
  { id: 'feature', label: 'Feature Request', icon: FiZap, color: 'text-yellow-400' },
  { id: 'improvement', label: 'Improvement', icon: FiThumbsUp, color: 'text-blue-400' },
  { id: 'other', label: 'Other', icon: FiMessageSquare, color: 'text-slate-400' }
]

/**
 * Star Rating Component
 */
export const StarRating = ({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  showLabel = false,
  className = ''
}) => {
  const [hoverValue, setHoverValue] = useState(0)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const labels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  }

  const displayValue = hoverValue || value

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= displayValue
          
          return (
            <button
              key={index}
              type="button"
              disabled={readonly}
              onClick={() => !readonly && onChange?.(starValue)}
              onMouseEnter={() => !readonly && setHoverValue(starValue)}
              onMouseLeave={() => !readonly && setHoverValue(0)}
              className={`
                ${readonly ? 'cursor-default' : 'cursor-pointer'}
                transition-transform hover:scale-110
                focus:outline-none focus:ring-2 focus:ring-purple-500 rounded
              `}
            >
              <FiStar
                className={`
                  ${sizes[size]}
                  ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}
                  transition-colors
                `}
              />
            </button>
          )
        })}
      </div>
      
      {showLabel && displayValue > 0 && (
        <p className="text-sm text-slate-400 mt-1">
          {labels[displayValue]}
        </p>
      )}
    </div>
  )
}

/**
 * Emoji Rating Component
 */
export const EmojiRating = ({
  value,
  onChange,
  className = ''
}) => {
  const emojis = [
    { value: 'very_bad', emoji: '😠', label: 'Very Bad' },
    { value: 'bad', emoji: '😕', label: 'Bad' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'good', emoji: '😊', label: 'Good' },
    { value: 'excellent', emoji: '😍', label: 'Excellent' }
  ]

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {emojis.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange?.(item.value)}
          className={`
            flex flex-col items-center gap-1 p-2 rounded-lg
            transition-all
            ${value === item.value
              ? 'bg-purple-500/20 ring-2 ring-purple-500 scale-110'
              : 'hover:bg-slate-800'
            }
          `}
        >
          <span className="text-3xl">{item.emoji}</span>
          <span className="text-xs text-slate-400">{item.label}</span>
        </button>
      ))}
    </div>
  )
}

/**
 * Quick Feedback (Thumbs up/down)
 */
export const QuickFeedback = ({
  onFeedback,
  className = ''
}) => {
  const [submitted, setSubmitted] = useState(null)

  const handleFeedback = (isPositive) => {
    setSubmitted(isPositive)
    onFeedback?.(isPositive)
  }

  if (submitted !== null) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <FiCheckCircle className="w-5 h-5 text-green-400" />
        <span className="text-slate-300">Thanks for your feedback!</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-slate-400">Was this helpful?</span>
      <div className="flex gap-2">
        <button
          onClick={() => handleFeedback(true)}
          className="p-2 rounded-lg hover:bg-green-500/20 text-slate-400 hover:text-green-400 transition-colors"
        >
          <FiThumbsUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleFeedback(false)}
          className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
        >
          <FiThumbsDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

/**
 * Feedback Modal Component
 */
export const FeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  userEmail,
  userName
}) => {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState('')
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(userEmail || '')
  const [name, setName] = useState(userName || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const resetForm = useCallback(() => {
    setStep(1)
    setCategory('')
    setRating(0)
    setMessage('')
    setIsSubmitted(false)
  }, [])

  const handleClose = () => {
    resetForm()
    onClose?.()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      await onSubmit?.({
        category,
        rating,
        message,
        email,
        name,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
      
      setIsSubmitted(true)
    } catch (error) {
      console.error('Feedback submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = category && message.trim().length >= 10

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="
        relative bg-slate-900 border border-slate-700
        rounded-2xl shadow-2xl max-w-lg w-full
        overflow-hidden
      ">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FiMessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Share Feedback</h2>
              <p className="text-sm text-slate-400">Help us improve StacksBet Arena</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {isSubmitted ? (
            // Success state
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Thank You! 💜
              </h3>
              <p className="text-slate-400 mb-6">
                Your feedback has been submitted successfully. We appreciate your input!
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Close
              </button>
            </div>
          ) : step === 1 ? (
            // Step 1: Category selection
            <>
              <p className="text-slate-300 mb-4">What type of feedback do you have?</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {FEEDBACK_CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id)
                        setStep(2)
                      }}
                      className={`
                        p-4 rounded-xl border text-left
                        transition-all
                        ${category === cat.id
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                        }
                      `}
                    >
                      <Icon className={`w-6 h-6 ${cat.color} mb-2`} />
                      <p className="font-medium text-white">{cat.label}</p>
                    </button>
                  )
                })}
              </div>
            </>
          ) : step === 2 ? (
            // Step 2: Rating and message
            <>
              {/* Back button */}
              <button
                onClick={() => setStep(1)}
                className="text-sm text-slate-400 hover:text-white mb-4"
              >
                ← Back to categories
              </button>

              {/* Rating */}
              <div className="mb-6">
                <p className="text-slate-300 mb-3">How would you rate your experience?</p>
                <StarRating
                  value={rating}
                  onChange={setRating}
                  size="lg"
                  showLabel
                />
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tell us more <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your feedback in detail..."
                  rows={4}
                  className="
                    w-full px-4 py-3
                    bg-slate-800 border border-slate-700
                    rounded-xl text-white placeholder-slate-500
                    focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                    outline-none resize-none
                  "
                />
                <p className="text-xs text-slate-500 mt-1">
                  Minimum 10 characters ({message.length}/10)
                </p>
              </div>

              {/* Optional contact info */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <FiUser className="inline w-4 h-4 mr-1" />
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="
                      w-full px-4 py-2
                      bg-slate-800 border border-slate-700
                      rounded-lg text-white placeholder-slate-500
                      focus:border-purple-500 outline-none
                    "
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <FiMail className="inline w-4 h-4 mr-1" />
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="
                      w-full px-4 py-2
                      bg-slate-800 border border-slate-700
                      rounded-lg text-white placeholder-slate-500
                      focus:border-purple-500 outline-none
                    "
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Provide your email if you&apos;d like us to follow up
                  </p>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`
                  w-full py-3 rounded-xl font-medium
                  flex items-center justify-center gap-2
                  transition-all
                  ${canSubmit && !isSubmitting
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    Submit Feedback
                  </>
                )}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * NPS (Net Promoter Score) Survey
 */
export const NPSSurvey = ({
  isOpen,
  onClose,
  onSubmit,
  question = "How likely are you to recommend StacksBet Arena to a friend?"
}) => {
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    onSubmit?.({ score, feedback })
    setSubmitted(true)
    setTimeout(onClose, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-5">
        {submitted ? (
          <div className="text-center py-4">
            <FiCheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-white font-medium">Thanks for your feedback!</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <p className="text-white font-medium pr-4">{question}</p>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Score selection */}
            <div className="flex justify-between mb-2">
              {Array.from({ length: 11 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  className={`
                    w-8 h-8 rounded-lg text-sm font-medium
                    transition-all
                    ${score === i
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }
                  `}
                >
                  {i}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between text-xs text-slate-500 mb-4">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>

            {score !== null && (
              <>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What's the main reason for your score? (optional)"
                  rows={2}
                  className="
                    w-full px-3 py-2 mb-4
                    bg-slate-800 border border-slate-700
                    rounded-lg text-white placeholder-slate-500
                    text-sm resize-none outline-none
                    focus:border-purple-500
                  "
                />
                
                <button
                  onClick={handleSubmit}
                  className="
                    w-full py-2 rounded-lg
                    bg-purple-500 text-white font-medium
                    hover:bg-purple-600 transition-colors
                  "
                >
                  Submit
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Floating Feedback Button
 */
export const FeedbackButton = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-4 right-4 z-40
        px-4 py-2 rounded-full
        bg-purple-500 text-white font-medium
        shadow-lg shadow-purple-500/30
        hover:bg-purple-600 transition-all
        flex items-center gap-2
        ${className}
      `}
    >
      <FiMessageSquare className="w-5 h-5" />
      Feedback
    </button>
  )
}

export default {
  StarRating,
  EmojiRating,
  QuickFeedback,
  FeedbackModal,
  NPSSurvey,
  FeedbackButton
}
