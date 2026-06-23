import { useState } from 'react'
import { api } from '../api/client'
import type { FeedbackResponse, Language } from '../types'
import { ResultList } from './ResultList'
import { Spinner } from './Spinner'
import { CopyButton } from './CopyButton'

const SENTIMENT_CONFIG = {
  positive: { label: 'Positive', className: 'badge-positive', icon: '↑' },
  negative: { label: 'Negative', className: 'badge-negative', icon: '↓' },
  mixed:    { label: 'Mixed',    className: 'badge-mixed',    icon: '~' },
}

export function FeedbackAnalyzer() {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState<Language>('en')
  const [result, setResult] = useState<FeedbackResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      setResult(await api.analyzeFeedback({ text, language }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const sentiment = result ? SENTIMENT_CONFIG[result.sentiment] : null

  return (
    <div className="analyzer">
      <div className="analyzer-description">
        <p>Paste raw customer verbatims to extract themes, sentiment, priority issues, and a shareable executive summary.</p>
      </div>

      <form onSubmit={handleSubmit} className="analyzer-form">
        <div className="field">
          <div className="field-header">
            <label htmlFor="feedback-text">Customer verbatims</label>
            <span className="char-count">{text.length} chars</span>
          </div>
          <textarea
            id="feedback-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste one or several customer reviews, support tickets, NPS comments…"
            rows={6}
            required
          />
        </div>

        <div className="form-controls">
          <div className="field-inline">
            <label htmlFor="feedback-lang">Language</label>
            <select
              id="feedback-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="es">🇪🇸 Español</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !text.trim()}>
            {loading ? <><Spinner size={16} /> Analyzing…</> : 'Analyze feedback →'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-banner" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {result && sentiment && (
        <div className="result-card animate-in">
          <div className="result-card-header">
            <span className={`sentiment-badge ${sentiment.className}`}>
              <span className="sentiment-icon">{sentiment.icon}</span>
              {sentiment.label} sentiment
            </span>
            <span className="result-meta">{result.themes.length} themes · {result.priority_issues.length} issues</span>
          </div>

          <div className="result-grid">
            <ResultList label="Themes" items={result.themes} accent="var(--indigo)" />
            <ResultList label="Priority issues" items={result.priority_issues} accent="var(--rose)" />
          </div>

          <div className="result-section result-summary">
            <div className="result-section-header">
              <h4 className="result-section-title">Executive summary</h4>
              <CopyButton text={result.executive_summary} />
            </div>
            <p className="summary-text">{result.executive_summary}</p>
          </div>
        </div>
      )}
    </div>
  )
}
