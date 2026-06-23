import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExtractAnalyzer } from '../components/ExtractAnalyzer'

const MOCK_RESPONSE = {
  extracted_data: {
    dates: ['March 3rd'],
    names: ['Alice'],
  },
}

const SUBMIT_LABEL = /extract/i

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ExtractAnalyzer', () => {
  it('renders all three field checkboxes checked by default', () => {
    render(<ExtractAnalyzer />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    checkboxes.forEach((cb) => expect(cb).toBeChecked())
  })

  it('disables submit when no text is entered', () => {
    render(<ExtractAnalyzer />)
    expect(screen.getByRole('button', { name: SUBMIT_LABEL })).toBeDisabled()
  })

  it('shows extracted results on success', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_RESPONSE,
    } as Response)

    render(<ExtractAnalyzer />)
    await user.type(screen.getByLabelText('Text to extract from'), 'Alice met on March 3rd.')
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(screen.getByText('March 3rd')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })

  it('has a language selector with en/fr/es options', () => {
    render(<ExtractAnalyzer />)
    const select = screen.getByLabelText('Language')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /english/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /français/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /español/i })).toBeInTheDocument()
  })

  it('shows error when fetch throws (network failure)', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'))

    render(<ExtractAnalyzer />)
    await user.type(screen.getByLabelText('Text to extract from'), 'some text')
    await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('disables submit when all checkboxes are unchecked', async () => {
    const user = userEvent.setup()
    render(<ExtractAnalyzer />)

    const checkboxes = screen.getAllByRole('checkbox')
    for (const cb of checkboxes) await user.click(cb)

    await user.type(screen.getByLabelText('Text to extract from'), 'some text')
    expect(screen.getByRole('button', { name: SUBMIT_LABEL })).toBeDisabled()
  })
})
