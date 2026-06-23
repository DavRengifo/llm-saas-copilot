# LLM Copilot

> An AI-powered text analysis platform that turns raw text into structured, actionable insights — in seconds.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## What is LLM Copilot?

**For everyone (non-technical summary)**

Imagine having a brilliant analyst available 24/7 who can read any piece of text — a pile of customer complaints, a long meeting transcript, a contract full of numbers and names — and give you a clean, structured summary in under three seconds. That's LLM Copilot.

It's a web application that connects to a powerful AI language model (OpenAI's GPT) through a secure API. You paste text in, choose what kind of analysis you want, and get back structured, ready-to-use information. No copy-pasting into ChatGPT, no manual extraction, no inconsistency — just reliable, repeatable intelligence, accessible via a modern web interface or directly by developers through a REST API.

**For the business (CEO/leadership perspective)**

LLM Copilot is a production-ready, multi-tenant SaaS foundation designed to be extended, white-labeled, or embedded into existing workflows. It currently solves three concrete, high-value use cases:

1. **Customer feedback analysis** — processes raw verbatims and returns sentiment, themes, priority issues, and an executive summary ready for a product meeting.
2. **Document & meeting summarization** — extracts key points, decisions, and action items from any unstructured document.
3. **Entity extraction** — pulls structured data (dates, names, monetary amounts) from any text, ready to flow into a CRM, spreadsheet, or database.

Each analysis that would take a human 15–30 minutes is completed in 2–3 seconds, at a fraction of the cost. The system is secured with API key authentication, built to be deployed on Vercel (frontend) and any Python host (backend), and is fully tested from API to UI.

---

## Features

| Feature | Description |
|---|---|
| **Feedback analysis** | Sentiment (positive/negative/mixed), themes, priority issues, executive summary |
| **Document summarization** | Key points, decisions, action items, paragraph summary |
| **Entity extraction** | Dates, names/organizations, monetary amounts & quantities |
| **Multilingual** | Supports English, French, and Spanish responses |
| **API authentication** | `X-API-Key` header-based auth protects all analysis endpoints |
| **Structured JSON output** | All LLM responses are validated against strict Pydantic schemas |
| **REST API** | Full FastAPI backend with automatic OpenAPI docs (`/docs`) |
| **Modern UI** | React + TypeScript frontend, no framework dependencies |
| **Full test suite** | 20 backend tests (pytest) + 26 frontend tests (Vitest + RTL) |
| **Cost controls** | Input capped at 50 000 chars, output at 1 500 tokens, 20 req/min rate limit per IP |

---

## How it works

### The big picture (non-technical)

```
You (browser / API client)
        │
        │  POST /analyze/feedback   ← your text
        ▼
  ┌─────────────┐
  │  FastAPI    │   ← checks your API key, builds a prompt
  │  Backend    │
  └─────┬───────┘
        │
        │  OpenAI API call (GPT model)
        ▼
  ┌─────────────┐
  │   OpenAI    │   ← an AI model reads the text and returns structured JSON
  └─────┬───────┘
        │
        │  validated JSON response
        ▼
  ┌─────────────┐
  │  FastAPI    │   ← validates the response, sends it back to you
  └─────┬───────┘
        │
        ▼
  Your browser shows the results
```

The system works like a translator between human language and structured data. You give it messy text; it gives you clean, organized information.

### Technical architecture

```
llm-saas-copilot/
├── backend/                    # Python / FastAPI
│   ├── main.py                 # App entry point, CORS, router registration
│   ├── routers/
│   │   └── analyze.py          # POST /analyze/{feedback,document,extract}
│   ├── models/
│   │   └── schemas.py          # Pydantic v2 request & response schemas
│   ├── services/
│   │   └── llm_service.py      # OpenAI client wrapper
│   ├── prompts/
│   │   ├── feedback_analysis.py
│   │   ├── document_analysis.py
│   │   └── extract.py
│   ├── dependencies.py         # API key auth dependency
│   └── tests/                  # pytest test suite
│       ├── conftest.py
│       ├── test_health.py
│       ├── test_auth.py
│       └── test_analyze.py
│
└── frontend/                   # React + TypeScript / Vite
    └── src/
        ├── api/client.ts       # Typed fetch wrapper
        ├── types.ts            # Shared TypeScript interfaces
        ├── components/
        │   ├── FeedbackAnalyzer.tsx
        │   ├── DocumentAnalyzer.tsx
        │   ├── ExtractAnalyzer.tsx
        │   ├── ApiKeySettings.tsx
        │   ├── ResultList.tsx
        │   ├── Spinner.tsx
        │   └── CopyButton.tsx
        └── test/               # Vitest + Testing Library
```

**Data flow per request:**

1. Browser sends `POST /analyze/feedback` with `{ text, language }` + `X-API-Key` header
2. FastAPI's `verify_api_key` dependency validates the key against `API_SECRET_KEY` env var
3. The prompt builder constructs a system prompt + user message tailored to the requested analysis
4. `call_llm()` sends both to the OpenAI chat completions API at temperature 0.3
5. The raw response is parsed with `json.loads()` and validated by Pydantic
6. On success the typed model is returned as JSON; on LLM failure a 422 is raised
7. The frontend renders the typed result

**Why temperature 0.3?** Lower temperature means more deterministic, consistent outputs — critical for structured data extraction where you need stable JSON, not creative prose.

---

## Tech stack

### Backend
| Layer | Technology | Why |
|---|---|---|
| Web framework | **FastAPI** | Async, automatic OpenAPI docs, Pydantic integration |
| Data validation | **Pydantic v2** | Strict schema enforcement on both input and LLM output |
| LLM provider | **OpenAI SDK** (`gpt-4o-mini`) | Fast, cheap, strong instruction following |
| Server | **Uvicorn** (ASGI) | Production-grade async server |
| Testing | **pytest + httpx** | Mocked LLM calls, full route coverage |

