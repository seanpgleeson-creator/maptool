import { getPrisma } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const prisma = getPrisma()

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: { competitorPrices: true },
          orderBy: { createdAt: 'asc' },
        },
        policyDoc: true,
        policyAnalysis: true,
        recommendation: true,
      },
    })

    if (!assessment) {
      return Response.json({ error: 'Not found.' }, { status: 404 })
    }

    return Response.json({
      assessment_id: assessment.id,
      status: assessment.status,
      mode: assessment.mode,
      step: assessment.step,
      created_at: assessment.createdAt,
      items: assessment.items.map((i) => ({
        id: i.id,
        upc: i.upc,
        map_price: i.mapPrice,
        competitor_prices: i.competitorPrices.map((p) => ({
          source: p.source,
          price: p.price,
          currency: p.currency,
          scraped_at: p.scrapedAt,
          error: p.errorMessage,
          listing_url: p.listingUrl,
        })),
      })),
      policy_analysis: assessment.policyAnalysis
        ? {
            applies_to_all_retailers: assessment.policyAnalysis.appliesToAllRetailers,
            segment_description: assessment.policyAnalysis.segmentDescription,
            consequences_specific: assessment.policyAnalysis.consequencesSpecific,
            consequences_summary: assessment.policyAnalysis.consequencesSummary,
          }
        : null,
      recommendation: assessment.recommendation
        ? {
            action: assessment.recommendation.action,
            reasons: assessment.recommendation.reasons,
            per_item_summary: assessment.recommendation.perItemSummary,
          }
        : null,
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unexpected server error.'
    return Response.json(
      {
        error:
          message === 'DATABASE_URL is not set.'
            ? 'Server is missing DATABASE_URL. Set it in Vercel or your local env.'
            : 'Failed to fetch assessment.',
        details:
          message === 'DATABASE_URL is not set.' ? undefined : String(message),
      },
      { status: 500 },
    )
  }
}

