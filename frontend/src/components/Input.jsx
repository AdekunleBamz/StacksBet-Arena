import React, { forwardRef, useState } from 'react'
import { HiEye, HiEyeOff, HiSearch, HiX } from 'react-icons/hi'

/**
 * Comprehensive Input components with validation and variants
 */

// Base Input component
const Input = forwardRef(({
  label,
  type = 'text',
  error,
  hint,
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'default',
  fullWidth = true,
  clearable = false,
  onClear,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const variants = {
    default: `
      bg-arena-card border border-gray-700 
      focus:border-arena-purple focus:ring-2 focus:ring-arena-purple/20
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    `,
    filled: `
      bg-gray-800 border border-transparent
      focus:bg-arena-card focus:border-arena-purple focus:ring-2 focus:ring-arena-purple/20
      ${error ? 'border-red-500' : ''}
    `,
    outline: `
      bg-transparent border-2 border-gray-600
      focus:border-arena-purple focus:ring-2 focus:ring-arena-purple/20
      ${error ? 'border-red-500' : ''}
    `,
    ghost: `
      bg-transparent border-b-2 border-gray-600 rounded-none
      focus:border-arena-purple focus:ring-0
      ${error ? 'border-red-500' : ''}
    `
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
    xl: 'px-5 py-4 text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${iconSizes[size]}`}>
            {leftIcon}
          </span>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full rounded-xl text-white placeholder-gray-500
            transition-all duration-200 outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${variants[variant]}
            ${sizes[size]}
            ${leftIcon ? 'pl-10' : ''}
            ${(rightIcon || isPassword || clearable) ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        
        {/* Right side actions */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {clearable && props.value && (
            <button
              type="button"
              onClick={onClear}
              className="p-0.5 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear input"
            >
              <HiX className={iconSizes[size]} />
            </button>
          )}
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-0.5 text-gray-400 hover:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <HiEyeOff className={iconSizes[size]} />
              ) : (
                <HiEye className={iconSizes[size]} />
              )}
            </button>
          )}
          
          {rightIcon && !isPassword && !clearable && (
            <span className={`text-gray-400 ${iconSizes[size]}`}>
              {rightIcon}
            </span>
          )}
        </div>
      </div>
      
      {(error || hint) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-400' : 'text-gray-500'}`}>
          {error || hint}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// Search Input
export const SearchInput = forwardRef(({
  onSearch,
  placeholder = 'Search...',
  ...props
}, ref) => {
  const [value, setValue] = useState(props.value || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(value)
  }

  const handleClear = () => {
    setValue('')
    onSearch?.('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        leftIcon={<HiSearch />}
        clearable={!!value}
        onClear={handleClear}
        {...props}
      />
    </form>
  )
})

SearchInput.displayName = 'SearchInput'

// Textarea
export const Textarea = forwardRef(({
  label,
  error,
  hint,
  rows = 4,
  resize = 'vertical',
  maxLength,
  showCount = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  }

  const charCount = props.value?.length || 0

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-xl text-white placeholder-gray-500
          bg-arena-card border border-gray-700
          focus:border-arena-purple focus:ring-2 focus:ring-arena-purple/20
          transition-all duration-200 outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${resizeClasses[resize]}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      
      <div className="flex justify-between mt-1.5">
        {(error || hint) && (
          <p className={`text-sm ${error ? 'text-red-400' : 'text-gray-500'}`}>
            {error || hint}
          </p>
        )}
        {showCount && maxLength && (
          <p className={`text-sm ml-auto ${charCount >= maxLength ? 'text-red-400' : 'text-gray-500'}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
})

Textarea.displayName = 'Textarea'

// Select component
export const Select = forwardRef(({
  label,
  options = [],
  error,
  hint,
  placeholder = 'Select an option',
  size = 'md',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
    xl: 'px-5 py-4 text-lg'
  }

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        className={`
          w-full rounded-xl text-white
          bg-arena-card border border-gray-700
          focus:border-arena-purple focus:ring-2 focus:ring-arena-purple/20
          transition-all duration-200 outline-none cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizes[size]}
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {(error || hint) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-400' : 'text-gray-500'}`}>
          {error || hint}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

// Checkbox
export const Checkbox = forwardRef(({
  label,
  description,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <label className={`flex items-start gap-3 cursor-pointer group ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="
          w-5 h-5 mt-0.5 rounded border-2 border-gray-600
          bg-transparent text-arena-purple
          focus:ring-2 focus:ring-arena-purple/20 focus:ring-offset-0
          checked:bg-arena-purple checked:border-arena-purple
          cursor-pointer transition-all
        "
        {...props}
      />
      <div>
        <span className="text-white group-hover:text-arena-cyan transition-colors">
          {label}
        </span>
        {description && (
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        )}
        {error && (
          <p className="text-sm text-red-400 mt-0.5">{error}</p>
        )}
      </div>
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

// Radio Group
export const RadioGroup = forwardRef(({
  label,
  name,
  options = [],
  value,
  onChange,
  error,
  orientation = 'vertical',
  className = '',
  ...props
}, ref) => {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium text-gray-300 mb-3">
          {label}
        </legend>
      )}
      
      <div className={`
        flex ${orientation === 'vertical' ? 'flex-col gap-3' : 'flex-row gap-6'}
      `}>
        {options.map((option) => (
          <label 
            key={option.value}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              ref={ref}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={option.disabled}
              className="
                w-5 h-5 border-2 border-gray-600
                bg-transparent text-arena-purple
                focus:ring-2 focus:ring-arena-purple/20 focus:ring-offset-0
                checked:border-arena-purple
                cursor-pointer transition-all
              "
              {...props}
            />
            <span className="text-white group-hover:text-arena-cyan transition-colors">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </fieldset>
  )
})

RadioGroup.displayName = 'RadioGroup'

// Toggle/Switch
export const Toggle = forwardRef(({
  label,
  description,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' }
  }

  const { track, thumb, translate } = sizes[size]

  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          className="sr-only peer"
          {...props}
        />
        <div className={`
          ${track} rounded-full
          bg-gray-700 peer-checked:bg-arena-purple
          transition-colors duration-200
        `} />
        <div className={`
          ${thumb} absolute top-0.5 left-0.5 rounded-full
          bg-white shadow-md
          transition-transform duration-200
          peer-checked:${translate}
        `} />
      </div>
      {(label || description) && (
        <div>
          {label && <span className="text-white">{label}</span>}
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      )}
    </label>
  )
})

Toggle.displayName = 'Toggle'

// Amount Input (for STX amounts)
export const AmountInput = forwardRef(({
  label,
  currency = 'STX',
  max,
  onMax,
  error,
  hint,
  ...props
}, ref) => {
  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          {max !== undefined && (
            <button
              type="button"
              onClick={onMax}
              className="text-xs text-arena-purple hover:text-arena-cyan transition-colors"
            >
              Max: {max} {currency}
            </button>
          )}
        </div>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type="number"
          step="0.000001"
          min="0"
          className={`
            w-full px-4 py-3 pr-16 rounded-xl text-white placeholder-gray-500
            bg-arena-card border border-gray-700
            focus:border-arena-purple focus:ring-2 focus:ring-arena-purple/20
            transition-all duration-200 outline-none
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            ${error ? 'border-red-500' : ''}
          `}
          {...props}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
          {currency}
        </span>
      </div>
      
      {(error || hint) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-400' : 'text-gray-500'}`}>
          {error || hint}
        </p>
      )}
    </div>
  )
})

AmountInput.displayName = 'AmountInput'

// Form Group (for grouping related inputs)
export const FormGroup = ({
  children,
  layout = 'vertical',
  className = ''
}) => {
  const layouts = {
    vertical: 'flex flex-col gap-4',
    horizontal: 'flex flex-row gap-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4'
  }

  return (
    <div className={`${layouts[layout]} ${className}`}>
      {children}
    </div>
  )
}

export default Input
