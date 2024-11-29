import { Plan } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const ShowPlan = async (id: string | number): Promise<Plan | null> => {
  const plan = await prisma.plan.findUnique({
    where: { id: Number(id) },
  })

  if (!plan) {
    throw new AppError('ERR_NO_PLAN_FOUND', 404)
  }

  return plan
}

export default ShowPlan