### Frontend
| Layer | Technology | Why |
|---|---|---|
| Framework | **React 19** | Component model, hooks, fast updates |
| Language | **TypeScript** | End-to-end type safety between API and UI |
| Build tool | **Vite** | Sub-second HMR, native ESM |
| Testing | **Vitest + Testing Library** | Same toolchain as Vite, DOM testing |

---

## Getting started

### Prerequisites

- Python 3.10+ with [pyenv](https://github.com/pyenv/pyenv) (optional but recommended)
- Node.js 20+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Clone the repository

```bash
git clone https://github.com/DavRengifo/llm-saas-copilot.git
cd llm-saas-copilot
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in:
#   OPENAI_API_KEY=sk-...
#   API_SECRET_KEY=choose-a-secret-key
```

Start the development server:

```bash
uvicorn main:app --reload
# API is live at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### 3. Frontend setup

```bash
cd frontend
npm install

# (Optional) Create a .env.local to pre-fill the API key
echo "VITE_API_KEY=your-api-secret-key" > .env.local

npm run dev
# App is live at http://localhost:5173
```

---

## API reference

All endpoints under `/analyze` require the `X-API-Key` header.

### `GET /health`
Returns server status. No authentication required.

```json
{ "status": "ok", "version": "1.0.0", "model": "gpt-4o-mini" }
```

---

### `POST /analyze/feedback`

Analyzes customer feedback verbatims.

**Request**
```json
{
  "text": "The app crashes and support never responds. New features are great though.",
  "language": "en"
}
```
`language`: `"en"` | `"fr"` | `"es"` (default: `"en"`)

**Response**
```json
{
  "themes": ["app stability", "customer support", "new features"],
  "sentiment": "mixed",
  "priority_issues": ["frequent crashes", "support response time"],
  "executive_summary": "Users value recent features but are blocked by stability issues..."
}
```

---

### `POST /analyze/document`

Summarizes a document or meeting notes.

**Request**
```json
{
  "text": "Meeting with eng team. We agreed to migrate to PostgreSQL...",
  "output_format": "structured"
}
```
`output_format`: `"structured"` (default) | `"bullets"`

**Response**
```json
{
  "key_points": ["database migration discussed", "performance is the main concern"],
  "decisions": ["migrate to PostgreSQL"],
  "actions": ["John to update the schema by Monday"],
  "summary": "The team aligned on a PostgreSQL migration driven by performance needs."
}
```

---

### `POST /analyze/extract`

Extracts structured entities from any text.

**Request**
```json
{
  "text": "Alice sold 50 units on March 3rd for $12,500.",
  "extract_fields": ["dates", "names", "amounts"]
}
```
`extract_fields`: any non-empty subset of `["dates", "names", "amounts"]`

**Response**
```json
{
  "extracted_data": {
    "dates": ["March 3rd"],
    "names": ["Alice"],
    "amounts": ["50 units", "$12,500"]
  }
}
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | Your OpenAI secret key |
| `OPENAI_MODEL` | Optional | Model name (default: `gpt-4o-mini`) |
| `APP_ENV` | Optional | `development` or `production` |
| `API_SECRET_KEY` | ✅ | Secret key clients must send as `X-API-Key` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_KEY` | Optional | Pre-fills the API key in the UI |
| `VITE_API_URL` | Optional | Backend URL (default: proxied to `localhost:8000`) |

---

## Running tests

### Backend

```bash
cd backend
python -m pytest tests/ -v
# 20 tests: health, auth, feedback, document, extract
```

### Frontend

```bash
cd frontend
npm test
# 26 tests: App, FeedbackAnalyzer, DocumentAnalyzer, ExtractAnalyzer
```

---

## Security & cost controls

Three layers of protection are implemented to prevent abuse and unexpected OpenAI bills:

| Layer | Mechanism | Value |
|---|---|---|
| **Input limit** | Pydantic `max_length` on all text fields | 50 000 chars (~15 pages) |
| **Output limit** | `max_tokens` on every OpenAI call | 1 500 tokens |
| **Rate limiting** | `slowapi` — per IP, applies to all `/analyze` routes | 20 requests/minute |

**Recommended: set a monthly spend limit in your OpenAI project** (Settings → Limits → Edit spend limit). This is the safest backstop — OpenAI stops accepting requests once the cap is reached, regardless of what the code does. A $10/month cap is more than sufficient for a portfolio project.

---

## Deployment

### Frontend → Vercel

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com), set root directory to `frontend`
3. Add `VITE_API_KEY` and `VITE_API_URL` as environment variables

### Backend → Any Python host

The backend is a standard ASGI app. It can be deployed to:
- **Railway / Render** — zero-config Python deployments
- **Fly.io** — Docker-based, global edge
- **AWS Lambda** — with `mangum` adapter
- **Self-hosted** — `uvicorn main:app --host 0.0.0.0 --port 8000`

Set `OPENAI_API_KEY` and `API_SECRET_KEY` as environment variables on your host.

---

## Roadmap

- [ ] User authentication (JWT / OAuth)
- [ ] Usage tracking & rate limiting per user
- [ ] Streaming responses for long documents
- [ ] History & saved results
- [ ] Batch processing endpoint
- [ ] Webhook support
- [ ] Additional LLM providers (Anthropic, Mistral)

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Run the test suites before committing
4. Open a pull request — describe what you changed and why

---

## License

MIT — see [LICENSE](LICENSE) for details.
