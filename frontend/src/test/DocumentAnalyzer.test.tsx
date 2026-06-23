import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentAnalyzer } from '../components/DocumentAnalyzer'

const MOCK_RESPONSE = {
  key_points: ['migration to PostgreSQL', 'performance concerns'],
  decisions: ['migrate to PostgreSQL'],
  actions: ['John to update schema by Monday'],
  summary: 'The team agreed to migrate and John owns the schema update.',
}

const SUBMIT_LABEL = /summarize/i

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DocumentAnalyzer', () => {
  it('renders the textarea and submit button', () => {
    render(<DocumentAnalyzer />)
    expect(screen.getByLabelText('Document / meeting notes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: SUBMIT_LABEL })).toBeInTheDocument()
  })

  it('disables submit when textarea is empty', () => {
    render(<DocumentAnalyzer />)
    expect(screen.getByRole('button', { name: SUBMIT_LABEL })).toBeDisabled()
  })

  it('enables submit when text is entered', async () => {
    const user = userEvent.setup()
    render(<DocumentAnalyzer />)
    await user.type(screen.getByLabelText('Document / meeting notes'), 'Meeting notes here')
    expect(screen.getByRole('button', { name: SUBMIT_LABEL })).toBeEnabled()
  })

  it('shows result on successful API response', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_RESPONSE,
    } as Response)

    render(<DocumentAnalyzer />)
    await user.type(screen.getByLabelText('Document / meeting notes'), 'We agreed to migrate.')
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(screen.getByText('migration to PostgreSQL')).toBeInTheDocument()
      expect(screen.getByText('migrate to PostgreSQL')).toBeInTheDocument()
      expect(screen.getByText('John to update schema by Monday')).toBeInTheDocument()
      expect(screen.getByText('The team agreed to migrate and John owns the schema update.')).toBeInTheDocument()
    })
  })

  it('shows error message on API failure', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Invalid API key' }),
    } as Response)

    render(<DocumentAnalyzer />)
    await user.type(screen.getByLabelText('Document / meeting notes'), 'some notes')
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(screen.getByText('Invalid API key')).toBeInTheDocument()
    })
  })

  it('shows error when fetch throws (network failure)', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'))

    render(<DocumentAnalyzer />)
    await user.type(screen.getByLabelText('Document / meeting notes'), 'some notes')
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('has an output format selector with structured and bullets options', () => {
    render(<DocumentAnalyzer />)
    const select = screen.getByLabelText('Output style')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Structured prose' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Short bullets' })).toBeInTheDocument()
  })

  it('has a language selector with en/fr/es options', () => {
    render(<DocumentAnalyzer />)
    const select = screen.getByLabelText('Language')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /français/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /español/i })).toBeInTheDocument()
  })
})
