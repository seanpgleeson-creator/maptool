import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

class MissingDatabaseUrlError extends Error {
  constructor() {
    super('DATABASE_URL is not set.')
    this.name = 'MissingDatabaseUrlError'
  }
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  if (!url || url.trim() === '') throw new MissingDatabaseUrlError()
  const adapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter })
}

export function getPrisma() {
  if (process.env.NODE_ENV === 'production') return createPrismaClient()
  if (!globalThis.prisma) globalThis.prisma = createPrismaClient()
  return globalThis.prisma
}

