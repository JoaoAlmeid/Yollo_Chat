import { Queue } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { QueueData } from '../../@types/Queues'
import { queueSchema } from '../../schemas/queueSchema'
import { logger } from '../../utils/Logger'

const CreateQueue = async (queueData: QueueData): Promise<Queue> => {
  logger.info(`Criando filas com os dados: ${JSON.stringify(queueData)}`)
  const { name, color, companyId, orderQueue } = queueData

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { plan: true },
  })

  if (!company) {
    throw new AppError('ERR_COMPANY_NOT_FOUND', 404)
  }

  const queuesCount = await prisma.queue.count({
    where: { companyId },
  })

  if (queuesCount >= company.plan.queues) {
    throw new AppError(`Número máximo de filas já alcançado: ${queuesCount}`)
  }

  try {
    await queueSchema(companyId).validate({ name, color })
  } catch (err: any) {
    throw new AppError(err.errors.join(', '), 400)
  }

  const createdQueue = await prisma.queue.create({
    data: {
      name,
      color,
      orderQueue,
      company: {
        connect: { id: companyId }
      },
    },
  })

  logger.info(`Fila criada com sucesso: ${JSON.stringify(createdQueue)}`)
  return createdQueue
}

export default CreateQueue
