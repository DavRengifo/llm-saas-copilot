import { useState } from 'react'

const PRESET_KEY = import.meta.env.VITE_API_KEY ?? ''

export function ApiKeySettings() {
  const [key, setKey] = useState(() => localStorage.getItem('apiKey') ?? PRESET_KEY)
  const [visible, setVisible] = useState(false)
  const [saved, setSaved] = useState(false)
  const hasKey = !!(localStorage.getItem('apiKey') ?? PRESET_KEY)

  function save() {
    localStorage.setItem('apiKey', key)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="api-key-widget">
      <div className={`api-key-status ${hasKey ? 'status-ok' : 'status-missing'}`} title={hasKey ? 'API key set' : 'No API key set'} />
      <div className="api-key-input-wrap">
        <input
          type={visible ? 'text' : 'password'}
          placeholder="X-API-Key"
          value={key}
          onChange={(e) => { setKey(e.target.value); setSaved(false) }}
          aria-label="API key"
          className="api-key-input"
        />
        <button
          type="button"
          className="api-key-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide key' : 'Show key'}
        >
          {visible ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </div>
      <button
        type="button"
        className={`api-key-save ${saved ? 'saved' : ''}`}
        onClick={save}
        disabled={!key.trim()}
      >
        {saved ? '✓' : 'Save'}
      </button>
    </div>
  )
}
