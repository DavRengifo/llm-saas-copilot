import { useState } from 'react'
import { api } from '../api/client'
import type { ExtractField, ExtractResponse, Language } from '../types'
import { Spinner } from './Spinner'
import { FileDropArea } from './FileDropArea'

const ALL_FIELDS: { id: ExtractField; label: string; icon: string; color: string }[] = [
  { id: 'dates',   label: 'Dates',                 icon: '📅', color: 'var(--indigo)' },
  { id: 'names',   label: 'Names & organizations', icon: '👤', color: 'var(--emerald)' },
  { id: 'amounts', label: 'Amounts & quantities',  icon: '💰', color: 'var(--amber)' },
]

const FIELD_MAP = Object.fromEntries(ALL_FIELDS.map((f) => [f.id, f])) as Record<ExtractField, typeof ALL_FIELDS[0]>

export function ExtractAnalyzer() {
  const [text, setText] = useState('')
  const [loadedFile, setLoadedFile] = useState<string | null>(null)
  const [fields, setFields] = useState<ExtractField[]>(['dates', 'names', 'amounts'])
  const [language, setLanguage] = useState<Language>('en')
  const [result, setResult] = useState<ExtractResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleFileLoaded(fileText: string, filename: string) {
    setText(fileText)
    setLoadedFile(filename)
    setResult(null)
    setError(null)
  }

  function toggleField(field: ExtractField) {
    setFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    )
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (fields.length === 0) {
      setError('Select at least one field to extract.')
      return
    }
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      setResult(await api.analyzeExtract({ text, extract_fields: fields, language }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="analyzer">
      <div className="analyzer-description">
        <p>Pull structured entities out of any unstructured text — ready to paste into a spreadsheet or CRM.</p>
      </div>

      <form onSubmit={handleSubmit} className="analyzer-form">
        <div className="field">
          <div className="field-header">
            <label htmlFor="extract-text">Text to extract from</label>
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
            id="extract-text"
            value={text}
            onChange={(e) => { setText(e.target.value); setLoadedFile(null) }}
            placeholder="Paste a contract, email, invoice, news article, or any text…"
            rows={6}
            required
          />
        </div>

        <div className="extract-field-picker">
          <span className="field-picker-label">Extract</span>
          <div className="field-toggles">
            {ALL_FIELDS.map(({ id, label, icon }) => (
              <label
                key={id}
                className={`field-toggle ${fields.includes(id) ? 'active' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={fields.includes(id)}
                  onChange={() => toggleField(id)}
                />
                <span>{icon} {label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-controls">
          <div className="field-inline">
            <label htmlFor="extract-lang">Language</label>
            <select
              id="extract-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="es">🇪🇸 Español</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !text.trim() || fields.length === 0}>
            {loading ? <><Spinner size={16} /> Extracting…</> : 'Extract →'}
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
          <div className="extract-results">
            {Object.entries(result.extracted_data).map(([key, values]) => {
              const meta = FIELD_MAP[key as ExtractField]
              return (
                <div key={key} className="extract-group" style={{ '--group-color': meta?.color } as React.CSSProperties}>
                  <h4 className="extract-group-title">
                    <span>{meta?.icon}</span>
                    {meta?.label ?? key}
                    <span className="extract-count">{values?.length ?? 0}</span>
                  </h4>
                  {values && values.length > 0 ? (
                    <div className="extract-chips">
                      {values.map((v, i) => <span key={i} className="extract-chip">{v}</span>)}
                    </div>
                  ) : (
                    <p className="empty-state">Nothing found.</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
