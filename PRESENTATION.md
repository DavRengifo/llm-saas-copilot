# LLM Copilot — Project Presentation

> For: CEO · Dev Team · Lead Developer · Non-technical stakeholders  
> Version: 1.0 · June 2026

---

## Table of contents

1. [What is LLM Copilot? *(for everyone)*](#1-what-is-llm-copilot)
2. [The problem we're solving *(for CEO and business)*](#2-the-problem-were-solving)
3. [What the product does *(for everyone, with examples)*](#3-what-the-product-does)
4. [Who is it for?](#4-who-is-it-for)
5. [How it works — simple version *(for non-technical)*](#5-how-it-works--simple-version)
6. [How it works — technical version *(for dev team and lead dev)*](#6-how-it-works--technical-version)
7. [Architecture decisions *(for lead dev)*](#7-architecture-decisions)
8. [Current state & what's done](#8-current-state--whats-done)
9. [Roadmap](#9-roadmap)
10. [How to extend the product *(for dev team)*](#10-how-to-extend-the-product)
11. [Questions & discussion](#11-questions--discussion)

---

## 1. What is LLM Copilot?

**The one-sentence version:**
LLM Copilot is a web application that takes any piece of text you give it and instantly transforms it into clean, structured, actionable information — using artificial intelligence.

**The slightly longer version:**
You paste text in. You get structured data out. That's it.

Whether it's a pile of customer complaints, a two-hour meeting transcript, or a contract full of dates and numbers — the application reads it, understands it, and gives you back exactly what you need: key points, decisions, themes, action items, entities. In two to three seconds.

No ChatGPT tab. No copy-pasting. No manual extraction. Just reliable, repeatable, structured intelligence accessible via a clean web interface or directly through an API that any tool or developer can call.

---

## 2. The problem we're solving

### For the CEO

Time is the most expensive resource in any company. Right now, across your organization, intelligent people are spending hours doing work that should take seconds:

- A Customer Success manager reads 200 customer reviews to write a summary for a product meeting. That's two hours of skilled labor.
- A team lead rewrites meeting notes into a structured format after every sync. That's 30 minutes per meeting, every day.
- An operations analyst manually copies dates and amounts from contracts into a spreadsheet. That's an entire afternoon.

**These tasks share a common pattern:** they take raw, unstructured text and turn it into structured information. This is exactly what large language models are exceptionally good at — and exactly what LLM Copilot automates.

### The opportunity

The global AI SaaS market is growing at 35%+ year-over-year. The highest-value applications are not general chatbots — they are **vertical, task-specific tools** that solve a concrete workflow problem and integrate into existing systems via API.

LLM Copilot is built to be exactly that: a focused, API-first, task-specific AI processing layer that can be:
- Used standalone via the web interface
- Embedded into any existing tool via the REST API
- Extended with new analysis types as new use cases emerge

### The economics

| Task | Human time | LLM Copilot time | Cost at scale |
|---|---|---|---|
| Analyze 50 customer reviews | ~2 hours | ~3 seconds | ~$0.01 |
| Summarize a 30-min meeting | ~20 minutes | ~2 seconds | ~$0.005 |
| Extract entities from 10 contracts | ~1 hour | ~5 seconds | ~$0.03 |

The underlying model (`gpt-4o-mini`) costs a fraction of a cent per request. The value delivered per request is measured in hours of human time saved.

---

## 3. What the product does

The application has three core analysis capabilities, accessible through a tabbed web interface and a REST API.

### 3.1 — Feedback Analysis

**What it is:** Give it raw customer feedback (reviews, NPS comments, support tickets, verbatims). It returns structured intelligence.

**What you get back:**
- **Themes** — the main topics your customers are talking about (e.g. "app performance", "onboarding", "pricing")
- **Overall sentiment** — Positive / Negative / Mixed
- **Priority issues** — ranked by frequency and business impact
- **Executive summary** — 2–3 sentences, written for a product director, with a recommendation

**Example input:**
> "The app crashes every time I try to export. Support told me to wait 2 weeks. On the plus side, the new dashboard is beautiful."

**Example output:**
```
Themes:         app stability, customer support, UI improvements
Sentiment:      Mixed
Priority issues: export crashes blocking core workflow, support SLA too long
Summary:        Users are experiencing critical export failures that block their
                core use case. Support response time is amplifying frustration.
                Prioritize the export bug fix before shipping further UI work.
```

**Who benefits:** Product teams, Customer Success, CX analysts, Head of Product, CEO wanting a weekly digest.

---

### 3.2 — Document & Meeting Summary

**What it is:** Paste any document — a meeting transcript, a design doc, a Slack thread, a report — and get it broken down into a usable structure.

**What you get back:**
- **Key points** — the main ideas or facts discussed
- **Decisions** — explicit conclusions or agreements reached
- **Action items** — tasks assigned, with owners and deadlines when mentioned
- **Summary** — a 2–4 sentence neutral paragraph

**Example input:**
> "Team call. We agreed to migrate to PostgreSQL for performance. John will update the schema by next Monday. Main concern was index design — Sarah to research and propose by end of week."

**Example output:**
```
Key points:     database performance bottleneck identified, PostgreSQL proposed
Decisions:      migrate from current database to PostgreSQL
Actions:        John → update schema by Monday / Sarah → index strategy proposal by Friday
Summary:        The team committed to a PostgreSQL migration driven by performance
                needs. Two parallel workstreams were assigned with clear owners
                and deadlines this week.
```

**Who benefits:** Team leads, project managers, anyone who runs or attends recurring meetings, executives who need TLDRs of long documents.

---

### 3.3 — Entity Extraction

**What it is:** Pull specific types of structured data out of any unstructured text.

**What you get back** (you choose which):
- **Dates** — all temporal references ("March 3rd", "end of Q2", "next Tuesday")
- **Names** — people, companies, organizations, products
- **Amounts** — monetary values, quantities, percentages (with units preserved)

**Example input:**
> "Alice signed the contract with Acme Corp on February 12th for $45,000. The project kicks off March 1st and delivers 200 units by Q3."

**Example output (requesting all three):**
```
Dates:    February 12th / March 1st / Q3
Names:    Alice / Acme Corp
Amounts:  $45,000 / 200 units
```

**Who benefits:** Legal, finance, sales operations, anyone who processes contracts, invoices, emails or any structured-data-in-text situations.

---

## 4. Who is it for?

| Persona | How they use it |
|---|---|
| **Product Manager** | Paste monthly customer feedback → get a prioritized brief for the roadmap meeting |
| **Team Lead** | Paste meeting notes → get action items with owners, ready to paste into Jira |
| **Sales Operations** | Paste contract text → extract all dates and amounts into a spreadsheet |
| **Developer / integrator** | Call the API directly from an internal tool, CRM, or data pipeline |
| **Customer Success** | Weekly digest of NPS comments → structured themes and executive summary |
| **Executive / CEO** | Ask a team member to run a document through Copilot before any briefing |

---

## 5. How it works — simple version

*(This section is for non-technical readers)*

Think of LLM Copilot as a very smart assistant who has read millions of books, documents, and conversations. When you give it text to analyze, here is what happens:

**Step 1 — You paste your text**
You open the web app (or call the API), enter your text, and choose the type of analysis you want.

**Step 2 — The app gives instructions to the AI**
Behind the scenes, the app prepares a very specific, structured set of instructions — called a "prompt" — that tells the AI model exactly what to do. It's like briefing a consultant: "Here is the text. Your job is to extract themes, classify the sentiment, and write an executive summary. Return only a structured list, nothing else."

**Step 3 — The AI reads and thinks**
The app sends your text and those instructions to OpenAI's servers (the same company that makes ChatGPT). Their AI model — a specialized version optimized for instruction-following — processes the text and responds with a structured answer.

**Step 4 — The app validates and displays**
Before showing you anything, the app checks that the AI's answer is in the exact right format. If the AI went off-script, the app rejects it and returns a clear error. If everything looks right, the structured result is displayed in the interface.

The whole process takes 2–4 seconds.

**Is the data safe?** Your text is sent to OpenAI's API over an encrypted connection, processed, and not stored for training (with the appropriate API plan). The app itself is secured with an API key — only callers who have the key can use it.

---

## 6. How it works — technical version

*(This section is for developers and the lead developer)*

### Request lifecycle

```
Client (browser or API caller)
  │
  │  POST /analyze/feedback
  │  Headers: X-API-Key: <secret>
  │  Body: { "text": "...", "language": "en" }
  │
  ▼
FastAPI (Python, Uvicorn ASGI server)
  │
  ├─ Dependency: verify_api_key()
  │    Reads X-API-Key header
  │    Compares against API_SECRET_KEY env var
  │    Returns 401 if mismatch, 422 if missing
  │
  ├─ Pydantic validation (FeedbackRequest)
  │    Validates text: str
  │    Validates language: Literal["en", "fr", "es"]
  │    Returns 422 on schema violation
  │
  ├─ build_user_message(text, language)
  │    Injects language instruction prefix
  │    Appends raw text
  │
  ├─ call_llm(SYSTEM_PROMPT, user_message)
  │    OpenAI client.chat.completions.create()
  │    model = OPENAI_MODEL env var
  │    temperature = 0.3
  │    Returns raw string content
  │
  ├─ json.loads(llm_response)
  │    Parses LLM output as JSON
  │    Raises HTTP 422 on parse failure
  │
  ├─ FeedbackResponse(**data)
  │    Pydantic validation of LLM output
  │    Ensures schema compliance (types, literals, etc.)
  │
  └─ Returns typed JSON response
```

### Prompt engineering approach

Each analysis type has a dedicated prompt module in `backend/prompts/`. The pattern is consistent:

1. **System prompt** — defines the AI's persona and role, enforces strict JSON-only output, specifies the exact schema with typed fields, includes rules and a worked example.
2. **User message builder** — function that prepends contextual instructions (language, output format, requested fields) to the raw input text.

The strict "JSON only, no markdown, no text before or after" instruction in every system prompt is what makes reliable parsing possible. At temperature 0.3, the model rarely deviates.

### Why JSON output instead of streaming text?

This is a deliberate architectural decision. Streaming text is great for conversational UX but terrible for structured data pipelines:
- You cannot validate a partial response
- Downstream consumers (React UI, API callers, databases) need typed objects, not prose
- A failed parse surfaces immediately as a 422 with a clear error message rather than silently corrupting data

### Authentication model

The current auth model is intentionally simple: a single shared secret (`API_SECRET_KEY`) validated on every request via a FastAPI dependency. This is the right choice for an MVP because:
- Zero infrastructure overhead (no auth service, no token store)
- Easy to rotate (change the env var, redeploy)
- Trivially upgradeable to per-user API keys or JWT later

### Frontend architecture

The frontend is a React 19 + TypeScript app built with Vite. Key decisions:

**No HTTP library.** Native `fetch` is sufficient — the API is simple, CORS is configured, and adding axios/ky would be pure overhead.

**No state management library.** Each analyzer component manages its own local state (`text`, `result`, `error`, `loading`). There is no shared state between tabs that would justify a global store.

**Typed API client.** `src/api/client.ts` is a single file that owns all `fetch` calls and returns typed responses. Components don't touch `fetch` directly — this makes mocking in tests trivial.

**API key in localStorage.** The key is stored in `localStorage` (readable via the header widget) and injected into every request. This is appropriate for a dev/internal tool; a production multi-tenant app would use session cookies or a proper auth flow.

### Test strategy

**Backend** — 19 tests in pytest using FastAPI's `TestClient` (synchronous, no async setup needed). The OpenAI client is mocked at the module level using `unittest.mock.patch`. Tests cover: health endpoint, auth (missing key, wrong key, valid key), all three analysis routes (success, invalid input, invalid LLM output).

**Frontend** — 15 tests in Vitest + Testing Library. `fetch` is stubbed with `vi.stubGlobal`. Tests cover: tab navigation, form states (empty/filled/submitted), success path (rendered results), error path (rendered error message), accessibility attributes.

---

## 7. Architecture decisions

*(Primarily for the lead developer)*

### What we chose and why

| Decision | Choice | Rationale |
|---|---|---|
| Web framework | FastAPI | Native async, Pydantic integration, automatic OpenAPI docs at `/docs` — zero boilerplate for a JSON API |
| Validation library | Pydantic v2 | Used for both request input AND LLM output validation. One schema, two uses. |
| LLM provider | OpenAI SDK | Best instruction-following performance for structured output tasks. `gpt-4o-mini` hits the price/quality sweet spot |
| Output parsing | `json.loads` + Pydantic | Simple and reliable. No LLM framework (LangChain etc.) — those add complexity without value for deterministic, non-agentic tasks |
| Temperature | 0.3 | Lower = more deterministic = more stable JSON. We don't want creativity, we want consistency |
| Frontend build tool | Vite | Sub-second HMR, native ESM, Vitest built-in. No reason to use Create React App or webpack |
| Testing | pytest + Vitest/RTL | Standard, well-documented, minimal setup. No snapshot tests — those are fragile for a rapidly evolving UI |
| Auth | Shared API key | Right level of complexity for the current stage. See upgrade path below |

### What we deliberately did NOT do

- **No LangChain / LlamaIndex.** These frameworks are valuable for RAG pipelines and agent loops. For deterministic prompt → JSON output, they add abstraction overhead with no benefit.
- **No streaming.** Streaming is great for chat UX; it's inappropriate when you need to validate a complete structured object before rendering anything.
- **No ORM / database.** Nothing to persist yet. When we add history, user accounts, or usage tracking, we'll add a database then — not before.
- **No CSS framework.** Tailwind, Bootstrap, etc. would have been faster to scaffold but harder to own. The current CSS is ~300 lines and completely understood. No purge configuration, no dependency on a design system we don't control.

### Extensibility points

The architecture is designed to make adding new analysis types a 4-file change:

1. Add request/response models to `backend/models/schemas.py`
2. Create a prompt module in `backend/prompts/`
3. Add a route to `backend/routers/analyze.py`
4. Create a new `*Analyzer.tsx` component in the frontend

No changes to `main.py`, no changes to `llm_service.py`, no changes to auth.

### Upgrade paths when we scale

| Current | When to upgrade | To what |
|---|---|---|
| Shared API key | When we have multiple users/tenants | JWT + user table, or OAuth (Clerk, Auth0) |
| No database | When we add history, usage tracking | PostgreSQL + SQLAlchemy or Prisma |
| Single model | When we need cost/quality tradeoffs | Model selector per request, or fine-tuned model |
| Single backend | When we hit throughput limits | Background job queue (Celery/Redis) for long documents |
| Sync LLM call | When documents get long (>5k tokens) | Streaming endpoint + Server-Sent Events to frontend |

---

## 8. Current state & what's done

As of June 2026, the application is **fully functional** end-to-end:

### Backend ✅
- [x] `POST /analyze/feedback` — sentiment, themes, priority issues, executive summary
- [x] `POST /analyze/document` — key points, decisions, actions, summary
- [x] `POST /analyze/extract` — entity extraction (dates, names, amounts)
- [x] `GET /health` — public health check
- [x] API key authentication on all analysis endpoints
- [x] Pydantic v2 validation on all inputs AND LLM outputs
- [x] Multilingual support (EN / FR / ES)
- [x] 19 backend tests — all passing

### Frontend ✅
- [x] Tabbed interface for all three analysis tools
- [x] Character counter on text inputs
- [x] Language / format / field selectors per tool
- [x] Loading state with animated spinner
- [x] Animated result cards with color-coded sections
- [x] Sentiment badge (color-coded: green/red/amber)
- [x] Copy-to-clipboard on summaries
- [x] API key widget with show/hide toggle and status indicator
- [x] Error display with inline error banner
- [x] Responsive design (mobile + desktop)
- [x] 15 frontend tests — all passing

### Infrastructure ✅
- [x] Vite dev server with proxy to backend (`/analyze` → `localhost:8000`)
- [x] TypeScript — zero errors
- [x] `.env.example` with all required variables documented

---

## 9. Roadmap

### Phase 2 — User & multi-tenancy (next)
- User registration and login (JWT or OAuth)
- Per-user API keys with usage tracking
- Rate limiting and usage quotas
- Dashboard showing analysis history

### Phase 3 — Scale & quality
- Streaming responses for long documents (Server-Sent Events)
- Batch processing endpoint (array of texts → array of results)
- Confidence scores on extracted entities
- Human feedback loop (thumbs up/down on results → fine-tuning data)

### Phase 4 — Integrations
- Zapier / Make integration (no-code automation)
- Slack bot — paste text in a channel, get structured summary in thread
- Google Docs / Notion add-on
- Webhooks for async processing of large documents

### Phase 5 — Platform
- Custom prompt templates (users define their own analysis schema)
- Multi-model support (Anthropic Claude, Mistral, local models via Ollama)
- White-label (custom branding, custom domain)
- Enterprise SSO

---

## 10. How to extend the product

*(For the dev team — practical onboarding)*

### Adding a new analysis type in 30 minutes

Let's say we want to add `POST /analyze/tone` — a tone analysis endpoint that returns formality, emotion, and audience suitability.

**Step 1 — Add schemas** (`backend/models/schemas.py`)
```python
class ToneRequest(BaseModel):
    text: str

class ToneResponse(BaseModel):
    formality: Literal["formal", "casual", "mixed"]
    emotion: Literal["neutral", "positive", "frustrated", "urgent"]
    audience: list[str]  # e.g. ["executives", "general public"]
    recommendation: str
```

**Step 2 — Write the prompt** (`backend/prompts/tone_analysis.py`)
```python
SYSTEM_PROMPT = """You are a communications expert...
You MUST respond ONLY with a valid JSON object following this schema:
{ "formality": "...", "emotion": "...", "audience": [...], "recommendation": "..." }
"""

def build_user_message(text: str) -> str:
    return f"Analyze the tone of this text:\n\n{text}"
```

**Step 3 — Add the route** (`backend/routers/analyze.py`)
```python
from models.schemas import ToneRequest, ToneResponse
from prompts.tone_analysis import SYSTEM_PROMPT as TONE_PROMPT, build_user_message as tone_msg

@router.post("/tone", response_model=ToneResponse)
def analyze_tone(request: ToneRequest) -> ToneResponse:
    return _parse_llm_response(call_llm(TONE_PROMPT, tone_msg(request.text)), ToneResponse)
```

**Step 4 — Add the frontend component** (`frontend/src/components/ToneAnalyzer.tsx`)
Follow the same pattern as `FeedbackAnalyzer.tsx` — local state, form, `api.analyzeTone()` call, result card.

**Step 5 — Write tests** — add to `backend/tests/test_analyze.py` and `frontend/src/test/ToneAnalyzer.test.tsx`.

That's it. The auth, the LLM client, the CORS config, the TypeScript types — all unchanged.

### Development workflow

```bash
# Backend
cd backend
source .venv/bin/activate
uvicorn main:app --reload        # hot reload on file save
python -m pytest tests/ -v       # run all tests

# Frontend
cd frontend
npm run dev                      # HMR on http://localhost:5173
npm test                         # run all tests
npx tsc --noEmit                 # type check only
```

### Key files to know

| File | What it does |
|---|---|
| `backend/main.py` | App entry point, CORS, router inclusion |
| `backend/routers/analyze.py` | All three analysis routes |
| `backend/models/schemas.py` | All Pydantic schemas (add new ones here) |
| `backend/dependencies.py` | Auth dependency — applied at router level |
| `backend/services/llm_service.py` | Single OpenAI call wrapper |
| `frontend/src/api/client.ts` | All fetch calls, typed (add new endpoints here) |
| `frontend/src/types.ts` | TypeScript interfaces mirroring backend schemas |
| `frontend/src/App.tsx` | Tab navigation — add new tabs here |

---

## 11. Questions & discussion

Some open questions worth discussing as a team:

**1. Hosting strategy**
The frontend deploys naturally to Vercel (static build). For the backend, the main options are Railway, Render, or Fly.io for simplicity; or a containerized deploy on any VPS/cloud if you want more control. Which environment do we target first?

**2. Model selection**
The current default is the model set in the `.env` config. As we scale, do we want per-endpoint model selection (e.g. a cheaper model for extraction, a smarter one for executive summaries)?

**3. Multi-tenancy timing**
The API key auth is a shared secret right now. Is there a concrete date when we expect multiple users/clients? That determines when to prioritize the auth upgrade.

**4. Data retention**
Currently, no data is persisted anywhere in this application. When do we need analysis history? That's when we introduce a database.

**5. Which integration to build first?**
Zapier (broadest reach, no-code users), Slack bot (internal power users), or Google Docs add-on (document workflow users)?

---

*Prepared by: Development Team · June 2026*  
*Repository: [github.com/DavRengifo/llm-saas-copilot](https://github.com/DavRengifo/llm-saas-copilot)*
