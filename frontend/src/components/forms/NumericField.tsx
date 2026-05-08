import { useState, useEffect, type InputHTMLAttributes } from 'react'
import FormInput from './FormInput'

type BaseProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'min' | 'max' | 'step'>

interface IntegerFieldProps extends BaseProps {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  label?: string
  required?: boolean
  error?: string
}

interface DecimalFieldProps extends BaseProps {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  decimals?: number
  label?: string
  required?: boolean
  error?: string
}

/**
 * Integer-only numeric input that keeps text state internally so the user can
 * clear and retype without leading zeros and without losing focus.
 */
export function IntegerField({ value, onChange, min = 0, max, ...rest }: IntegerFieldProps) {
  const [text, setText] = useState(value === 0 ? '' : String(value))
  useEffect(() => {
    const parsed = parseInt(text, 10)
    if (parsed !== value) setText(value === 0 ? '' : String(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <FormInput
      type="number"
      inputMode="numeric"
      value={text}
      min={String(min)}
      max={max !== undefined ? String(max) : undefined}
      step="1"
      onChange={(e) => {
        const v = e.target.value.replace(/[^\d]/g, '')
        setText(v)
        const n = v === '' ? 0 : parseInt(v, 10) || 0
        onChange(Math.max(min, max !== undefined ? Math.min(n, max) : n))
      }}
      onBlur={() => {
        if (text === '') return onChange(0)
        const n = Math.max(min, parseInt(text, 10) || 0)
        const clamped = max !== undefined ? Math.min(n, max) : n
        setText(clamped === 0 ? '' : String(clamped))
        onChange(clamped)
      }}
      {...rest}
    />
  )
}

/**
 * Decimal numeric input (default 2 decimals) with internal text state to allow
 * typing trailing dots/zeros without React stripping them.
 */
export function DecimalField({
  value,
  onChange,
  min = 0,
  max,
  decimals = 2,
  ...rest
}: DecimalFieldProps) {
  const [text, setText] = useState(value === 0 ? '' : String(value))
  useEffect(() => {
    const parsed = parseFloat(text)
    if (parsed !== value && !(value === 0 && (text === '' || text === '.'))) {
      setText(value === 0 ? '' : String(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const stepStr = decimals > 0 ? `0.${'0'.repeat(decimals - 1)}1` : '1'

  return (
    <FormInput
      type="number"
      inputMode="decimal"
      value={text}
      min={String(min)}
      max={max !== undefined ? String(max) : undefined}
      step={stepStr}
      onChange={(e) => {
        let v = e.target.value.replace(/[^\d.]/g, '')
        const firstDot = v.indexOf('.')
        if (firstDot !== -1) {
          v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '')
          const [int, frac] = v.split('.')
          if (frac !== undefined) v = `${int}.${frac.slice(0, decimals)}`
        }
        setText(v)
        if (v === '' || v === '.') return onChange(0)
        const n = parseFloat(v)
        if (!Number.isNaN(n)) {
          const clamped = Math.max(min, max !== undefined ? Math.min(n, max) : n)
          onChange(clamped)
        }
      }}
      onBlur={() => {
        if (text === '' || text === '.') {
          setText('')
          onChange(0)
          return
        }
        const n = parseFloat(text)
        if (Number.isNaN(n)) return
        const factor = 10 ** decimals
        const rounded = Math.round(n * factor) / factor
        const clamped = Math.max(min, max !== undefined ? Math.min(rounded, max) : rounded)
        setText(String(clamped))
        onChange(clamped)
      }}
      {...rest}
    />
  )
}
