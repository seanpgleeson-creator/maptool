# MAPtool MVP — Execution checklist

This checklist is **feature-driven**: work is ordered by user-facing capability (setup → single-item flow → competitor prices → policy AI → bulk → polish), not by layer. Use **GitHub** for the repo and **Vercel** for hosting; **test in production** (Vercel production URL) after each phase. Tasks that can be executed in parallel are marked **[PARALLEL]** with the contract (API/DB shape) so both tracks can proceed at once.

References: [prd.md](prd.md), [backend.md](backend.md), [ui.md](ui.md).

---

## 1. Repo and hosting (do first)

- [x] Ensure GitHub repo exists and local project is connected (git init, remote, first push).
- [x] Create Vercel project and link to GitHub repo; enable production deploys from `main` (and optional previews from PRs).
- [x] Add `.gitignore` (e.g. `.env`, `node_modules/`, `.vercel`, build outputs, OS files); add `.env.example` with placeholders (e.g. `DATABASE_URL`, `OPENAI_API_KEY`, storage keys).
- [x] Deploy a minimal placeholder (e.g. "MAPtool" landing page) to Vercel and confirm production URL works.

*Outcome:* Repo on GitHub, app on Vercel, production URL known; future work is "ship and test in production."

---

## 2. Stack and foundation

- [x] Choose and document stack: e.g. Next.js (or similar) for Vercel; DB (Postgres — Vercel Postgres, Neon, or Supabase); object storage (Vercel Blob or S3); background jobs (Vercel serverless background, QStash, or separate worker).
- [x] Implement data model (backend): Assessment, AssessmentItem, PolicyDocument, CompetitorPrice, PolicyAnalysis, Recommendation (per backend.md).
- [x] Add API skeleton: `POST /api/assessments` (single: UPC, map_price, policy file) returns `assessment_id`, `status: pending`; `GET /api/assessments/[id]` returns status and, when done, full result shape (stub/mock OK).
- [x] Add frontend skeleton: Home with "Single item" / "Bulk upload" choice; Single-item page with form (UPC, MAP price, policy file upload) and "Run assessment" CTA; Results page that accepts `assessment_id` (e.g. from query) and polls `GET /api/assessments/[id]` and shows status + placeholder result.

**[PARALLEL]** Backend: stack + DB schema + API routes **|** Frontend: Next.js app + Home + Single-item form + Results page (stub polling). Contract: API request/response shapes above.

- [ ] Deploy to Vercel; test in production: submit single-item form, see pending then stub result.

---

## 3. Single-item submission and storage

- [ ] Accept policy file in API (multipart); validate type (.doc, .pdf) and size (e.g. 10 MB); store file in object storage; create Assessment, AssessmentItem, PolicyDocument records.
- [ ] Policy text extraction: extract text from uploaded PDF and DOC (e.g. pdfplumber / PyMuPDF, mammoth or similar); store in PolicyDocument; handle extraction failure (still create assessment, policy section later shows "Could not read policy").
- [ ] Enqueue or invoke assessment job after create: job (for now) updates status to running then completed, optionally with mock competitor prices and mock policy analysis so the full result shape is present.
- [ ] Frontend: after submit, navigate to results page with `assessment_id`; show step-by-step progress (e.g. "Checking competitor prices…", "Reviewing policy…") — can be driven by status or a `step` field from API; show chat-like result sections (competitive prices, policy applicability, consequences, enforcement, next steps) with mock/stub content.

**[PARALLEL]** Backend: upload + extraction + job wiring **|** Frontend: navigation after submit + progress messages + result layout (chat-like blocks). Contract: GET response includes status and, when completed, items, competitor_prices, policy_analysis, recommendation.

- [ ] Deploy and test in production: upload real PDF; see progress and stub result.

---

## 4. Competitor prices (scraping)

- [ ] Implement scraper for Amazon (by UPC): fetch advertised price; handle timeouts and failures; optional cache keyed by UPC + source with TTL (e.g. Redis or KV).
- [ ] Implement scraper for Walmart (by UPC): same approach.
- [ ] Wire assessment job: after policy extraction, for each item fetch or use cached Amazon/Walmart price; store CompetitorPrice rows; compute per-item "MAP vs market" and competitiveness flag.
- [ ] API: ensure GET /api/assessments/[id] returns competitor prices and competitiveness; support partial results (e.g. one source unavailable → "Unavailable" in UI).
- [ ] Frontend: display competitive prices (MAP, Amazon, Walmart) and "Worth discussing" / "OK to proceed" per item; show "Unavailable" when a source failed; keep chat-like layout.

