import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const period = (query.period as string) || 'day'

  const dateFilter = {
    day: new Date(Date.now() - 24 * 60 * 60 * 1000),
    week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    year: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  } as const

  type PeriodKey = keyof typeof dateFilter
  if (!Object.keys(dateFilter).includes(period)) {
    throw createError({ statusCode: 400, message: 'Invalid period' })
  }

  const date = dateFilter[period as PeriodKey]

  return await prisma.price.findMany({
    where: {
      timestamp: { gte: date }
    },
    orderBy: { timestamp: 'asc' }
  })
})
