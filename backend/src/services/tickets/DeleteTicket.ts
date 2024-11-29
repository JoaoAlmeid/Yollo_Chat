import prisma from '../../prisma/client'
import { Ticket } from '@prisma/client'
import AppError from '../../errors/AppError'

const DeleteTicket = async (id: string): Promise<Ticket> => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(id, 10) },
  })

  if (!ticket) {
    throw new AppError('ERR_NO_TICKET_FOUND', 404)
  }

  await prisma.ticket.delete({
    where: { id: parseInt(id, 10) },
  })

  return ticket
}

export default DeleteTicket
