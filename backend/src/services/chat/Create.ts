import { Chat } from "@prisma/client";
import prisma from "../../prisma/client";
import AppError from "src/errors/AppError";
import { ChatWithUsers, DataCreate } from "./types";

const CreateChatService = async (data: DataCreate): Promise<ChatWithUsers> => {
  try {
    const { ownerId, companyId, users, title } = data;

    const newChat = await prisma.chat.create({
      data: { ownerId, companyId, title }
    })

    // Criar as entradas para o chatUser, associando o dono ao usuário
    if (Array.isArray(users) && users.length > 0) {
      const chatUserData = [{ chatId: newChat.id, userId: ownerId, unreads: 0 }]

      for (let user of users) {
        chatUserData.push({ chatId: newChat.id, userId: user.id, unreads: 0 })
      }

      await prisma.chatUser.createMany({
        data: chatUserData
      })
    }
  
    // Recarrega o chat com as relações
    const ChatWithUsers = await prisma.chat.findUnique({
      where: { id: newChat.id },
      include: {
        users: {
          include: { user: true }
        },
        owner: true
      }
    })

    if (!ChatWithUsers) {
      throw new AppError('Erro ao carregar o chat após a criação', 500)
    }

    return ChatWithUsers
  } catch (error: any) {
    console.error(`Erro ao criar chat ou associar usuários: ${error}`)
    throw new AppError(`Erro interno ao criar chat ou associar usuários: ${error.message}`, 500)
  }
}

export default CreateChatService