import { useState } from 'react'
import { api } from '../api/client'
import type { DocumentResponse, Language, OutputFormat } from '../types'
import { ResultList } from './ResultList'
import { Spinner } from './Spinner'
import { CopyButton } from './CopyButton'
import { FileDropArea } from './FileDropArea'

export function DocumentAnalyzer() {
  const [text, setText] = useState('')
  const [loadedFile, setLoadedFile] = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('structured')
  const [language, setLanguage] = useState<Language>('en')
  const [result, setResult] = useState<DocumentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleFileLoaded(fileText: string, filename: string) {
    setText(fileText)
    setLoadedFile(filename)
    setResult(null)
    setError(null)
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      setResult(await api.analyzeDocument({ text, output_format: outputFormat, language }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="analyzer">
      <div className="analyzer-description">
        <p>Paste any document or meeting notes to extract key points, decisions, and action items automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="analyzer-form">
        <div className="field">
          <div className="field-header">
            <label htmlFor="doc-text">Document / meeting notes</label>
            <span className="char-count">{text.length} chars</span>
          </div>
          <FileDropArea onTextLoaded={handleFileLoaded} />
          {loadedFile && (
            <p className="file-loaded-badge">
              📄 {loadedFile}
              <button type="button" className="file-clear-btn" onClick={() => { setText(''); setLoadedFile(null) }}>✕</button>
            </p>
          )}
          <textarea
            id="doc-text"
            value={text}
            onChange={(e) => { setText(e.target.value); setLoadedFile(null) }}
            placeholder="Paste a meeting transcript, a document, a report, a Slack thread…"
            rows={6}
            required
          />
        </div>

        <div className="form-controls">
          <div className="field-inline">
            <label htmlFor="doc-format">Output style</label>
            <select
              id="doc-format"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
            >
              <option value="structured">Structured prose</option>
              <option value="bullets">Short bullets</option>
            </select>
          </div>
          <div className="field-inline">
            <label htmlFor="doc-lang">Language</label>
            <select
              id="doc-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="es">🇪🇸 Español</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !text.trim()}>
            {loading ? <><Spinner size={16} /> Summarizing…</> : 'Summarize →'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-banner" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {result && (
        <div className="result-card animate-in">
          <div className="result-stats-row">
            <span className="stat-chip">{result.key_points.length} key points</span>
            <span className="stat-chip">{result.decisions.length} decisions</span>
            <span className="stat-chip">{result.actions.length} actions</span>
          </div>

          <div className="result-grid">
            <ResultList label="Key points" items={result.key_points} accent="var(--indigo)" />
            <ResultList label="Decisions" items={result.decisions} accent="var(--emerald)" />
          </div>

          <ResultList label="Action items" items={result.actions} accent="var(--amber)" />

          <div className="result-section result-summary">
            <div className="result-section-header">
              <h4 className="result-section-title">Summary</h4>
              <CopyButton text={result.summary} />
            </div>
            <p className="summary-text">{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  )
}
