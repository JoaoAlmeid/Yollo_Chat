import prisma from '../../prisma/client'
import { Queue } from '@prisma/client'

interface Request {
  companyId: number
}

const ListQueues = async ({ companyId }: Request): Promise<Queue[]> => {
  const queues = await prisma.queue.findMany({
    where: {
      companyId,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return queues
}

export default ListQueues
