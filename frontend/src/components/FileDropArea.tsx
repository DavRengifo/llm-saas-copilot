import { useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const ACCEPTED_FORMATS = '.txt .md .csv .json .xml .html .log .pdf'
const ACCEPT_ATTR = '.txt,.md,.csv,.json,.xml,.html,.log,.pdf'

interface Props {
  onTextLoaded: (text: string, filename: string) => void
}

async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pageTexts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const lineText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    pageTexts.push(lineText)
  }
  return pageTexts.join('\n\n').trim()
}

export function FileDropArea({ onTextLoaded }: Props) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function readFile(file: File) {
    setError(null)
    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()

    if (file.type === 'application/pdf' || ext === '.pdf') {
      setPdfLoading(true)
      try {
        const text = await extractPdfText(file)
        if (!text) {
          setError('PDF vide ou non lisible (PDF scanné sans OCR). Colle le texte manuellement.')
          return
        }
        onTextLoaded(text, file.name)
      } catch {
        setError('Erreur lors de la lecture du PDF. Essaie de coller le texte manuellement.')
      } finally {
        setPdfLoading(false)
      }
      return
    }

    if (['.docx', '.doc', '.xlsx', '.xls', '.pptx'].includes(ext)) {
      setError('Format Word/Excel non supporté. Copie le texte depuis le document et colle-le.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text?.trim()) {
        setError('Le fichier semble vide ou illisible.')
        return
      }
      onTextLoaded(text, file.name)
    }
    reader.onerror = () => setError('Impossible de lire ce fichier.')
    reader.readAsText(file, 'UTF-8')
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) readFile(file)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) readFile(file)
    e.target.value = ''
  }

  return (
    <div
      className={`file-drop-area ${dragging ? 'dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {pdfLoading ? (
        <span className="file-pdf-loading">⏳ Lecture du PDF…</span>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>Glisse un fichier ici ou </span>
          <button type="button" className="file-pick-btn" onClick={() => inputRef.current?.click()}>
            parcourir
          </button>
          <span className="file-formats">{ACCEPTED_FORMATS}</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={onFileChange}
        style={{ display: 'none' }}
        aria-label="Sélectionner un fichier"
      />
      {error && <p className="file-drop-error">{error}</p>}
    </div>
  )
}
