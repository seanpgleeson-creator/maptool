/**
 * Load .env from project root when running in dev and SCRAPINGDOG_API_KEY is not set.
 * Next.js may not load .env if cwd differs; this tries common locations.
 */
import path from 'path'
import { config } from 'dotenv'

let tried = false

export function loadEnvIfNeeded() {
  if (process.env.NODE_ENV === 'production') return
  if (process.env.SCRAPINGDOG_API_KEY?.trim()) return
  if (tried) return
  tried = true
  const candidates = [
    path.join(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
    path.join(process.cwd(), 'MAPtool', '.env'),
  ]
  for (const p of candidates) {
    config({ path: p })
    if (process.env.SCRAPINGDOG_API_KEY?.trim()) break
  }
}
