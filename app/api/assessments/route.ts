import { z } from 'zod'

import { getPrisma } from '@/lib/db'

const CreateAssessmentSchema = z.object({
  upc: z.string().min(1),
  map_price: z.number().positive(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = CreateAssessmentSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid input.', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  try {
    const prisma = getPrisma()

    const assessment = await prisma.assessment.create({
      data: {
        mode: 'single',
        status: 'pending',
        step: 'created',
        items: {
          create: [
            {
              upc: parsed.data.upc,
              mapPrice: parsed.data.map_price.toFixed(2),
            },
          ],
        },
        recommendation: {
          create: {
            action: 'discuss',
            reasons: [
              'Stub: competitor checks and policy review are not implemented yet.',
            ],
          },
        },
      },
      select: { id: true, status: true },
    })

    return Response.json(
      { assessment_id: assessment.id, status: assessment.status },
      { status: 201 },
    )
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unexpected server error.'
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

