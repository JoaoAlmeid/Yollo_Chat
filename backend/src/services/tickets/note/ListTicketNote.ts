import { Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'
import { RequestTicketNote, ResponseTicketNote } from '../../../@types/Tickets'

const ListTicketNotes = async ({
  searchParam = '',
  pageNumber = 1,
}: RequestTicketNote): Promise<ResponseTicketNote> => {
  try {
    const whereCondition: Prisma.TicketNoteWhereInput = {
      note: {
        contains: searchParam.toLowerCase().trim(),
      },
    }

    const limit = 20
    const offset = limit * (pageNumber - 1)

    const ticketNotesCount = await prisma.ticketNote.count({
      where: whereCondition,
    })

    const ticketNotes = await prisma.ticketNote.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const hasMore = ticketNotesCount > offset + ticketNotes.length

    return {
      ticketNotes,
      count: ticketNotesCount,
      hasMore,
    }
  } catch (error: any) {
    console.error('Erro ao listar notas de tickets:', error)
    throw new Error('Erro ao listar notas de tickets.')
  }
}

export default ListTicketNotes
