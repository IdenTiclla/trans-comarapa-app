import { useId } from 'react'
import { cn } from '@/lib/utils'

interface RadioOption {
  [key: string]: unknown
  disabled?: boolean
  helpText?: string
}

interface FormRadioProps {
  value?: string | number | boolean
  onChange?: (value: string) => void
  options: (RadioOption | string | number)[]
  groupLabel?: string
  name?: string
  error?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  inline?: boolean
  valueKey?: string
  labelKey?: string
  id?: string
}

export default function FormRadio({
  value,
  onChange,
  options,
  groupLabel,
  name: propName,
  error,
  helpText,
  required,
  disabled,
  inline = false,
  valueKey = 'value',
  labelKey = 'label',
  id: propId,
}: FormRadioProps) {
  const autoId = useId()
  const id = propId ?? autoId
  const groupName = propName || id

  const getOptionValue = (option: RadioOption | string | number): string => {
    if (typeof option === 'object' && option !== null) {
      return String(option[valueKey] ?? '')
    }
    return String(option)
  }

  const getOptionLabel = (option: RadioOption | string | number): string => {
    if (typeof option === 'object' && option !== null) {
      return String(option[labelKey] ?? '')
    }
    return String(option)
  }

  return (
    <div className="mb-4">
      {groupLabel && (
        <div className="mb-2">
          <span className={cn('block text-sm font-medium text-gray-700', error && 'text-red-600')}>
            {groupLabel}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </div>
      )}

      <div className={cn('space-y-2', inline && 'flex flex-wrap gap-4 space-y-0')}>
        {options.map((option) => {
          const optValue = getOptionValue(option)
          const optLabel = getOptionLabel(option)
          const optDisabled = disabled || (typeof option === 'object' ? option.disabled : false)
          const optHelpText = typeof option === 'object' ? option.helpText as string : undefined
          const radioId = `${id}-${optValue}`

          return (
            <div key={optValue} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={radioId}
                  type="radio"
                  name={groupName}
                  value={optValue}
                  checked={String(value) === optValue}
                  disabled={optDisabled}
                  required={required}
                  onChange={() => onChange?.(optValue)}
                  className={cn(
                    'h-4 w-4 transition-colors duration-200 cursor-pointer',
                    error
                      ? 'border-red-300 text-red-600 focus:ring-red-500'
                      : 'border-gray-300 text-blue-600 focus:ring-blue-500',
                    optDisabled && 'bg-gray-100 cursor-not-allowed opacity-50'
                  )}
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor={radioId}
                  className={cn(
                    'font-medium text-gray-700 cursor-pointer',
                    error && 'text-red-600',
                    optDisabled && 'text-gray-500 cursor-not-allowed'
                  )}
                >
                  {optLabel}
                </label>
                {optHelpText && <p className="text-gray-500">{optHelpText}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  )
}
