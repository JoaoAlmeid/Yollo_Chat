import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { Queue, QueueOption, Whatsapp } from '@prisma/client'

interface QueueWithOptions extends Queue {
  options: QueueOption[]
}

interface WhatsappWithQueues extends Whatsapp {
  queues: QueueWithOptions[]
}

const ShowWhatsApp = async (id: string | number, companyId: number, session?: any): Promise<WhatsappWithQueues> => {
  const whatsapp = await prisma.whatsapp.findUnique({
    where: { id: Number(id) },
    include: {
      queues: {
        select: {
          id: true,
          name: true,
          color: true,
          greetingMessage: true,
          options: {
            select: {
              id: true,
              title: true,
              message: true
            }
          },
          integrationId: true,
          promptId: true,
          orderQueue: true
        },
        orderBy: { 
          orderQueue: 'asc' 
        },
      },
      prompt: true
    },
  })

  try {
    if (whatsapp?.companyId !== companyId) {
      throw new AppError('Não é possível acessar registros de outra empresa', 403)
    }
    
    if (!whatsapp) {
      throw new AppError('ERR_NO_WAPP_FOUND', 404)
    }
    if (session !== undefined && session == 0) {
      delete whatsapp.session
    }
  } catch (error: any) {
    throw new AppError(`Erro ao buscar o WhatsApp: ${error}`, 500);
  }

  return whatsapp as unknown as WhatsappWithQueues
}

export default ShowWhatsApp