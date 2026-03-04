# CLAUDE.md — Project Instructions

> Claude reads this file at the start of every session. Update it regularly to reflect the current state of the project.

---

## Project Overview

**What this app does:**
MAPtool helps merchants in retail organizations decide whether to discuss a vendor’s MAP (Minimum Advertised Price) policy and values or to proceed. The app accepts a UPC, MAP price, and vendor MAP policy (PDF/Word), checks competitor prices (Walmart live; Amazon coming soon), reviews the policy with AI for applicability and consequences, and recommends “Discuss with vendor” or “Proceed” with reasons.

**Who it's for:**
Merchants in retail organizations who receive MAP policies from vendors and need to assess competitiveness, policy fairness, and enforcement before committing.

**Current stage:** MVP — avoid over-engineering. Build only what is needed for core functionality. Single-item flow is live; bulk flow is not yet built.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript — always use TypeScript, never plain JavaScript
- **Styling:** Inline styles (no Tailwind in current MVP)
- **Database:** Postgres (Neon); Prisma ORM
- **File storage:** Vercel Blob (policy uploads)
- **Hosting:** Vercel
- **Version Control:** GitHub

Do not suggest tools or libraries outside of this stack without asking first.

---

## How to Work With Me

- I am non-technical. Before making any significant change, summarize what you are about to do in plain English and wait for my approval.
- Break down complex tasks into small, sequential steps.
- If something could be done multiple ways, briefly explain the options and recommend one.
- Flag anything that seems risky or irreversible before proceeding.

---

## Hard Rules

- **Never** expose API keys or secrets in frontend code
- **Never** delete database tables or make destructive database changes without explicit confirmation
- **Never** install a new package without explaining what it does and why it's needed
- **Never** make large sweeping changes across multiple files at once — change one thing at a time
- Always use **TypeScript**
- Always use **async/await** (not .then())
- Keep components small and single-purpose

---

## Git & Deployment Workflow

- After each working feature is complete, remind me to commit with a descriptive commit message
- Use GitHub CLI to push changes to the `main` branch
- Every push to `main` triggers a Vercel deployment automatically
- We are **testing in production** on the Vercel URL

---

## Development Approach

- Use **feature-driven development** — complete and test one feature fully before starting the next
- After completing a task, update `todo.md` with what was finished and what comes next
- Call out any tasks in `todo.md` that can be worked on in parallel

---

## Code Quality Standards

Periodically review the codebase and flag any of the following:

- **Code duplication** — repeated logic that should be a reusable function or component
- **Missing error handling** — places where errors could fail silently
- **Security issues** — exposed keys, unsanitized inputs, or other vulnerabilities
- **Dead code** — unused variables, functions, or imports
- **Unclear naming** — variables or functions that don't clearly describe what they do
- **Structural issues** — files or folders that are poorly organized

---

## Session Continuity

At the end of every session:
1. Update this file (`CLAUDE.md`) with what was completed and what the next steps are
2. Update `todo.md` accordingly
3. Remind me to commit all changes before closing

At the start of a new session, read this file and pick up where we left off.

> If this file exceeds ~40k characters, compress older notes and archive them to `/docs/claude_archive.md`

---

## Known Project-Specific Notes

- **Walmart prices:** When `SCRAPINGDOG_API_KEY` is set, the app uses ScrapingDog + UPCitemdb (Option D): fetches UPCitemdb product page, parses Shopping Info table for Walmart price/link. See `docs/walmart-price-sources.md`. For local dev, use `.env.local` in project root (same folder as `package.json`) and restart `npm run dev` — root `.env` is not always loaded by Next.js.
- **Policy analysis:** LLM returns applicability, segment, consequences (specific/summary), severity (high/medium/low), timeline. We do **not** derive “vendor response/supply risks” from the policy; that is reserved for a future **Fulfillment & enforcement context** section (Target fulfillment history, inventory/MAP enforcement).
- **Consequences framing:** We support strict consequences when the vendor applies them uniformly. When recommendation is Discuss and the policy has specific consequences, copy emphasizes that the user should ask the vendor for uniform and consistent enforcement — not to challenge the consequences (they are good if materially punitive) but because they are only effective if actually enforced.
- **API/Client:** Assessment API serializes Prisma `Decimal` (map_price, price) as strings in JSON to avoid “Objects are not valid as a React child.” Results client uses `formatPrice()` and guards `competitor_prices` and `recommendation.reasons` (default to `[]`, `Array.isArray` before map).

---

## Current Status

**Last updated:** 2026-03-02 (session review)
**Last completed:** Consequences follow-up copy (emphasize uniform enforcement when Discuss + specific consequences); client-side exception fixes (formatPrice, Decimal serialization, safe arrays); Section 8 next-priority features (disclaimer, MAP vs Walmart flag, policy severity/timeline, Fulfillment & enforcement context placeholder, vendor history placeholder); policy reframe (support strict when uniform; remove vendorResponseSupplyRisks from policy analysis).
**Next up:** Bulk flow (Phase 6) when ready; or polish (progress messages, security/rate limiting, accessibility). See `docs/todo.md` Section 6–9.
