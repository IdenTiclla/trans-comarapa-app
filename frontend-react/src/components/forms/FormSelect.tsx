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
            'block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200 appearance-none',
            error && 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500',
            disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
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

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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
