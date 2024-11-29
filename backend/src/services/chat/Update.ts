import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { UpdateData } from './types'

export default async function UpdateChatService(data: UpdateData) {
  try {
    const { users } = data

    const existingChat = await prisma.chat.findUnique({ 
      where: { id: data.id },
      include: { users: true }
    })

    if (!existingChat) { 
      throw new AppError('Erro: Chat não encontrado', 404)
    }

    // Atualizar o chat, removendo os usuários antigos e adicionando os novos
    const updatedChat = await prisma.chat.update({
      where: { id: data.id },
      data: {
        title: data.title,
        users: {
          // Remover todos os usuários associados a este chat
          deleteMany: { chatId: data.id },
          // Criar novos usuários associados ao chat
          create: users?.map(user => ({
            userId: user.id,
            unreads: 0,
          })) ?? [],
        },
      },
      include: {
        users: {
          include: { user: true }
        },
        company: true,
      },
    })

    return updatedChat
  } catch (error: any) {
    console.error(`Erro ao atualizar chat: ${error.message}`)
    throw new AppError(`Erro interno ao atualizar chat: ${error.message}`, 500)
  }
}