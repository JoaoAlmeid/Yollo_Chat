import { Ticket } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const ShowTicket = async (id: string | number, companyId: number): Promise<Ticket> => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(id) },
    include: {
      contact: {
        select: {
          id: true,
          name: true,
          number: true,
          email: true,
          profilePicUrl: true,
        },
        include: {
          extraInfo: true,
        }
      },
      user: { 
        select: { 
          id: true, 
          name: true 
        } 
      },
      queue: { 
        select: { 
          id: true, 
          name: true, 
          color: true 
        },
        include: {
          prompt: true,
          queueIntegrations: true
        } 
      },
      whatsapp: { 
        select: { 
          name: true 
        } 
      },
      tags: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    },
  })

  if (!ticket) {
    throw new AppError('ERR_NO_TICKET_FOUND', 404)
  }

  if (ticket?.companyId !== companyId) {
    throw new AppError('Não é possível consultar registros de outra empresa')
  }

  return ticket
}

export default ShowTicket