**[PARALLEL]** Backend: scrapers + job integration + cache **|** Frontend: competitive prices and per-item messaging in result view. Contract: CompetitorPrice shape and partial nulls.

- [ ] Deploy and test in production: run assessment with real UPC(s); verify prices (or graceful "Unavailable") and recommendation reflects competitiveness.

---

## 5. Policy analysis (AI) and recommendation

- [ ] LLM integration: structured prompt (policy text → applicability + segment description + consequences specific + consequences summary); structured output (JSON); store in PolicyAnalysis.
- [ ] Wire job: after competitor prices, run policy analysis once per assessment; compute enforcement signal (competitors at/above MAP); compute recommendation (discuss vs proceed) and reasons per prd.md F17.
- [ ] API: GET returns policy_analysis (applicability, segment, consequences, summary) and recommendation (action, reasons, per_item_summary if bulk).
- [ ] Frontend: result sections for Policy applicability, Policy consequences, Enforcement, Next steps (Discuss / Proceed + reasons); merchant language only; accessible headings.

**[PARALLEL]** Backend: LLM + enforcement + recommendation logic **|** Frontend: policy and next-steps blocks in result view. Contract: PolicyAnalysis and Recommendation fields.

- [ ] Deploy and test in production: run assessment with real policy doc; verify applicability, consequences, enforcement, and Discuss/Proceed with reasons.

---

## 6. Bulk flow

- [ ] API: `POST /api/assessments/bulk` — accept items file (CSV/Excel) + policy file; parse and validate rows (UPC, MAP price); create Assessment with multiple AssessmentItems; store files; enqueue same job type.
- [ ] Job: fan-out competitor price fetch per item; one policy analysis per run; aggregate recommendation and per_item_summary; store Recommendation with per_item_summary.
- [ ] Frontend: Bulk upload path — upload items file then policy file; optional column mapping/preview; "Run assessment" → results with table (UPC, MAP, Amazon, Walmart, Discuss?) and same chat-style overall summary and next steps.
- [ ] Handle many items: pagination or virtualized table; summary and recommendation always visible at top.

**[PARALLEL]** Backend: bulk endpoint + job fan-out + per_item_summary **|** Frontend: bulk upload UI + results table + summary. Contract: bulk payload and response shape.

- [ ] Deploy and test in production: bulk upload CSV + policy; verify table and recommendation.

---

## 7. Polish and production hardening

- [ ] Progress messages: backend exposes current step (e.g. "fetching_prices", "analyzing_policy") or frontend infers from status; show "Checking Amazon…", "Checking Walmart…", "Reviewing policy…".
- [ ] Error and edge cases: friendly messages (e.g. "We couldn't find this item on Amazon. Check the UPC or try again later."); partial results when policy extraction or AI fails; empty state for first-time user (ui.md).
- [ ] Security and ops: validate all file types and sizes; rate limiting on POST and GET; secrets in env (Vercel env vars); no executable uploads.
- [ ] Accessibility and responsive: keyboard-accessible uploads; headings in result sections; responsive layout (laptop and tablet).
- [ ] Final production test: run single-item and bulk flows end-to-end on Vercel production URL; confirm chat-like output, Discuss/Proceed, and partial failure behavior.

---

## 8. Optional / post-MVP

- [ ] History: list past assessments (date, outcome); optional for MVP (prd F31).
- [ ] Competitor price cache: Redis or KV with TTL to reduce scraping (prd F9).
- [ ] Auth: protect routes and scope assessments by user/org (post-MVP).

---

## Parallel work summary

| Phase | Parallel tracks |
| ----- | ---------------- |
| 2. Foundation | Backend (stack, DB, API) \| Frontend (app, form, results stub) |
| 3. Single-item E2E | Backend (upload, extraction, job) \| Frontend (navigation, progress, result layout) |
| 4. Competitor prices | Backend (scrapers, job, cache) \| Frontend (prices in result UI) |
| 5. Policy AI | Backend (LLM, recommendation) \| Frontend (policy + next-steps blocks) |
| 6. Bulk | Backend (bulk API, job fan-out) \| Frontend (bulk upload + table) |
