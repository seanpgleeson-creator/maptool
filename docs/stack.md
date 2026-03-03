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

- **Walmart:** Implemented in `lib/walmart.ts`. When **ScrapingDog** (`SCRAPINGDOG_API_KEY`) is set, the app uses **UPCitemdb** (Option D hybrid): ScrapingDog fetches the UPCitemdb product page; we parse the Shopping Info table for Walmart price and link. No Walmart search; works when UPCitemdb has a Walmart listing for the UPC. Otherwise direct scrape of Walmart search (fragile). See [docs/walmart-price-sources.md](walmart-price-sources.md). Results are stored in `CompetitorPrice` (price, listingUrl, errorMessage). The UI shows price (or “Unavailable”) and a “View product →” link.
- **Amazon:** Placeholder “Coming soon”; no fetch yet. The UI shows “Amazon — Coming soon.”
- Lookup runs inside the assessment API (same request); partial failure is handled (e.g. price null + link still shown).

### Next priority (user feedback)

See [capabilitiesexp.md](capabilitiesexp.md) for the full list.

- MVP disclaimer on every page.
- MAP vs market flag in results and recommendation.
- Policy analysis: severity + timeline for consequences. Consequences framed positively: we support strict consequences when applied uniformly.
- **Fulfillment & enforcement context (future):** Separate section (not from policy). Placeholder for Target's fulfillment history with the vendor; will highlight known inventory issues related to MAP enforcement. Context for deciding whether to follow MAP.
- Placeholder for vendor history (post-MVP).
- Bulk: competitive landscape view and Excel report (when bulk is released).

