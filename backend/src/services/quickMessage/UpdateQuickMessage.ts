import { QuickMessage } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { DataQuickMessage } from '../../@types/Message'

const UpdateQuickMessage = async ( data: DataQuickMessage ): Promise<QuickMessage> => {
  const { id, shortcode, message, userId } = data

  if (!id) {
    throw new AppError('ERR_NO_QUICKMESSAGE_ID_PROVIDED', 400)
  }

  // Verifica se a mensagem rápida existe
  const existingRecord = await prisma.quickMessage.findUnique({
    where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
  })

  if (!existingRecord) {
    throw new AppError('ERR_NO_QUICKMESSAGE_FOUND', 404)
  }

  // Atualiza a mensagem rápida
  const updatedRecord = await prisma.quickMessage.update({
    where: { id: existingRecord.id },
    data: {
      shortcode,
      message,
      userId: Number(userId),
    },
  })

  return updatedRecord
}

export default UpdateQuickMessage
