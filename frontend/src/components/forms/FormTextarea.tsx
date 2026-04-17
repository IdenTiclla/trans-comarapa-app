import { useId, useCallback, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'onChange'> {
  label?: string
  error?: string
  helpText?: string
  showCharCount?: boolean
  autoResize?: boolean
  id?: string
  value?: string
  onChange?: (value: string) => void
}

export default function FormTextarea({
  label,
  error,
  helpText,
  showCharCount = true,
  autoResize = false,
  id: propId,
  required,
  disabled,
  readOnly,
  rows = 4,
  maxLength,
  value = '',
  onChange,
  className,
  ...rest
}: FormTextareaProps) {
  const autoId = useId()
  const id = propId ?? autoId

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value)
      if (autoResize) {
        e.target.style.height = 'auto'
        e.target.style.height = `${e.target.scrollHeight}px`
      }
    },
    [onChange, autoResize]
  )

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
        <textarea
          id={id}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          maxLength={maxLength}
          value={value}
          onChange={handleInput}
          className={cn(
            'block w-full rounded-md sm:text-sm transition-colors duration-200 resize-y py-2 px-3',
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
            disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white',
            className
          )}
          {...rest}
        />

        {maxLength && showCharCount && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none bg-white/80 px-1 rounded">
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  )
}
