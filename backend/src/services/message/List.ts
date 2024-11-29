import { Prisma } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { RequestL, ResponseL } from './types'
import ShowTicket from '../tickets/ShowTicket'

const ListMessages = async ({ pageNumber = '1', ticketId, companyId, queues = [] }: RequestL): Promise<ResponseL> => {
  try {
    const ticket = await ShowTicket(ticketId, companyId)

    if (!ticket) {
      throw new AppError('Ticket não encontrado', 404)
    }

    const limit = 20
    const offset = limit * (+pageNumber - 1)

    const options: Prisma.MessageWhereInput = {
      ticketId: Number(ticket.id),
      companyId,
    }

    let where: Prisma.MessageWhereInput = options
    
    if (queues.length > 0) {
      where = {
        AND: [
          options,
          {
            OR: queues.map(queueId => ({
              queueId: {
                equals: queueId,
              },
            })),
          },
        ],
      }
    }

    const findTicket = await prisma.ticket.findUnique({
      where: { 
        id: ticket.id, 
        companyId 
      },
    })
    
    const messages = await prisma.message.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        contact: true,
        queue: true,
      },
    })
  
    const count = await prisma.message.count({ where })
    const hasMore = count > offset + messages.length
  
    return {
      messages: messages.map(message => ({
        ...message,
        quotedMsg: message || null,
      })),
      ticket,
      count,
      hasMore,
    }
  } catch (error: any) {
    console.error(`Erro ao listar mensagens: ${error.message}`)
    throw new AppError(`Erro ao listar mensagens: ${error.message}`, 500)
  }
}

export default ListMessages
