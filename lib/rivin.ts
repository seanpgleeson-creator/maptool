/**
 * Rivin.ai Walmart API — product lookup by UPC.
 * @see https://docs.rivin.ai/api-reference/endpoint/get-walmart-product-details
 */

export type WalmartResult = {
  price: number | null
  listingUrl: string
  error?: string
}

const RIVIN_BASE = 'https://rivin.ai/api'
const WALMART_SEARCH_FALLBACK = 'https://www.walmart.com/search'

type RivinProductDetails = {
  upc?: string
  walmart_product_code?: string
  buybox_price?: number
  name?: string
  message?: string
}

export async function getWalmartByUpcFromRivin(
  upc: string,
  apiKey: string,
): Promise<WalmartResult> {
  const listingUrlFallback = `${WALMART_SEARCH_FALLBACK}?q=${encodeURIComponent(upc)}`

  try {
    const url = `${RIVIN_BASE}/walmart/product/details?upc=${encodeURIComponent(upc)}`
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      signal: AbortSignal.timeout(10000),
    })

    const body = (await res.json().catch(() => ({}))) as RivinProductDetails

    if (!res.ok) {
      const message =
        typeof body?.message === 'string'
          ? body.message
          : res.status === 404
            ? 'Product not found for this UPC.'
            : `Rivin API returned ${res.status}.`
      return {
        price: null,
        listingUrl: listingUrlFallback,
        error: message,
      }
    }

    const price =
      typeof body.buybox_price === 'number' && Number.isFinite(body.buybox_price)
        ? body.buybox_price
        : null
    const code = body.walmart_product_code
    const listingUrl =
      code && String(code).trim()
        ? `https://www.walmart.com/ip/${encodeURIComponent(String(code).trim())}`
        : listingUrlFallback

    return {
      price: price && price > 0 ? price : null,
      listingUrl,
      error: price == null && !code ? 'No price or product code in response.' : undefined,
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return {
      price: null,
      listingUrl: listingUrlFallback,
      error: message.includes('timeout') ? 'Rivin request timed out.' : `Rivin: ${message}`,
    }
  }
}
