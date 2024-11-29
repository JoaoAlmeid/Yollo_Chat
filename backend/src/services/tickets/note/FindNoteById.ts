import { TicketNote } from '@prisma/client'
import prisma from '../../../prisma/client'
import { ParamsNote } from '../../../@types/Tickets'

const FindNotesById = async ({
  contactId,
  ticketId,
}: ParamsNote): Promise<TicketNote[]> => {
  const notes = await prisma.ticketNote.findMany({
    where: {
      contactId: parseInt(contactId as string),
      ticketId: parseInt(ticketId as string),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      contact: {
        select: {
          id: true,
          name: true,
        },
      },
      ticket: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return notes
}

export default FindNotesById
