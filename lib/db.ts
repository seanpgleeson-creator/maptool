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
  if (!process.env.DATABASE_URL) throw new MissingDatabaseUrlError()
  return new PrismaClient()
}

export function getPrisma() {
  if (process.env.NODE_ENV === 'production') return createPrismaClient()
  if (!globalThis.prisma) globalThis.prisma = createPrismaClient()
  return globalThis.prisma
}

