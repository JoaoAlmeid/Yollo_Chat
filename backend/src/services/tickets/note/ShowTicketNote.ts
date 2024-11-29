import { TicketNote } from '@prisma/client'
import prisma from '../../../prisma/client'
import AppError from '../../../errors/AppError'

const ShowTicketNote = async (id: string | number): Promise<TicketNote> => {
  try {
    const ticketNote = await prisma.ticketNote.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!ticketNote) {
      throw new AppError('ERR_NO_TICKETNOTE_FOUND', 404)
    }

    return ticketNote
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error
    } else {
      console.error('Erro ao buscar nota de ticket:', error)
      throw new AppError('Erro ao buscar nota de ticket.')
    }
  }
}

export default ShowTicketNote
