import prisma from "../../prisma/client";
import AppError from "src/errors/AppError";
import { ChatMessageData } from "./types";

export default async function CreateMessageService({ senderId, chatId, message }: ChatMessageData) {
    try {
        const chat = await prisma.chat.findUnique({ where: { id: chatId } })
        if (!chat) {
            throw new AppError('Chat não encontrado', 404)
        }

        const newMessage = await prisma.chatMessage.create({
            data: {
                senderId,
                chatId,
                message
            },
            include: {
                sender: { select: { id: true, name: true }},
                chat: { include: { users: true }}
            }
        })

        await prisma.chat.update({
            where: { id: chatId },
            data: { lastMessage: `${newMessage.sender.name}: ${message}` }
        })

        // Atualiza os contadores de mensagens não lidas para os usuários
        const chatUsers = await prisma.chatUser.findMany({ where: { chatId } })
        const updates = chatUsers.map(chatUser => {
            if (chatUser.userId === senderId) {
                // Reseta o contador para o remetente
                return prisma.chatUser.update({
                    where: { id: chatUser.id },
                    data: { unreads: 0 }
                })
            } else {
                // Inclementa o contador de mensagens não lidas para os outros usuários
                return prisma.chatUser.update({
                    where: { id: chatUser.id },
                    data: { unreads: chatUser.unreads + 1 }
                })
            }
        }) 

        // Execute todas as atualizações em paralelo
        await Promise.all(updates)

        return newMessage
    } catch (error: any) {
        console.error(`Erro ao criar a mensagem: ${error}`)
        throw new AppError(`Erro interno ao criar a mensagem: ${error.message}`, 500)
    }
}