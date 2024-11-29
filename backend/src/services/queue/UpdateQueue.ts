import { Queue } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import ShowQueueService from './ShowQueue'
import { QueueData } from '../../@types/Queues'
import { queueSchema } from '../../schemas/queueSchema'

const UpdateQueue = async (
  queueId: number | string,
  queueData: QueueData,
  companyId: number
): Promise<Queue> => {
  const { color, name, schedules } = queueData

  try {
    await queueSchema(companyId, Number(queueId)).validate({ color, name })
  } catch (err: any) {
    throw new AppError(err.errors.join(', '), 400)
  }

  const queue = await ShowQueueService(queueId, companyId)

  if (queue.companyId !== companyId) {
    throw new AppError(
      'Não é permitido alterar registros de outra empresa',
      403
    )
  }

  const updateData: any = { ...queueData }

  if (schedules) {
    updateData.schedules = {
      create: schedules,
    }
  }

  const updatedQueue = await prisma.queue.update({
    where: { id: Number(queueId) },
    data: updateData,
  })

  return updatedQueue
}

export default UpdateQueue
