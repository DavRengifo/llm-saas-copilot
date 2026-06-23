import type {
  FeedbackRequest, FeedbackResponse,
  DocumentRequest, DocumentResponse,
  ExtractRequest, ExtractResponse,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

function getApiKey(): string {
  return localStorage.getItem('apiKey') ?? import.meta.env.VITE_API_KEY ?? ''
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': getApiKey(),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  analyzeFeedback: (req: FeedbackRequest) =>
    post<FeedbackResponse>('/analyze/feedback', req),

  analyzeDocument: (req: DocumentRequest) =>
    post<DocumentResponse>('/analyze/document', req),

  analyzeExtract: (req: ExtractRequest) =>
    post<ExtractResponse>('/analyze/extract', req),
}
