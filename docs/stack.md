# MAPtool — Stack (MVP)

This project is designed to ship quickly on **GitHub + Vercel**, and be testable on the **Vercel production URL** after each feature slice.

## Frontend / app framework

- **Next.js (App Router)** on Vercel
- **TypeScript**

## Backend (API)

- **Next.js Route Handlers** (`app/api/**/route.ts`) for the MVP API.
- Async/background work (scraping + AI) will be added in later phases (see `docs/todo.md`). MVP scaffolding should keep the API response shape stable (assessment id + status, then results).

## Database

- **Postgres** (recommended: **Vercel Postgres** for simplest production testing)
- `DATABASE_URL` is required in production.

## File storage (policies, bulk uploads)

- Preferred for MVP on Vercel: **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`)
- Alternative later: S3-compatible object storage.

## AI provider

- Policy review uses an LLM API (placeholder env: `OPENAI_API_KEY`).

## Notes

- Scraping Amazon/Walmart is inherently fragile and may fail or be blocked; the product must handle partial results gracefully (see `docs/prd.md` and `docs/ui.md`).

