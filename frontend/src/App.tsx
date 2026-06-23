import { useState, useEffect } from 'react'
import { FeedbackAnalyzer } from './components/FeedbackAnalyzer'
import { DocumentAnalyzer } from './components/DocumentAnalyzer'
import { ExtractAnalyzer } from './components/ExtractAnalyzer'
import { ApiKeySettings } from './components/ApiKeySettings'
import './App.css'

type Tab = 'feedback' | 'document' | 'extract'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'feedback', label: 'Feedback analysis', icon: '💬' },
  { id: 'document', label: 'Document summary',  icon: '📄' },
  { id: 'extract',  label: 'Entity extraction', icon: '🔍' },
]

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export default function App() {
  const [tab, setTab] = useState<Tab>('feedback')
  const [serverStatus, setServerStatus] = useState<'checking' | 'ok' | 'waking'>('checking')

  useEffect(() => {
    // Only ping the backend in production (when VITE_API_URL is set)
    if (!BASE_URL) { setServerStatus('ok'); return }

    const timer = setTimeout(() => setServerStatus('waking'), 3000)

    fetch(`${BASE_URL}/health`)
      .then((r) => { if (r.ok) { clearTimeout(timer); setServerStatus('ok') } })
      .catch(() => { clearTimeout(timer); setServerStatus('waking') })
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <div className="app-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="app-logo-text">LLM Copilot</span>
            <span className="app-logo-badge">GPT-powered</span>
          </div>
          <ApiKeySettings />
        </div>
      </header>

      {serverStatus === 'waking' && (
        <div className="server-wake-banner" role="status">
          <span className="wake-spinner">⏳</span>
          Server is waking up — first request may take ~30s on the free tier. Hang tight!
        </div>
      )}

      <div className="app-body">
        <nav className="tab-nav" role="tablist" aria-label="Analysis tools">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              className={`tab-btn ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <span className="tab-icon" aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div
          className="analyzer-card"
          role="tabpanel"
          id={`panel-${tab}`}
          aria-label={TABS.find(t => t.id === tab)?.label}
        >
          {tab === 'feedback' && <FeedbackAnalyzer />}
          {tab === 'document' && <DocumentAnalyzer />}
          {tab === 'extract'  && <ExtractAnalyzer />}
        </div>
      </div>
    </div>
  )
}
