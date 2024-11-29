import * as Sentry from '@sentry/node'
import { Job } from 'bull'
import { logger } from '../../utils/Logger'
import prisma from '../../prisma/client'
import { SendMessage } from '../../helpers/SendMessage'
import GetDefaultWhatsApp from '../../helpers/GetDefaultWhatsApp'
import { sendScheduledMessages } from '../../queues'
import { Schedule } from '@prisma/client'

export default async function handleSendScheduledMessage(job: Job) {
  const {
    data: { schedule },
  } = job

  let scheduleRecord: Schedule | null = null

  try {
    scheduleRecord = await prisma.schedule.findUnique({
      where: { id: schedule.id },
    })

    if (!scheduleRecord) {
      logger.error(`Agendamento não encontrado: ${schedule.id}`)
      return
    }
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) {
      logger.error(
        `Erro ao tentar consultar agendamento ${schedule.id}: ${e.message}`
      )
    }
    return
  }

  try {
    const whatsapp = await GetDefaultWhatsApp(schedule.companyId)

    if (whatsapp) {
      await SendMessage(whatsapp, {
        number: schedule.contact.number,
        body: schedule.body,
      })

      await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          sentAt: new Date(), // Usando Date diretamente
          status: 'ENVIADA',
        },
      })

      logger.info(`Mensagem agendada enviada para: ${schedule.contact.name}`)
    } else {
      logger.error(
        `WhatsApp não encontrado para a empresa: ${schedule.companyId}`
      )
    }
  } catch (e: any) {
    Sentry.captureException(e)
    if (scheduleRecord) {
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          status: 'ERRO',
        },
      })
    }
    logger.error(
      `Erro ao enviar mensagem agendada ${schedule.id}: ${e.message}`
    )
    throw e
  } finally {
    // Limpeza da fila pode ser feita aqui, se necessário
    sendScheduledMessages.clean(15000, 'completed')
  }
}
