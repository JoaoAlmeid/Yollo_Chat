import ShowBaileysChatService from './ShowBaileysChat'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const DeleteBaileysChatService = async (whatsappId: number, jid: string): Promise<void> => {
  try {
    const baileysChat = await ShowBaileysChatService(whatsappId, jid)

    await prisma.baileysChats.delete({
      where: { id: baileysChat.id }
    })
  } catch (error: any) {
    console.error(`Error ao deletar chat bailey: ${error}`)
    throw new AppError(`Erro interno no servidor ao deletar chat bailey: ${error.message}`, 500)
  } 
}

export default DeleteBaileysChatService