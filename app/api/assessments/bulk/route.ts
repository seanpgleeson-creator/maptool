import { put } from '@vercel/blob'
import { getPrisma } from '@/lib/db'
import { analyzePolicy } from '@/lib/analyzePolicy'
import { parseBulkCsv } from '@/lib/parseBulkCsv'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ALLOWED_POLICY_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const
const MAX_POLICY_BYTES = 4 * 1024 * 1024
const MAX_ITEMS = 20
const MAX_ITEMS_FILE_BYTES = 512 * 1024 // 512 KB

export function GET() {
  return Response.json(
    { error: 'Method not allowed. Use POST to create a bulk assessment.' },
    { status: 405, headers: { Allow: 'POST' } },
  )
}

export async function POST(req: Request) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json(
      { error: 'Invalid form data. Send multipart/form-data with items_file (CSV) and policy.' },
      { status: 400 },
    )
  }

  const itemsFile = formData.get('items_file') as File | null
  const policyFile = formData.get('policy') as File | null

  if (!itemsFile || !(itemsFile instanceof File) || itemsFile.size === 0) {
    return Response.json(
      { error: 'Items file (CSV) is required.' },
      { status: 400 },
    )
  }
  if (!policyFile || !(policyFile instanceof File) || policyFile.size === 0) {
    return Response.json(
      { error: 'Policy document (PDF or Word) is required.' },
      { status: 400 },
    )
  }

  if (itemsFile.size > MAX_ITEMS_FILE_BYTES) {
    return Response.json(
      { error: `Items file must be under ${MAX_ITEMS_FILE_BYTES / 1024} KB.` },
      { status: 400 },
    )
  }

  const mime = (policyFile.type || 'application/octet-stream').toLowerCase()
  const policyAllowed =
    ALLOWED_POLICY_TYPES.includes(mime as (typeof ALLOWED_POLICY_TYPES)[number]) ||
    mime === 'application/octet-stream'
  if (!policyAllowed) {
    return Response.json(
      { error: 'Policy must be PDF or Word (.doc/.docx).' },
      { status: 400 },
    )
  }
  if (policyFile.size > MAX_POLICY_BYTES) {
    return Response.json(
      { error: 'Policy file must be under 4 MB.' },
      { status: 400 },
    )
  }

  const csvText = await itemsFile.text()
  const { rows, error: parseError } = parseBulkCsv(csvText)
  if (parseError) {
    return Response.json({ error: parseError }, { status: 400 })
  }
  if (rows.length > MAX_ITEMS) {
    return Response.json(
      { error: `Maximum ${MAX_ITEMS} items per bulk run. Your file has ${rows.length}.` },
      { status: 400 },
    )
  }

  try {
    const prisma = getPrisma()
    const policyBuffer = Buffer.from(await policyFile.arrayBuffer())

    let policyBlobKey: string | null = null
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(
        `policies/${Date.now()}-${policyFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        policyBuffer,
        { access: 'private', addRandomSuffix: true },
      )
      policyBlobKey = blob.url
    }

    const assessment = await prisma.assessment.create({
      data: {
        mode: 'bulk',
        status: 'running',
        step: 'checking_prices',
        items: {
          create: rows.map((r) => ({
            upc: r.upc,
            mapPrice: r.mapPrice.toFixed(2),
          })),
        },
        policyDoc: {
          create: {
            fileKey: policyBlobKey,
            fileType: policyFile.type || null,
          },
        },
        recommendation: {
          create: {
            action: 'discuss',
            reasons: ['Bulk assessment in progress.'],
          },
        },
      },
      include: { items: true, policyDoc: true },
    })

    const policyDocId = assessment.policyDoc!.id
    const { getWalmartByUpc } = await import('@/lib/walmart')

    const itemWalmartPrices: Map<string, number | null> = new Map()
    for (const item of assessment.items) {
      const walmartResult = await getWalmartByUpc(item.upc)
      const mapPriceNum = Number(item.mapPrice)
      await prisma.competitorPrice.createMany({
        data: [
          {
            assessmentItemId: item.id,
            source: 'walmart',
            price: walmartResult.price,
            listingUrl: walmartResult.listingUrl,
            errorMessage: walmartResult.error ?? null,
            scrapedAt: new Date(),
          },
          {
            assessmentItemId: item.id,
            source: 'amazon',
            price: null,
            listingUrl: null,
            errorMessage: 'Coming soon',
          },
        ],
      })
      itemWalmartPrices.set(item.id, walmartResult.price)
    }

    const { extractPolicyText } = await import('@/lib/extractPolicyText')
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { step: 'analyzing_policy' },
    })
    const extractResult = await extractPolicyText(policyBuffer, mime)
    const extractedText =
      'text' in extractResult ? extractResult.text : null
    const extractError = 'error' in extractResult ? extractResult.error : null

    await prisma.policyDocument.update({
      where: { id: policyDocId },
      data: {
        extractedText,
        extractedAt: extractedText ? new Date() : null,
      },
    })

    const reasons: string[] = []
    let action: 'discuss' | 'proceed' = 'discuss'

    if (!extractedText) {
      reasons.push(
        extractError ?? 'Could not read the policy document. Upload a clear PDF or Word file.',
      )
    } else {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        reasons.push('Policy analysis is not configured (missing OPENAI_API_KEY).')
      } else {
        const analysisResult = await analyzePolicy(extractedText, apiKey)
        if (!analysisResult.ok) {
          reasons.push(analysisResult.error)
        } else {
          const r = analysisResult.result
          await prisma.policyAnalysis.create({
            data: {
              assessmentId: assessment.id,
              appliesToAllRetailers: r.appliesToAllRetailers,
              segmentDescription: r.segmentDescription,
              consequencesSpecific: r.consequencesSpecific,
              consequencesSummary: r.consequencesSummary,
              consequenceSeverity: r.consequenceSeverity,
              consequenceTimeline: r.consequenceTimeline,
            },
          })
          if (!r.appliesToAllRetailers && r.segmentDescription) {
            reasons.push(`Policy applies only to: ${r.segmentDescription}`)
          }
          if (!r.consequencesSpecific) {
            reasons.push(
              'Policy does not state specific consequences for violations. Consider asking the vendor for clear steps.',
            )
          }
          if (r.consequencesSpecific && r.consequencesSummary) {
            reasons.push(`Consequences: ${r.consequencesSummary}`)
          }
          if (r.appliesToAllRetailers && r.consequencesSpecific) {
            action = 'proceed'
            if (reasons.length === 0) {
              reasons.push('Policy applies to all retailers and has specific consequences.')
            }
          }
        }
      }
    }

    const perItemSummary: Array<{
      item_id: string
      upc: string
      map_price: string
      walmart_price: number | null
      discuss: boolean
      reason?: string
    }> = []

    let anyMapAboveMarket = false
    for (const item of assessment.items) {
      const walmartPrice = itemWalmartPrices.get(item.id) ?? null
      const mapPriceNum = Number(item.mapPrice)
      const discuss =
        walmartPrice != null &&
        Number.isFinite(mapPriceNum) &&
        mapPriceNum > walmartPrice
      if (discuss) anyMapAboveMarket = true
      perItemSummary.push({
        item_id: item.id,
        upc: item.upc,
        map_price: String(item.mapPrice),
        walmart_price: walmartPrice,
        discuss,
        reason: discuss
          ? 'MAP above current Walmart retail'
          : undefined,
      })
    }

    if (anyMapAboveMarket) {
      reasons.push(
        'One or more items have MAP above current Walmart retail. Negotiation follow-up needed.',
      )
      action = 'discuss'
    }

    await prisma.recommendation.update({
      where: { assessmentId: assessment.id },
      data: { action, reasons, perItemSummary },
    })

    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { status: 'completed', step: 'policy_reviewed' },
    })

    return Response.json(
      { assessment_id: assessment.id, status: 'completed' },
      { status: 201 },
    )
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unexpected server error.'
    console.error('[POST /api/assessments/bulk]', err)
    return Response.json(
      {
        error: 'Failed to create bulk assessment.',
        details: message === 'DATABASE_URL is not set.' ? undefined : String(message),
      },
      { status: 500 },
    )
  }
}
