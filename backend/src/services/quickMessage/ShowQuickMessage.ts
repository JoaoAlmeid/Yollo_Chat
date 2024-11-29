import { QuickMessage } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const ShowQMessage = async (id: string | number): Promise<QuickMessage> => {
  // Converter id para número se for string e validar se é um número válido
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numericId)) {
    throw new AppError('ERR_INVALID_ID', 400);
  }

  // Busca a mensagem rápida pelo ID
  const record = await prisma.quickMessage.findUnique({
    where: {
      id: numericId,
    },
  })

  // Verifica se o registro foi encontrado
  if (!record) {
    throw new AppError('ERR_NO_QUICKMESSAGE_FOUND', 404)
  }

  return record
}

export default ShowQMessage
