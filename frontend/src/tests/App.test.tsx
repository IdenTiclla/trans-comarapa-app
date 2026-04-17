import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

const DummyComponent = () => <div>Trans Comarapa Test</div>

describe('Basic Test', () => {
    it('renders a dummy component', () => {
        render(<DummyComponent />)
        expect(screen.getByText('Trans Comarapa Test')).toBeInTheDocument()
    })
})
