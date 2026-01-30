import { useState, useCallback, useMemo } from 'react'

/**
 * Form validation utilities for StacksBet Arena
 */

// Validation rules
export const rules = {
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required'
    }
    if (Array.isArray(value) && value.length === 0) {
      return 'This field is required'
    }
    return null
  },

  minLength: (min) => (value) => {
    if (!value) return null
    if (value.length < min) {
      return `Must be at least ${min} characters`
    }
    return null
  },

  maxLength: (max) => (value) => {
    if (!value) return null
    if (value.length > max) {
      return `Must be no more than ${max} characters`
    }
    return null
  },

  min: (minVal) => (value) => {
    if (value === null || value === undefined || value === '') return null
    const num = Number(value)
    if (isNaN(num) || num < minVal) {
      return `Must be at least ${minVal}`
    }
    return null
  },

  max: (maxVal) => (value) => {
    if (value === null || value === undefined || value === '') return null
    const num = Number(value)
    if (isNaN(num) || num > maxVal) {
      return `Must be no more than ${maxVal}`
    }
    return null
  },

  email: (value) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  },

  url: (value) => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return 'Please enter a valid URL'
    }
  },

  pattern: (regex, message) => (value) => {
    if (!value) return null
    if (!regex.test(value)) {
      return message || 'Invalid format'
    }
    return null
  },

  stxAddress: (value) => {
    if (!value) return null
    const stxRegex = /^S[A-Z0-9]{39,40}$/
    if (!stxRegex.test(value)) {
      return 'Please enter a valid STX address'
    }
    return null
  },

  positiveNumber: (value) => {
    if (value === null || value === undefined || value === '') return null
    const num = Number(value)
    if (isNaN(num) || num <= 0) {
      return 'Must be a positive number'
    }
    return null
  },

  integer: (value) => {
    if (value === null || value === undefined || value === '') return null
    const num = Number(value)
    if (isNaN(num) || !Number.isInteger(num)) {
      return 'Must be a whole number'
    }
    return null
  },

  futureDate: (value) => {
    if (!value) return null
    const date = new Date(value)
    if (date <= new Date()) {
      return 'Date must be in the future'
    }
    return null
  },

  pastDate: (value) => {
    if (!value) return null
    const date = new Date(value)
    if (date >= new Date()) {
      return 'Date must be in the past'
    }
    return null
  },

  match: (fieldName, fieldValue, message) => (value) => {
    if (!value) return null
    if (value !== fieldValue) {
      return message || `Must match ${fieldName}`
    }
    return null
  },

  custom: (validator, message) => (value) => {
    if (!validator(value)) {
      return message || 'Invalid value'
    }
    return null
  }
}

/**
 * Validate a single field with multiple rules
 */
export const validateField = (value, fieldRules) => {
  for (const rule of fieldRules) {
    const error = rule(value)
    if (error) return error
  }
  return null
}

/**
 * Validate entire form
 */
export const validateForm = (values, schema) => {
  const errors = {}
  let isValid = true

  for (const [fieldName, fieldRules] of Object.entries(schema)) {
    const error = validateField(values[fieldName], fieldRules)
    if (error) {
      errors[fieldName] = error
      isValid = false
    }
  }

  return { errors, isValid }
}

/**
 * useForm hook for form state management
 */
