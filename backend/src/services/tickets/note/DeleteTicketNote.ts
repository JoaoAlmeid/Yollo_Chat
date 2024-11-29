import { Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'
import AppError from '../../../errors/AppError'

const DeleteTicketNote = async (id: string): Promise<void> => {
  try {
    const ticketNote = await prisma.ticketNote.delete({
      where: { id: Number(id) },
    })

    if (!ticketNote) {
      throw new AppError('ERR_NO_TICKETNOTE_FOUND', 404)
    }
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new AppError('ERR_NO_TICKETNOTE_FOUND', 404)
    }
    throw new AppError('Erro ao excluir nota do ticket', 500)
  }
}

export default DeleteTicketNote
