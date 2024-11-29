import { Plan } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { PlanData } from 'src/@types/Plan'


const UpdatePlan = async (planData: PlanData): Promise<Plan> => {
  const { id, name, users, connections, queues, value } = planData

  const existingPlan = await prisma.plan.findUnique({
    where: { id: Number(id) },
  })

  if (!existingPlan) {
    throw new AppError('ERR_NO_PLAN_FOUND', 404)
  }

  const updatedPlan = await prisma.plan.update({
    where: { id: Number(id) },
    data: {
      name,
      users,
      connections,
      queues,
      value,
    },
  })

  return updatedPlan
}

export default UpdatePlan
