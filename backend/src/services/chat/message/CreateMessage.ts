import prisma from '../../../prisma/client'
import { ChatMessageData } from '../../../@types/Chat'
import AppError from '../../../errors/AppError'

async function validateChatAndSender(chatId: number, senderId: number) {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } })
  const sender = await prisma.user.findUnique({ where: { id: senderId } })

  if (!chat) throw new AppError('Chat not found', 404)
  if (!sender) throw new AppError('Sender not found', 404)
  return sender
}

async function createMessage(data: ChatMessageData, senderName: string) {
  const newMessage = await prisma.chatMessage.create({
    data: {
      senderId: data.senderId,
      chatId: data.chatId,
      message: data.message,
      mediaName: data.mediaName || '',
      updatedAt: new Date(),
    },
    include: {
      chat: {
        include: {
          users: true,
        },
      },
    },
  })

  await prisma.chat.update({
    where: { id: data.chatId },
    data: { lastMessage: `${senderName}: ${data.message}` },
  })

  return newMessage
}

async function updateChatUsers(chatId: number, senderId: number) {
  const chatUsers = await prisma.chatUser.findMany({
    where: { chatId },
  })

  const chatUserUpdates = chatUsers.map(async chatUser => {
    const unreads = chatUser.userId === senderId ? 0 : chatUser.unreads + 1
    return prisma.chatUser.update({
      where: { id: chatUser.id },
      data: { unreads },
    })
  })

  await Promise.all(chatUserUpdates)
}

export default async function CreateMessageService(data: ChatMessageData) {
  const { senderId, chatId, message } = data

  if (!senderId || !chatId || !message) {
    throw new AppError('Missing required fields', 400)
  }

  const sender = await validateChatAndSender(chatId, senderId)

  const newMessage = await prisma.$transaction(async prisma => {
    const createdMessage = await createMessage(data, sender.name)
    await updateChatUsers(chatId, senderId)
    return createdMessage
  })

  return newMessage
}
