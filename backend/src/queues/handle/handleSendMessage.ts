import * as Sentry from '@sentry/node'
import { Job } from 'bull'
import { MessageData, SendMessage } from '../../helpers/SendMessage'
import prisma from '../../prisma/client'
import { logger } from '../../utils/Logger'
import AppError from '../../errors/AppError'

export default async function handleSendMessage(job: Job) {
  try {
    const { data } = job
    const whatsapp = await prisma.whatsapp.findUnique({
      where: { id: data.whatsappId },
    })

    if (!whatsapp) {
      throw new AppError('WhatsApp não indentificado', 400)
    }

    const messageData: MessageData = data.data

    await SendMessage(whatsapp, messageData)
  } catch (err: any) {
    Sentry.captureException(err)
    logger.error('MessageQueue -> SendMessage: error', err.message)
    throw err
  }
}
