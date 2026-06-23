export type Language = 'en' | 'fr' | 'es'
export type OutputFormat = 'structured' | 'bullets'
export type ExtractField = 'dates' | 'names' | 'amounts'

export interface FeedbackRequest {
  text: string
  language: Language
}

export interface FeedbackResponse {
  themes: string[]
  sentiment: 'positive' | 'negative' | 'mixed'
  priority_issues: string[]
  executive_summary: string
}

export interface DocumentRequest {
  text: string
  output_format: OutputFormat
  language: Language
}

export interface DocumentResponse {
  key_points: string[]
  decisions: string[]
  actions: string[]
  summary: string
}

export interface ExtractRequest {
  text: string
  extract_fields: ExtractField[]
  language: Language
}

export interface ExtractResponse {
  extracted_data: Partial<Record<ExtractField, string[]>>
}
