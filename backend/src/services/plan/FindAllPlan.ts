import prisma from '../../prisma/client'
import { Plan } from '@prisma/client'

const FindAllPlan = async (): Promise<Plan[]> => {
  const plan = await prisma.plan.findMany({
    orderBy: { name: 'asc' },
  })
  return plan
}

export default FindAllPlan
