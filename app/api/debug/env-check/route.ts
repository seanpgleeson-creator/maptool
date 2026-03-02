/**
 * Debug: check if Walmart price API keys are available in this environment.
 * Open in browser: /api/debug/env-check
 * Remove or restrict in production if you prefer.
 */
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({
    SCRAPINGBEE_API_KEY: process.env.SCRAPINGBEE_API_KEY?.trim() ? 'set' : 'not set',
    RIVIN_API_KEY: process.env.RIVIN_API_KEY?.trim() ? 'set' : 'not set',
  })
}
