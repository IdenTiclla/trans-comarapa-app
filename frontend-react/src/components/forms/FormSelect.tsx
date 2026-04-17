import { useId, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  [key: string]: unknown
  disabled?: boolean
}

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'onChange'> {
  label?: string
  error?: string
  helpText?: string
  options: (SelectOption | string | number)[]
  valueKey?: string
  labelKey?: string
  placeholder?: string
  id?: string
  onChange?: (value: string) => void
  clearable?: boolean
  onClear?: () => void
}

export default function FormSelect({
  label,
  error,
  helpText,
  options,
  valueKey = 'value',
  labelKey = 'label',
  placeholder = 'Seleccionar...',
  id: propId,
  required,
  disabled,
  value,
  onChange,
  className,
  clearable = false,
  onClear,
  ...rest
}: FormSelectProps) {
  const autoId = useId()
  const id = propId ?? autoId

  const getOptionValue = (option: SelectOption | string | number): string => {
    if (typeof option === 'object' && option !== null) {
      return String(option[valueKey] ?? '')
    }
    return String(option)
  }

  const getOptionLabel = (option: SelectOption | string | number): string => {
    if (typeof option === 'object' && option !== null) {
      return String(option[labelKey] ?? '')
    }
    return String(option)
  }

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium text-gray-700 mb-1',
            error && 'text-red-600'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          required={required}
          disabled={disabled}
          value={value as string}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'block w-full rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none transition-all duration-200 appearance-none',
            'border-gray-200 bg-gray-50/50 hover:border-gray-400',
            'focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white',
            error && 'border-red-300 text-red-900 focus:ring-red-500/10 focus:border-red-500',
            disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60',
            !value && placeholder && 'text-gray-400',
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={getOptionValue(option)}
              value={getOptionValue(option)}
              disabled={typeof option === 'object' ? option.disabled : false}
            >
              {getOptionLabel(option)}
            </option>
          ))}
        </select>

        {clearable && value && (
            <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); onClear?.(); }} 
                className="absolute inset-y-0 right-8 pr-1 flex items-center text-gray-400 hover:text-gray-600 z-10"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        )}

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8l4 4 4-4" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  )
}
