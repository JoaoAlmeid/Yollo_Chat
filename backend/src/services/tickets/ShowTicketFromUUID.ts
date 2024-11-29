import { Ticket } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const ShowTicketUUID = async (uuid: string): Promise<Ticket | null> => {
  const ticket = await prisma.ticket.findFirst({
    where: { uuid },
    include: {
      contact: {
        select: {
          id: true,
          name: true,
          number: true,
          email: true,
          profilePicUrl: true,
          extraInfo: true,
        },
      },
      user: { select: { id: true, name: true } },
      queue: { select: { id: true, name: true, color: true } },
      whatsapp: { select: { name: true } },
    },
  })

  if (!ticket) {
    throw new AppError('ERR_NO_TICKET_FOUND', 404)
  }

  return ticket
}

export default ShowTicketUUID
