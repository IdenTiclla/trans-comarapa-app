import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ClientTypePicker } from './ClientTypePicker'
import { TicketFieldsForm } from './TicketFieldsForm'
import type { TicketForm } from './types'

describe('ticket sale responsive fields', () => {
  it('lets users switch between existing and new client flows', () => {
    const onChange = vi.fn()

    render(<ClientTypePicker value="existing" onChange={onChange} />)

    fireEvent.click(screen.getByRole('radio', { name: /cliente nuevo/i }))

    expect(onChange).toHaveBeenCalledWith('new')
  })

  it('shows the payment validation message after a failed submit attempt', () => {
    const form: TicketForm = {
      destination: 'Samaipata',
      payment_method: '',
      price: 35,
      state: 'confirmed',
    }

    render(<TicketFieldsForm form={form} setForm={vi.fn()} hasTriedSubmit />)

    expect(screen.getByText('El método de pago es requerido')).toBeInTheDocument()
  })
})
