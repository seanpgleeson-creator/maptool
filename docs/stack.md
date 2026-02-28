# MAPtool — Stack (MVP)

This project is designed to ship quickly on **GitHub + Vercel**, and be testable on the **Vercel production URL** after each feature slice.

## Frontend / app framework

- **Next.js (App Router)** on Vercel
- **TypeScript**

## Backend (API)

- **Next.js Route Handlers** (`app/api/**/route.ts`) for the MVP API.
- Assessment API runs policy extraction, competitor price lookup (Walmart), and policy AI in sequence; see `docs/todo.md` for phased work (e.g. bulk, cache).

## Database

- **Postgres** (recommended: **Vercel Postgres** for simplest production testing)
- `DATABASE_URL` is required in production.

## File storage (policies, bulk uploads)

- Preferred for MVP on Vercel: **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`)
- Alternative later: S3-compatible object storage.

## AI provider

- Policy review uses an LLM API (placeholder env: `OPENAI_API_KEY`).

## Competitor prices (current)

- **Walmart:** Implemented in `lib/walmart.ts`. For each UPC we fetch Walmart search results, parse price when possible, and always store a **listing URL** (Walmart search for that UPC). Results are stored in `CompetitorPrice` (price, listingUrl, errorMessage). The UI shows price (or “Unavailable”) and a “View product →” link.
- **Amazon:** Placeholder “Coming soon”; no fetch yet. The UI shows “Amazon — Coming soon.”
- Scraping/lookup runs inside the assessment API (same request); partial failure is handled (e.g. price null + link still shown).
- Walmart fetch can be blocked or fail; the product handles partial results (listing URL still shown when price is unavailable). See `docs/backend.md` and `docs/ui.md`.

