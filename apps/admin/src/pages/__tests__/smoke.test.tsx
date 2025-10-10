import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import React from 'react'

function Page({ title }: { title: string }) {
  return <h1>{title}</h1>
}

describe('smoke pages', () => {
  it('renders dashboard heading', () => {
    render(<Page title="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
