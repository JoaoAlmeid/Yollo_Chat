import prisma from '../../prisma/client'
import { Message } from '@prisma/client'
import { RequestC } from './types'
import AppError from '../../errors/AppError'
import { getIO } from '../../libs/socket'

const CreateMessage = async ({ messageData, companyId }: RequestC): Promise<Message> => {
  try {
    await prisma.message.upsert({ ...messageData, companyId })
    
    const message = await prisma.message.findUnique({
      where: { id: messageData.id },
      include: {
        contact: true,
        ticket: {
          include: {
            contact: true,
            whatsapp: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (message.ticket.queueId !== null && message.queueId === null) {
      await prisma.message.update({
        where: { id: messageData.id },
        data: {
          queueId: message.ticket.queueId
        }
      })
    }

    if (!message) {
      throw new AppError('Mensagem não encontrada', 404)
    }

    const io = getIO()
    io.to(message.ticketId.toString())
    .to(message.ticket.status)
    .to("notification")
    .emit(`company-${companyId}-appMessage`, {
      action: "create",
      message,
      ticket: message.ticket,
      contact: message.ticket.contact
    })

    return message
  } catch (error: any) {
    console.error(`Erro ao criar mensagem: ${error.message}`)
    throw new AppError(`Erro interno ao criar mensagem: ${error.message}`, 500)
  }
}

export default CreateMessage