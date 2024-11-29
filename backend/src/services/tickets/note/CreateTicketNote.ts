import { TicketNote } from '@prisma/client'
import prisma from '../../../prisma/client'
import * as Yup from 'yup'
import AppError from '../../../errors/AppError'
import { TicketNoteData } from '../../../@types/Tickets'

const CreateTicketNote = async (
  ticketNoteData: TicketNoteData
): Promise<TicketNote> => {
  const { note, userId, contactId, ticketId } = ticketNoteData

  const ticketnoteSchema = Yup.object().shape({
    note: Yup.string()
      .min(3, 'ERR_TICKETNOTE_INVALID_NAME')
      .required('ERR_TICKETNOTE_INVALID_NAME'),
  })

  try {
    await ticketnoteSchema.validate({ note })
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      throw new AppError(err.message)
    } else {
      throw new AppError('Ocorreu um erro desconhecido')
    }
  }

  try {
    const createdTicketNote = await prisma.ticketNote.create({
      data: {
        note,
        userId: Number(userId),
        contactId: Number(contactId),
        ticketId: Number(ticketId),
        updatedAt: new Date(),
      },
    })

    return createdTicketNote
  } catch (error: any) {
    throw new AppError('Erro ao criar nota para o ticket', 500)
  }
}

export default CreateTicketNote
