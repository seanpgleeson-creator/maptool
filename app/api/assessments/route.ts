import { put } from '@vercel/blob'
import { getPrisma } from '@/lib/db'
import { analyzePolicy } from '@/lib/analyzePolicy'

// Allow up to 60s so PDF extraction + OpenAI can finish (Vercel Hobby max is 60s)
export const maxDuration = 60

// Force dynamic so Vercel doesn't treat this as static (can cause 405 in production)
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json(
    { error: 'Method not allowed. Use POST to create an assessment.' },
    { status: 405, headers: { Allow: 'POST' } },
  )
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
] as const
const MAX_FILE_BYTES = 4 * 1024 * 1024 // 4 MB (under Vercel 4.5 MB request body limit)

export async function POST(req: Request) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json(
      { error: 'Invalid form data. Send multipart/form-data with upc, map_price, and policy.' },
      { status: 400 },
    )
  }

  const upc = (formData.get('upc') ?? '').toString().trim()
  const mapPriceRaw = formData.get('map_price')
  const mapPrice =
    typeof mapPriceRaw === 'string'
      ? Number(mapPriceRaw)
      : typeof mapPriceRaw === 'number'
        ? mapPriceRaw
        : NaN
  const policyFile = formData.get('policy') as File | null

  if (!upc) {
    return Response.json({ error: 'UPC is required.' }, { status: 400 })
  }
  if (!Number.isFinite(mapPrice) || mapPrice <= 0) {
    return Response.json(
      { error: 'MAP price is required and must be a positive number.' },
      { status: 400 },
    )
  }
  if (!policyFile || !(policyFile instanceof File) || policyFile.size === 0) {
    return Response.json(
      { error: 'Policy document (PDF or Word) is required.' },
      { status: 400 },
    )
  }

  const mime = (policyFile.type || 'application/octet-stream').toLowerCase()
  const allowed =
    ALLOWED_TYPES.includes(mime as (typeof ALLOWED_TYPES)[number]) ||
    mime === 'application/octet-stream'
  if (!allowed) {
    return Response.json(
      {
        error: `Unsupported policy file type. Use .pdf or .doc/.docx. Got: ${policyFile.type || 'unknown'}.`,
      },
      { status: 400 },
    )
  }
  if (policyFile.size > MAX_FILE_BYTES) {
    return Response.json(
      {
        error:
          'Policy file is too large. Maximum size is 4 MB (to stay within upload limits).',
      },
      { status: 400 },
    )
  }

  try {
    const prisma = getPrisma()
    const arrayBuffer = await policyFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Optional: upload to Vercel Blob (if configured)
    let fileKey: string | null = null
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(
        `policies/${Date.now()}-${policyFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        buffer,
        { access: 'private', addRandomSuffix: true },
      )
      fileKey = blob.url
    }

    const assessment = await prisma.assessment.create({
      data: {
        mode: 'single',
        status: 'running',
        step: 'extracting_policy',
        items: {
          create: [
            {
              upc,
              mapPrice: mapPrice.toFixed(2),
            },
          ],
        },
        policyDoc: {
          create: {
            fileKey,
            fileType: policyFile.type || null,
          },
        },
        recommendation: {
          create: {
            action: 'discuss',
            reasons: ['Policy review in progress.'],
          },
        },
      },
      include: { policyDoc: true, items: true },
    })

    const policyDocId = assessment.policyDoc!.id
    const firstItem = assessment.items[0]
    if (!firstItem) throw new Error('Assessment has no items.')

    // Competitor prices: Walmart (lookup) + Amazon (coming soon)
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { step: 'checking_prices' },
    })
    const { getWalmartByUpc } = await import('@/lib/walmart')
    const walmartResult = await getWalmartByUpc(upc)
    await prisma.competitorPrice.createMany({
      data: [
        {
          assessmentItemId: firstItem.id,
          source: 'walmart',
          price: walmartResult.price,
          listingUrl: walmartResult.listingUrl,
          errorMessage: walmartResult.error ?? null,
          scrapedAt: new Date(),
        },
        {
          assessmentItemId: firstItem.id,
          source: 'amazon',
          price: null,
          listingUrl: null,
          errorMessage: 'Coming soon',
        },
      ],
    })

    // Extract text (dynamic import so route loads without unpdf/mammoth; avoids 405 on Vercel)
    const { extractPolicyText } = await import('@/lib/extractPolicyText')
    const extractResult = await extractPolicyText(buffer, mime)
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

    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { step: 'analyzing_policy' },
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
        reasons.push(
          'Policy text was extracted, but analysis is not configured (missing OPENAI_API_KEY).',
        )
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

    await prisma.recommendation.update({
      where: { assessmentId: assessment.id },
      data: { action, reasons },
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
    console.error('[POST /api/assessments]', err)
    return Response.json(
      {
        error:
          message === 'DATABASE_URL is not set.'
            ? 'Server is missing DATABASE_URL. Set it in Vercel or your local env.'
            : 'Failed to create assessment.',
        details:
          message === 'DATABASE_URL is not set.' ? undefined : String(message),
      },
      { status: 500 },
    )
  }
}
