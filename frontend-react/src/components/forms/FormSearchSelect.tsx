import { useState, useRef, useEffect, useCallback, useId, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface SearchSelectOption {
  [key: string]: unknown
  disabled?: boolean
}

interface FormSearchSelectProps {
  value?: unknown
  onChange?: (value: unknown) => void
  options: (SearchSelectOption | string | number)[]
  label?: string
  placeholder?: string
  error?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
  loading?: boolean
  valueKey?: string
  labelKey?: string
  onSearch?: (query: string) => void
  id?: string
}

export default function FormSearchSelect({
  value = null,
  onChange,
  options,
  label,
  placeholder = 'Seleccionar...',
  error,
  helpText,
  required,
  disabled,
  searchable = true,
  clearable = true,
  loading = false,
  valueKey = 'value',
  labelKey = 'label',
  onSearch,
  id: propId,
}: FormSearchSelectProps) {
  const autoId = useId()
  const id = propId ?? autoId

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const getOptionValue = useCallback(
    (option: SearchSelectOption | string | number): string => {
      if (typeof option === 'object' && option !== null) return String(option[valueKey] ?? '')
      return String(option)
    },
    [valueKey]
  )

  const getOptionLabel = useCallback(
    (option: SearchSelectOption | string | number): string => {
      if (typeof option === 'object' && option !== null) return String(option[labelKey] ?? '')
      return String(option)
    },
    [labelKey]
  )

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options
    const q = searchQuery.toLowerCase()
    return options.filter((opt) => getOptionLabel(opt).toLowerCase().includes(q))
  }, [options, searchQuery, getOptionLabel])

  const isSelected = useCallback(
    (option: SearchSelectOption | string | number): boolean => {
      if (value === null || value === undefined) return false
      if (typeof value === 'object' && value !== null) {
        return getOptionValue(value as SearchSelectOption) === getOptionValue(option)
      }
      return String(value) === getOptionValue(option)
    },
    [value, getOptionValue]
  )

  // Initialize search query from selected value
  useEffect(() => {
    if (value === null || value === undefined) {
      setSearchQuery('')
      return
    }
    const selected = options.find((opt) => {
      const optVal = getOptionValue(opt)
      const curVal = typeof value === 'object' && value !== null
        ? getOptionValue(value as SearchSelectOption)
        : String(value)
      return optVal === curVal
    })
    if (selected) setSearchQuery(getOptionLabel(selected))
  }, [value, options, getOptionValue, getOptionLabel])

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectOption = (option: SearchSelectOption | string | number) => {
    onChange?.(option)
    setIsOpen(false)
    setSearchQuery(getOptionLabel(option))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) { setIsOpen(true); return }
      setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (isOpen && filteredOptions.length > 0) {
        const opt = filteredOptions[highlightedIndex]
        if (opt && !(typeof opt === 'object' && opt.disabled)) selectOption(opt)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="mb-4 relative" ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className={cn('block text-sm font-medium text-gray-700 mb-1', error && 'text-red-600')}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            'relative w-full cursor-default overflow-hidden rounded-md bg-white text-left border sm:text-sm',
            error ? 'border-red-300' : 'border-gray-300',
            disabled && 'bg-gray-100 cursor-not-allowed',
            isOpen && 'ring-2 ring-blue-500 border-blue-500'
          )}
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen)
              inputRef.current?.focus()
            }
          }}
        >
          <input
            id={id}
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            readOnly={!searchable}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setHighlightedIndex(0)
              if (!isOpen) setIsOpen(true)
              onSearch?.(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none bg-transparent',
              !searchable && 'cursor-pointer'
            )}
          />

          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            {value && clearable ? (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange?.(null)
                  setSearchQuery('')
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button type="button" className="text-gray-400 focus:outline-none" onMouseDown={(e) => e.preventDefault()}>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </span>
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {loading ? (
              <div className="px-3 py-2 text-gray-500 text-center">
                <svg className="animate-spin h-5 w-5 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="mt-1 block">Cargando...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-center">No se encontraron resultados</div>
            ) : (
              filteredOptions.map((option, index) => {
                const optDisabled = typeof option === 'object' ? option.disabled : false
                return (
                  <div
                    key={getOptionValue(option)}
                    className={cn(
                      'cursor-pointer select-none relative py-2 pl-3 pr-9',
                      highlightedIndex === index ? 'bg-blue-100 text-blue-900' : 'text-gray-900',
                      optDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      if (!optDisabled) selectOption(option)
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className={cn('block truncate', isSelected(option) && 'font-medium')}>
                      {getOptionLabel(option)}
                    </span>
                    {isSelected(option) && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                )
              })
            )}
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
