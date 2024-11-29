import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { Message } from 'yup'
import { GetRequest } from './types'

const GetMessage = async ({ id }: GetRequest): Promise<Message> => {
  const messageExists = await prisma.message.findFirst({
    where: { id },
  })

  if (!messageExists) {
    throw new AppError('Mensagem não encontrada', 404)
  }

  return messageExists
}

export default GetMessage