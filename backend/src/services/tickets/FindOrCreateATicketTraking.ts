import AppError from '../../errors/AppError'
import { TicketTracking } from '@prisma/client'
import prisma from '../../prisma/client'
import { ParamsTicket } from '../../@types/Tickets'

const FindOrCreateATicketTraking = async ({ ticketId, companyId, whatsappId, userId,}: ParamsTicket): Promise<TicketTracking> => {
  try {
    const ticketTracking = await prisma.ticketTracking.findFirst({
      where: {
        ticketId: Number(ticketId),
        finishedAt: null,
      },
    })

    if (ticketTracking) {
      return ticketTracking
    }

    const newRecord = await prisma.ticketTracking.create({
      data: {
        ticketId: Number(ticketId),
        companyId: Number(companyId),
        whatsappId: whatsappId ? Number(whatsappId) : null,
        userId: userId ? Number(userId) : null,
        rated: false,
        startedAt: new Date(),
        queuedAt: new Date(),
        ratingAt: new Date(),
        chatbotAt: new Date()
      }
    })

    if (!newRecord) {
      throw new AppError('ERR_CREATING_TICKET_TRAKING')
    }

    return newRecord
  } catch (error: any) {
    if (error instanceof AppError) {
      throw new AppError(`ERR_CREATING_TICKET_TRAKING: ${error.message}`, 500)
    } else {
      throw new AppError('Ocorreu um erro desconhecido')
    }
  }
}

export default FindOrCreateATicketTraking
