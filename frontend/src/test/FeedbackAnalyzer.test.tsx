import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackAnalyzer } from '../components/FeedbackAnalyzer'

const MOCK_RESPONSE = {
  themes: ['performance', 'support'],
  sentiment: 'negative',
  priority_issues: ['app is slow'],
  executive_summary: 'Users are unhappy with performance.',
}

const SUBMIT_LABEL = /analyze feedback/i

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('FeedbackAnalyzer', () => {
  it('renders the textarea and submit button', () => {
    render(<FeedbackAnalyzer />)
    expect(screen.getByLabelText('Customer verbatims')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: SUBMIT_LABEL })).toBeInTheDocument()
  })

  it('disables submit when textarea is empty', () => {
    render(<FeedbackAnalyzer />)
    expect(screen.getByRole('button', { name: SUBMIT_LABEL })).toBeDisabled()
  })

  it('enables submit when text is entered', async () => {
    const user = userEvent.setup()
    render(<FeedbackAnalyzer />)
    await user.type(screen.getByLabelText('Customer verbatims'), 'some feedback')
    expect(screen.getByRole('button', { name: SUBMIT_LABEL })).toBeEnabled()
  })

  it('shows result on successful API response', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_RESPONSE,
    } as Response)

    render(<FeedbackAnalyzer />)
    await user.type(screen.getByLabelText('Customer verbatims'), 'slow app, bad support')
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(screen.getByText('performance')).toBeInTheDocument()
      expect(screen.getByText('Users are unhappy with performance.')).toBeInTheDocument()
    })
  })

  it('shows error message on API failure', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Invalid API key' }),
    } as Response)

    render(<FeedbackAnalyzer />)
    await user.type(screen.getByLabelText('Customer verbatims'), 'some text')
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(screen.getByText('Invalid API key')).toBeInTheDocument()
    })
  })

  it('shows error when fetch throws (network failure)', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'))

    render(<FeedbackAnalyzer />)
    await user.type(screen.getByLabelText('Customer verbatims'), 'some feedback')
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('has a language selector with en/fr/es options', () => {
    render(<FeedbackAnalyzer />)
    const select = screen.getByLabelText('Language')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /français/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /español/i })).toBeInTheDocument()
  })
})
