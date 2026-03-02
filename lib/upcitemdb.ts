/**
 * Option D (hybrid): Fetch UPCitemdb product page via ScrapingDog; parse Walmart price and link from Shopping Info table.
 * @see https://docs.scrapingdog.com/web-scraping-api
 * UPCitemdb shows "Shopping Info" with retailer, price, and buy link (redirect to Walmart).
 */

export type WalmartResult = {
  price: number | null
  listingUrl: string
  error?: string
}

const SCRAPINGDOG_BASE = 'https://api.scrapingdog.com/scrape'
const UPCITEMDB_BASE = 'https://www.upcitemdb.com/upc'
const WALMART_SEARCH_FALLBACK = 'https://www.walmart.com/search'

/** Parse UPCitemdb product page HTML for Walmart row in Shopping Info table. */
function parseUPCitemdbHtml(html: string, upc: string): WalmartResult {
  const listingUrlFallback = `${WALMART_SEARCH_FALLBACK}?q=${encodeURIComponent(upc)}`

  // Shopping Info table: find a row that mentions Walmart (Wal-Mart.com or Walmart)
  const walmartRowMatch = html.match(
    /<tr[^>]*>[\s\S]*?(?:wal-mart\.com|walmart)[\s\S]*?<\/tr>/i,
  )
  const rowHtml = walmartRowMatch ? walmartRowMatch[0] : ''

  if (!rowHtml) {
    return {
      price: null,
      listingUrl: listingUrlFallback,
      error: 'No Walmart listing for this UPC on UPCitemdb.',
    }
  }

  // Extract first href in row (store link — often upcitemdb.com/norob.php redirect to Walmart)
  const hrefMatch = rowHtml.match(/href\s*=\s*["']([^"']+)["']/i)
  let listingUrl = hrefMatch?.[1]
    ? hrefMatch[1].replace(/&amp;/g, '&').trim()
    : listingUrlFallback
  if (listingUrl && !listingUrl.startsWith('http')) {
    listingUrl = listingUrl.startsWith('/')
      ? `https://www.upcitemdb.com${listingUrl}`
      : listingUrlFallback
  }

  // Extract price $X.XX or $X,XX.XX
  const priceMatch = rowHtml.match(/\$[\d,]+(?:\.\d{2})?/)
  let price: number | null = null
  if (priceMatch) {
    const parsed = parseFloat(priceMatch[0].replace(/[$,]/g, ''))
    if (Number.isFinite(parsed) && parsed > 0) price = parsed
  }

  return {
    price,
    listingUrl: listingUrl || listingUrlFallback,
    error: price == null ? 'Could not extract price from UPCitemdb.' : undefined,
  }
}

export async function getWalmartByUpcFromUPCitemdb(
  upc: string,
  apiKey: string,
): Promise<WalmartResult> {
  const listingUrlFallback = `${WALMART_SEARCH_FALLBACK}?q=${encodeURIComponent(upc)}`
  const targetUrl = `${UPCITEMDB_BASE}/${encodeURIComponent(upc.trim())}`

  try {
    const url = new URL(SCRAPINGDOG_BASE)
    url.searchParams.set('api_key', apiKey)
    url.searchParams.set('url', targetUrl)

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const message =
        text.length > 0 && text.length < 300 ? text : `ScrapingDog returned ${res.status}.`
      return {
        price: null,
        listingUrl: listingUrlFallback,
        error: message,
      }
    }

    const html = await res.text()
    return parseUPCitemdbHtml(html, upc)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return {
      price: null,
      listingUrl: listingUrlFallback,
      error: message.includes('timeout')
        ? 'ScrapingDog request timed out.'
        : `ScrapingDog: ${message}`,
    }
  }
}
