import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: string
  error?: string
  helpText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  clearable?: boolean
  onClear?: () => void
  id?: string
}

export default function FormInput({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  id: propId,
  required,
  disabled,
  value,
  className,
  ...rest
}: FormInputProps) {
  const autoId = useId()
  const id = propId ?? autoId

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

      <div className="relative rounded-md shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={cn('h-5 w-5 text-gray-400', error && 'text-red-400')}>
              {leftIcon}
            </span>
          </div>
        )}

        <input
          id={id}
          required={required}
          disabled={disabled}
          value={value}
          className={cn(
            'block w-full rounded-xl sm:text-sm transition-all duration-200 py-2.5',
            'border-gray-200 bg-gray-50/50 hover:border-gray-400',
            'focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white',
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500/10 focus:border-red-500'
              : 'text-gray-900',
            leftIcon ? 'pl-10' : 'pl-4',
            rightIcon || clearable ? 'pr-10' : 'pr-4',
            disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60' : '',
            className
          )}
          {...rest}
        />

        {clearable && value ? (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={() => onClear?.()}
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        ) : rightIcon ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={cn('h-5 w-5 text-gray-400', error && 'text-red-400')}>
              {rightIcon}
            </span>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  )
}
