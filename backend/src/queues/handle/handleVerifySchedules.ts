import * as Sentry from '@sentry/node'
import { logger } from '../../utils/Logger'
import prisma from '../../prisma/client'
import moment from 'moment'
import { sendScheduledMessages } from '../../queues'

export default async function handleVerifySchedules() {
  try {
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    const futureTime = moment().add(30, 'seconds').format('YYYY-MM-DD HH:mm:ss')

    const schedules = await prisma.schedule.findMany({
      where: {
        status: 'PENDENTE',
        sentAt: null,
        sendAt: {
          gte: new Date(now),
          lte: new Date(futureTime),
        },
      },
      include: {
        contact: true,
      },
    })

    if (schedules.length > 0) {
      await Promise.all(
        schedules.map(async schedule => {
          try {
            await prisma.schedule.update({
              where: { id: schedule.id },
              data: {
                status: 'AGENDADA',
              },
            })

            sendScheduledMessages.add(
              'SendMessage',
              { schedule },
              { delay: 40000 }
            )

            logger.info(`Disparo agendado para: ${schedule.contact.name}`)
          } catch (error: any) {
            if (error instanceof Error) {
              logger.error(
                `Erro ao atualizar o agendamento ${schedule.id}: ${error.message}`
              )
            }
            Sentry.captureException(error)
          }
        })
      )
    }
  } catch (e: any) {
    Sentry.captureException(e)
    logger.error('handleVerifySchedules -> Verify: error', e.message)
    throw e
  }
}
