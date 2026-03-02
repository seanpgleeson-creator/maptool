/**
 * Debug: check if Walmart price API keys are available in this environment.
 * Open in browser: /api/debug/env-check
 * Remove or restrict in production if you prefer.
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

export const dynamic = 'force-dynamic'

/** Try to load .env from project root. In dev, compiled route is under .next/server/app/..., so we go up 6 levels. */
function loadEnvFromProjectRoot() {
  if (process.env.NODE_ENV === 'production') return
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const candidates = [
    path.resolve(__dirname, '..', '..', '..', '..', '.env'),
    path.resolve(__dirname, '..', '..', '..', '..', '..', '..', '.env'),
    path.join(process.cwd(), '.env'),
  ]
  for (const p of candidates) {
    config({ path: p })
    if (process.env.SCRAPINGDOG_API_KEY?.trim()) break
  }
}

export function GET() {
  let raw = process.env.SCRAPINGDOG_API_KEY
  if (!raw?.trim()) loadEnvFromProjectRoot()
  raw = process.env.SCRAPINGDOG_API_KEY
  const trimmed = raw?.trim()
  const body: Record<string, string | undefined> = {
    SCRAPINGDOG_API_KEY: trimmed ? 'set' : 'not set',
  }
  if (!trimmed && process.env.NODE_ENV !== 'production') {
    body._hint = !raw
      ? 'Env var not loaded. Use .env or .env.local in project root (same folder as package.json), then restart: npm run dev'
      : 'Var exists but is empty. Add: SCRAPINGDOG_API_KEY=your_key (no # in front, no spaces around =)'
  }
  return Response.json(body)
}
