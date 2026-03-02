/**
 * ScrapingBee Walmart Search API — search by query (e.g. UPC), take first result.
 * @see https://www.scrapingbee.com/documentation/walmart/
 * Free tier: 1,000 API credits on signup. Search with light_request=true costs 10 credits/request.
 */

export type WalmartResult = {
  price: number | null
  listingUrl: string
  error?: string
}

const WALMART_SEARCH_FALLBACK = 'https://www.walmart.com/search'

type ScrapingBeeSearchResponse = {
  products?: Array<{
    price?: number
    url?: string
    product_id?: string
  }>
  meta_data?: { url?: string }
  message?: string
}

export async function getWalmartByUpcFromScrapingBee(
  upc: string,
  apiKey: string,
): Promise<WalmartResult> {
  const listingUrlFallback = `${WALMART_SEARCH_FALLBACK}?q=${encodeURIComponent(upc)}`

  try {
    const url = new URL('https://app.scrapingbee.com/api/v1/walmart/search')
    url.searchParams.set('api_key', apiKey)
    url.searchParams.set('query', upc)
    url.searchParams.set('light_request', 'true')

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(15000),
    })

    const body = (await res.json().catch(() => ({}))) as ScrapingBeeSearchResponse

    if (!res.ok) {
      const message =
        typeof body?.message === 'string'
          ? body.message
          : `ScrapingBee returned ${res.status}.`
      return {
        price: null,
        listingUrl: listingUrlFallback,
        error: message,
      }
    }

    const products = body.products
    const first = Array.isArray(products) && products.length > 0 ? products[0] : null

    if (!first) {
      return {
        price: null,
        listingUrl: listingUrlFallback,
        error: 'No Walmart results for this UPC.',
      }
    }

    const price =
      typeof first.price === 'number' && Number.isFinite(first.price) && first.price > 0
        ? first.price
        : null
    const listingUrl =
      typeof first.url === 'string' && first.url.trim()
        ? first.url.trim()
        : listingUrlFallback

    return {
      price,
      listingUrl,
      error: price == null && listingUrl === listingUrlFallback ? 'No price in first result.' : undefined,
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return {
      price: null,
      listingUrl: listingUrlFallback,
      error: message.includes('timeout') ? 'ScrapingBee request timed out.' : `ScrapingBee: ${message}`,
    }
  }
}
