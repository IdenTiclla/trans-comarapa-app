import { useId } from 'react'
import { cn } from '@/lib/utils'

interface FormCheckboxProps {
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  error?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  id?: string
}

export default function FormCheckbox({
  label,
  checked = false,
  onChange,
  error,
  helpText,
  required,
  disabled,
  id: propId,
}: FormCheckboxProps) {
  const autoId = useId()
  const id = propId ?? autoId

  return (
    <div className="mb-4">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            required={required}
            onChange={(e) => onChange?.(e.target.checked)}
            className={cn(
              'h-5 w-5 rounded border-gray-300 text-primary transition-all duration-200 cursor-pointer',
              'focus:ring-4 focus:ring-primary/10 focus:ring-offset-0',
              error
                ? 'border-red-300 text-red-600 focus:ring-red-500/10'
                : 'bg-gray-50/50 hover:border-primary/50',
              disabled && 'bg-gray-100 cursor-not-allowed opacity-50'
            )}
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor={id}
            className={cn(
              'font-medium text-gray-700 cursor-pointer',
              error && 'text-red-600',
              disabled && 'text-gray-500 cursor-not-allowed'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {helpText && !error && <p className="text-gray-500">{helpText}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}
