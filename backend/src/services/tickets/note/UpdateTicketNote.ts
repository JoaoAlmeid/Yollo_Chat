import { TicketNote } from '@prisma/client'
import prisma from '../../../prisma/client'
import AppError from '../../../errors/AppError'
import { TicketNoteData } from '../../../@types/Tickets'

const UpdateTicketNote = async (
  ticketNoteData: TicketNoteData
): Promise<TicketNote> => {
  const { id, note } = ticketNoteData

  try {
    const existingTicketNote = await prisma.ticketNote.findUnique({
      where: {
        id: id || undefined,
      },
    })

    if (!existingTicketNote) {
      throw new AppError('ERR_NO_TICKETNOTE_FOUND', 404)
    }

    const updatedTicketNote = await prisma.ticketNote.update({
      where: {
        id: existingTicketNote.id,
      },
      data: {
        note,
      },
    })

    return updatedTicketNote
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error
    } else {
      console.error('Erro ao atualizar nota de ticket:', error)
      throw new AppError('Erro ao atualizar nota de ticket.')
    }
  }
}

export default UpdateTicketNote
