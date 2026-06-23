import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('App', () => {
  it('renders the header title', () => {
    render(<App />)
    expect(screen.getByText('LLM Copilot')).toBeInTheDocument()
  })

  it('renders all three tabs', () => {
    render(<App />)
    expect(screen.getByRole('tab', { name: 'Feedback analysis' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Document summary' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Entity extraction' })).toBeInTheDocument()
  })

  it('shows feedback analyzer by default', () => {
    render(<App />)
    expect(screen.getByLabelText('Customer verbatims')).toBeInTheDocument()
  })

  it('switches to document analyzer tab', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Document summary' }))
    expect(screen.getByLabelText('Document / meeting notes')).toBeInTheDocument()
  })

  it('switches to extract analyzer tab', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Entity extraction' }))
    expect(screen.getByLabelText('Text to extract from')).toBeInTheDocument()
  })
})
