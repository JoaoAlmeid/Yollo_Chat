import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const DeleteChatService = async (id: string | number): Promise<void> => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: Number(id) },
    })

    if (!chat) {
      throw new AppError('Erro: Chat não encontrado', 404)
    }

    await prisma.chat.delete({
      where: { id: Number(id) },
    })
  } catch (error: any) {
    console.error(`Erro ao deletar chat: ${error}`)
    throw new AppError(`Erro ao deletar chat: ${error.message}`, 500)
  }
}

export default DeleteChatService