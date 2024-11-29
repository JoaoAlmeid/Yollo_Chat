import AppError from '../../errors/AppError'
import { Queue } from '@prisma/client'
import prisma from '../../prisma/client'

const ShowQueue = async (
  queueId: number | string,
  companyId: number
): Promise<Queue> => {
  const queue = await prisma.queue.findUnique({
    where: { id: Number(queueId) },
    include: { company: true },
  })

  if (!queue) {
    throw new AppError('ERR_QUEUE_NOT_FOUND', 404)
  }

  if (queue.companyId !== companyId) {
    throw new AppError(
      'Não foi possível consultar registros de outra empresa',
      403
    )
  }

  return queue
}

export default ShowQueue
