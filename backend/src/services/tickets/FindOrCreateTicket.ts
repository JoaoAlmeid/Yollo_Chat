import { subHours } from 'date-fns'
import prisma from '../../prisma/client'
import ShowTicketService from './ShowTicket'
import FindOrCreateATicketTrakingService from './FindOrCreateATicketTraking'
import AppError from '../../errors/AppError'
import { Ticket } from '@prisma/client'

const FindOrCreateTicket = async (
  contactId: number,
  whatsappId: number,
  unreadMessages: number,
  companyId: number,
  groupContactId?: number
): Promise<Ticket> => {
  try {
    // Buscar um ticket existente
    let ticket = await prisma.ticket.findFirst({
      where: {
        status: {
          in: ['open', 'pending', 'closed'],
        },
        contactId: groupContactId || contactId,
        companyId,
      },
      orderBy: {
        id: 'desc',
      },
    })

    if (ticket) {
      // Atualizar o ticket se ele existir
      ticket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: { unreadMessages, whatsappId },
      })
      
      if (ticket.status === 'closed') {
        ticket = await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            queueId: null,
            userId: null,
          },
        })
      }
    }

    if (!ticket) {
      // Buscar ticket existente baseado no groupContactId
      if (groupContactId) {
        const existingTicket = await prisma.ticket.findFirst({
          where: { contactId: groupContactId },
          orderBy: {
            updatedAt: 'desc',
          },
        })

        if (existingTicket) {
          ticket = await prisma.ticket.update({
            where: { id: existingTicket.id },
            data: {
              status: 'pending',
              userId: null,
              unreadMessages,
              queueId: null,
              companyId,
            },
          })

          await FindOrCreateATicketTrakingService({
            ticketId: existingTicket.id,
            companyId,
            whatsappId: existingTicket.whatsappId,
            userId: existingTicket.userId,
          })
        }
      } else {
        // Buscar ticket baseado no contato
        const existingTicket = await prisma.ticket.findFirst({
          where: {
            updatedAt: {
              gte: subHours(new Date(), 2),
              lte: new Date(),
            },
            contactId,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        })

        if (existingTicket) {
          ticket = await prisma.ticket.update({
            where: { id: existingTicket.id },
            data: {
              status: 'pending',
              userId: null,
              unreadMessages,
              queueId: null,
              companyId,
            },
          })

          await FindOrCreateATicketTrakingService({
            ticketId: existingTicket.id,
            companyId,
            whatsappId: existingTicket.whatsappId,
            userId: existingTicket.userId,
          })
        }
      }
    }

    // Criar um novo ticket se não existirem tickets encontrados
    if (!ticket) {
      const newTicketData = {
        contactId: groupContactId || contactId,
        status: 'pending',
        isGroup: !!groupContactId,
        unreadMessages,
        whatsappId,
        companyId,
        lastMessage: '',
        chatbot: false,
        userId: null,
        queueId: null,
        queueOptionId: null,
      }

      const newTicket = await prisma.ticket.create({
        data: newTicketData,
      })

      ticket = await ShowTicketService(newTicket.id, companyId)

      await FindOrCreateATicketTrakingService({
        ticketId: newTicket.id,
        companyId,
        whatsappId,
        userId: newTicket.userId,
      })
    }

    return ticket
  } catch (error: any) {
    if (error instanceof AppError) {
      throw new AppError(`ERR_FIND_OR_CREATE_TICKET ${error.message}`)
    } else {
      throw new AppError('Ocorreu um erro desconhecido')
    }
  }
}

export default FindOrCreateTicket
