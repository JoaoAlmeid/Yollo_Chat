import { TicketNote } from '@prisma/client'
import prisma from '../../../prisma/client'

const FindAllTicketNotes = async (): Promise<TicketNote[]> => {
  const ticketNotes = await prisma.ticketNote.findMany()
  return ticketNotes
}

export default FindAllTicketNotes
