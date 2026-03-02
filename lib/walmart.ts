/**
 * Look up Walmart price and product page URL by UPC.
 * Priority: (1) RIVIN_API_KEY → Rivin.ai product details, (2) SCRAPINGBEE_API_KEY → ScrapingBee search, (3) direct scrape of Walmart search.
 */

export type WalmartResult = {
  price: number | null
  listingUrl: string
  error?: string
}

const WALMART_SEARCH_BASE = 'https://www.walmart.com/search'

export async function getWalmartByUpc(upc: string): Promise<WalmartResult> {
  const rivinKey = process.env.RIVIN_API_KEY?.trim()
  if (rivinKey) {
    const { getWalmartByUpcFromRivin } = await import('@/lib/rivin')
    return getWalmartByUpcFromRivin(upc, rivinKey)
  }

  const scrapingBeeKey = process.env.SCRAPINGBEE_API_KEY?.trim()
  if (scrapingBeeKey) {
    const { getWalmartByUpcFromScrapingBee } = await import('@/lib/scrapingbee')
    return getWalmartByUpcFromScrapingBee(upc, scrapingBeeKey)
  }

  // No API key available at runtime — log so you can verify in Vercel → Logs
  console.warn(
    '[Walmart] SCRAPINGBEE_API_KEY not set in this environment; using direct scrape. Set it in Vercel → Project → Settings → Environment Variables for Production (and Preview if testing preview URLs), then redeploy.',
  )

  const listingUrl = `${WALMART_SEARCH_BASE}?q=${encodeURIComponent(upc)}`

  try {
    const res = await fetch(listingUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return {
        price: null,
        listingUrl,
        error: `Walmart returned ${res.status}. Price unavailable.`,
      }
    }

    const html = await res.text()

    // Try common price patterns in Walmart HTML (may change; graceful fallback)
    // Look for $XX.XX or "currentPrice": 12.34
    const jsonPriceMatch = html.match(/"currentPrice"\s*:\s*(\d+\.?\d*)/)
    if (jsonPriceMatch) {
      const price = parseFloat(jsonPriceMatch[1])
      if (Number.isFinite(price) && price > 0) {
        return { price, listingUrl }
      }
    }

    const dollarMatch = html.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/)
    if (dollarMatch) {
      const price = parseFloat(dollarMatch[1].replace(/,/g, ''))
      if (Number.isFinite(price) && price > 0) {
        return { price, listingUrl }
      }
    }

    return {
      price: null,
      listingUrl,
      error:
        'Price not found on page. Link to search below. For reliable prices, set SCRAPINGBEE_API_KEY in Vercel → Settings → Environment Variables (Production) and redeploy.',
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return {
      price: null,
      listingUrl,
      error: message.includes('timeout') ? 'Request timed out.' : 'Could not reach Walmart.',
    }
  }
}
