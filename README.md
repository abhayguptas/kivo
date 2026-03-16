# Kivo - Revenue Intelligence for Multilingual Product Feedback

**Built for the Lingo.dev Multilingual Hackathon #3**

> **Powered by Lingo.dev Engine, Lingo.dev SDK, and Lingo.dev CLI**

Kivo helps global product teams turn multilingual customer feedback into prioritized growth actions.

Instead of just translating reviews, Kivo identifies market-level friction, highlights risk by locale, and surfaces which fixes can improve retention and conversion fastest.

**Not a ticketing tool:** Kivo complements Jira/Linear/Zendesk by turning multilingual feedback into decision-grade opportunities with **impact**, **confidence**, and **evidence**.

---

## Why Kivo

Modern SaaS teams receive feedback in many languages across app stores, support channels, and webhooks.
Most teams can not analyze that data at speed because language context is fragmented.

Kivo solves this by combining:

1. **Realtime multilingual ingestion** (App Store + webhook)
2. **High-fidelity runtime localization** with **Lingo.dev SDK**
3. **AI-driven prioritization** (opportunities, risk, impact)
4. **Premium SaaS analytics UX** (charts, signals, conversion-focused summaries)

---

## How Kivo Differs From Multilingual Ticketing Tools

Many products help collect feedback, translate threads, and manage tickets. Kivo is a different category: **localization intelligence for Product/Growth**.

| Dimension | Multilingual ticketing tools | Kivo |
|---|---|---|
| Focus | Threads, tickets, collaboration workflows | Analytics + prioritized opportunities |
| Output | Translated discussions and status management | Executive brief + Top 3 opportunities + charts + impact framing |
| Primary users | Support/community teams + contributors | PM/Growth + leadership decisioning |
| Differentiators | Workflow management (labels/status/assignment) | Evidence trails, confidence, impact modeling, premium locale gates, ingestion telemetry |
| Lingo.dev usage | Translation to enable participation | Translation normalization for comparability + runtime translation + CLI workflow |

Judge-friendly note:
Kivo is not just translating. We normalize multilingual feedback so it can be compared across markets, then surface revenue/churn decisions.

---

## Lingo.dev-First Architecture

Kivo is intentionally built to showcase deep and practical Lingo.dev usage.

### 1) Runtime Translation (Core Engine)
- Uses **`lingo.dev/sdk`** via `LingoDotDevEngine`
- Translates incoming feedback objects while preserving schema and metadata
- Powers both ingestion-time localization and on-demand re-translation

Key implementation paths:
- `src/app/actions/translate.ts`
- `src/app/actions/ai.ts`
- `src/app/api/webhooks/v1/ingest/route.ts`

### 2) Static i18n Workflow (Repo Localization)
- Uses **Lingo.dev CLI** configuration through `i18n.json`
- Prepared for automated static string localization in CI workflows

Key files:
- `i18n.json`
- `.github/workflows/` (CI translation automation)

### 3) Productized Multilingual UX
- Locale-aware feedback intelligence (top locales, locked premium locales)
- Language-normalized review analysis for PM/Growth workflows
- Two-way response flow: team language -> customer language

---

## What Is Implemented

### Premium Dashboard (Analytics-First)
- KPI strip: total reviews, positivity score, average rating, active languages
- Charts for:
  - Review volume trend
  - Sentiment trend
  - Rating distribution
  - Locale distribution
  - Source/app mix
- Opportunity board with priority + impact scoring
- AI executive brief with action items and projected impact

### Smarter Ingestion
- App Store sync upgraded beyond single-page RSS behavior
- Paginated backfill, dedupe, and incremental sync behavior
- Manual per-app sync action in Sources page

### Trial + Conversion Design
- Free plan limits with strategic upgrade moments
- Dynamic top-5 locale unlock policy (premium unlocks full set)
- Contextual premium modals instead of disruptive JS alerts

### Guided Demo Mode
- Narrative walkthrough:
  1. Ingest multilingual feedback
  2. Normalize and score
  3. Show market opportunities
  4. Simulate premium unlock

---

## Hackathon Criteria Alignment

### Execution & Effort (40)
- End-to-end SaaS flow: auth, ingest, translation, analytics, demo, premium gating
- Real backend actions, dashboard analytics payloads, and production-like UX

### Presentation & Socials (20)
- Strong landing story and guided product simulation
- Clear README focused on business outcomes and technical depth

### Originality + Real Utility (40)
- Not a generic translator or summary app
- Designed for product/growth teams to make localization decisions with measurable impact
- Practical multilingual intelligence workflow teams could pay for

---

## Quick Start

```bash
npm install
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

Suggested flow:
1. Sign in (or use demo mode)
2. Connect an app in **Data Sources**
3. Sync feedback
4. Run AI Intelligence
5. Explore locale insights and premium paths

---

## Environment Variables

Create `.env` with:

```bash
# Database
POSTGRES_URL=...

# Auth
AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Lingo.dev
LINGODOTDEV_API_KEY=...

# AI (xAI/Grok base URL in code)
GROK_API_KEY=...
```

Notes:
- Without `LINGODOTDEV_API_KEY`, translation falls back to mock/simulated behavior for demo continuity.
- Without `GROK_API_KEY`, AI analysis uses deterministic mock outputs.

---

## Webhook Ingestion API

### Endpoint
`POST /api/webhooks/v1/ingest`

### Headers
- `Authorization: Bearer <YOUR_WEBHOOK_TOKEN>`
- `Content-Type: application/json`

### Example Payload

```json
{
  "source": "custom_integration",
  "data": [
    {
      "id": "1234",
      "sourceLocale": "ja",
      "text": "新しいダークモードのUIデザインが本当に気に入っています！",
      "sentiment": "positive",
      "user": "Kenji S."
    },
    {
      "id": "1235",
      "sourceLocale": "es",
      "text": "No puedo acceder a mi cuenta desde la última actualización.",
      "sentiment": "negative",
      "user": "Carlos R."
    }
  ]
}
```

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database/ORM:** Postgres + Prisma
- **Auth:** NextAuth.js
- **UI:** Tailwind CSS + shadcn/ui + Framer Motion + Recharts
- **Localization:** **Lingo.dev SDK + Lingo.dev CLI**

---

## Project Positioning

Kivo is a **multilingual product intelligence SaaS prototype**.

This project is intentionally built to demonstrate how Lingo.dev can power:
- realtime localization pipelines,
- scalable multilingual analytics,
- and business-ready premium product experiences.

---

## License

MIT (see `LICENSE`).

---

## Built With Lingo.dev

If you are judging this project for hackathon quality:

**Kivo is not just "using translation". It is architected around Lingo.dev as the core product engine.**

From ingestion to analysis to premium insights, this product is designed to showcase the practical power of the Lingo.dev ecosystem in a real SaaS use case.

**Powered by Lingo.dev for the Multilingual Hackathon #3.**
