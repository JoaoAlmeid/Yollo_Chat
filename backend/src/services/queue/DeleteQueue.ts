import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import ShowQueueService from './ShowQueue'

const DeleteQueue = async (
  queueId: number | string,
  companyId: number
): Promise<void> => {
  const queue = await ShowQueueService(queueId, companyId)

  if (!queue) {
    throw new AppError('ERR_QUEUE_NOT_FOUND', 404)
  }

  if (queue.companyId !== companyId) {
    throw new AppError(
      'Não é permitido excluir registros de outra empresa',
      403
    )
  }

  await prisma.queue.delete({
    where: { id: Number(queueId) },
  })
}

export default DeleteQueue
