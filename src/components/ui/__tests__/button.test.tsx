import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders the provided label', () => {
    render(<Button>Donate now</Button>)
    expect(screen.getByRole('button', { name: /donate now/i })).toBeVisible()
  })

  it('supports the ghost variant', () => {
    render(
      <Button variant="ghost" aria-label="toggle theme">
        🌗
      </Button>,
    )
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button.className).toContain('bg-transparent')
  })
})
