import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const DeletePlan = async (id: number): Promise<void> => {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id },
    })

    if (!plan) {
      throw new AppError('ERR_NO_PLAN_FOUND', 404)
    }

    await prisma.plan.delete({
      where: { id },
    })
  } catch (error: any) {
    throw new AppError('ERR_DELETING_PLAN')
  }
}

export default DeletePlan