export const useForm = (initialValues = {}, validationSchema = {}, options = {}) => {
  const { validateOnChange = true, validateOnBlur = true, onSubmit } = options

  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)

  // Reset form
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
    setSubmitCount(0)
  }, [initialValues])

  // Set field value
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    if (validateOnChange && validationSchema[name]) {
      const error = validateField(value, validationSchema[name])
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [validateOnChange, validationSchema])

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setValue(name, newValue)
  }, [setValue])

  // Handle blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))

    if (validateOnBlur && validationSchema[name]) {
      const error = validateField(values[name], validationSchema[name])
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [validateOnBlur, validationSchema, values])

  // Set field touched
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }))
  }, [])

  // Set field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  // Validate all fields
  const validate = useCallback(() => {
    const result = validateForm(values, validationSchema)
    setErrors(result.errors)
    // Touch all fields
    const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {})
    setTouched(allTouched)
    return result.isValid
  }, [values, validationSchema])

  // Handle submit
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault()
    
    setSubmitCount(c => c + 1)
    const isValid = validate()
    
    if (!isValid) return

    setIsSubmitting(true)
    try {
      await onSubmit?.(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [validate, onSubmit, values])

  // Get field props helper
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur
  }), [values, handleChange, handleBlur])

  // Compute form state
  const isValid = useMemo(() => {
    const result = validateForm(values, validationSchema)
    return result.isValid
  }, [values, validationSchema])

  const isDirty = useMemo(() => {
    return Object.keys(values).some(key => values[key] !== initialValues[key])
  }, [values, initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    submitCount,
    setValue,
    setValues,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    getFieldProps
  }
}

/**
 * useField hook for individual field management
 */
export const useField = (name, form) => {
  const { values, errors, touched, setValue, setFieldTouched, handleBlur: formBlur } = form

  const value = values[name]
  const error = errors[name]
  const isTouched = touched[name]
  const showError = isTouched && !!error

  const handleChange = useCallback((e) => {
    const newValue = e.target ? e.target.value : e
    setValue(name, newValue)
  }, [name, setValue])

  const handleBlur = useCallback((e) => {
    formBlur(e || { target: { name } })
  }, [formBlur, name])

  return {
    value,
    error,
    isTouched,
    showError,
    onChange: handleChange,
    onBlur: handleBlur,
    props: {
      name,
      value: value || '',
      onChange: handleChange,
      onBlur: handleBlur,
      'aria-invalid': showError,
      'aria-describedby': showError ? `${name}-error` : undefined
    }
  }
}

/**
 * Market creation form schema
 */
export const marketFormSchema = {
  title: [
    rules.required,
    rules.minLength(10),
    rules.maxLength(200)
  ],
  description: [
    rules.required,
    rules.minLength(20),
    rules.maxLength(1000)
  ],
  category: [
    rules.required
  ],
  resolutionDate: [
    rules.required,
    rules.futureDate
  ],
  initialLiquidity: [
    rules.required,
    rules.positiveNumber,
    rules.min(10)
  ]
}

/**
 * Bet form schema
 */
export const betFormSchema = {
  amount: [
    rules.required,
    rules.positiveNumber,
    rules.min(0.1)
  ],
  outcome: [
    rules.required
  ]
}

/**
 * Profile form schema
 */
export const profileFormSchema = {
  displayName: [
    rules.minLength(2),
    rules.maxLength(50)
  ],
  bio: [
    rules.maxLength(500)
  ],
  twitter: [
    rules.pattern(/^@?[a-zA-Z0-9_]{1,15}$/, 'Invalid Twitter handle')
  ],
  website: [
    rules.url
  ]
}

/**
 * Error message component
 */
export const FormError = ({ error, id, className = '' }) => {
  if (!error) return null

  return (
    <p
      id={id}
      role="alert"
      className={`text-sm text-red-400 mt-1 ${className}`}
    >
      {error}
    </p>
  )
}

/**
 * Form field wrapper with label and error
 */
export const FormField = ({
  label,
  name,
  error,
  touched,
  required,
  hint,
  children,
  className = ''
}) => {
  const showError = touched && error

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {hint && !showError && (
        <p className="text-sm text-slate-500 mt-1">{hint}</p>
      )}
      
      <FormError error={showError ? error : null} id={`${name}-error`} />
    </div>
  )
}

export default {
  rules,
  validateField,
  validateForm,
  useForm,
  useField,
  marketFormSchema,
  betFormSchema,
  profileFormSchema,
  FormError,
  FormField
}
