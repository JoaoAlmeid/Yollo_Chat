import { Prisma, Plan } from '@prisma/client'
import prisma from '../../prisma/client'
import { RequestPlan, ResponsePlan } from '../../@types/Plan'

const ListPlans = async ({
  searchParam = '',
  pageNumber = '1',
}: RequestPlan): Promise<ResponsePlan> => {
  const whereCondition: Prisma.PlanWhereInput = {
    OR: [
      {
        name: {
          contains: searchParam.toLowerCase().trim(),
        },
      },
    ],
  }
  const limit = 20
  const offset = limit * (+pageNumber - 1)

  const plans = await prisma.plan.findMany({
    where: whereCondition,
    take: limit,
    skip: offset,
    orderBy: { name: 'asc' },
  })

  const count = await prisma.plan.count({
    where: whereCondition,
  })

  const hasMore = count > offset + plans.length

  return {
    plans,
    count,
    hasMore,
  }
}

export default ListPlans
