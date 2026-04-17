import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ViewToggle } from '@/components/ui/view-toggle'

describe('ViewToggle', () => {
    const options = [
        { value: 'grid', label: 'Grid', ariaLabel: 'Grid View' },
        { value: 'list', label: 'List', ariaLabel: 'List View' }
    ]

    it('renders all options', () => {
        render(<ViewToggle value="grid" options={options} onChange={vi.fn()} />)
        expect(screen.getByText('Grid')).toBeInTheDocument()
        expect(screen.getByText('List')).toBeInTheDocument()
    })

    it('calls onChange when an option is clicked', () => {
        const handleChange = vi.fn()
        render(<ViewToggle value="grid" options={options} onChange={handleChange} />)
        
        fireEvent.click(screen.getByLabelText('List View'))
        expect(handleChange).toHaveBeenCalledWith('list')
    })

    it('applies active class to selected option', () => {
        render(<ViewToggle value="grid" options={options} onChange={vi.fn()} />)
        const gridBtn = screen.getByLabelText('Grid View')
        const listBtn = screen.getByLabelText('List View')
        
        expect(gridBtn.className).toContain('bg-background')
        expect(listBtn.className).not.toContain('bg-background')
    })
})
