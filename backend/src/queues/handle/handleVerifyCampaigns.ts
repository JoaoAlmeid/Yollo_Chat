import * as Sentry from '@sentry/node'
import { logger } from '../../utils/Logger'
import prisma from '../../prisma/client'
import moment from 'moment'
import { campaignQueue } from '../../queues'

export default async function handleVerifyCampaigns() {
  try {
    // Obtém campanhas que estão programadas para o próximo intervalo de 1 hora
    const now = moment().startOf('minute').toDate() // Começa no início do minuto atual
    const oneHourFromNow = moment().add(1, 'hour').toDate() // Uma hora a partir de agora

    const campaigns = await prisma.campaign.findMany({
      where: {
        scheduledAt: {
          gte: now,
          lte: oneHourFromNow,
        },
        status: 'PROGRAMADA',
      },
      select: {
        id: true,
        scheduledAt: true,
      },
    })

    logger.info(`Campanhas encontradas: ${campaigns.length}`)

    for (const campaign of campaigns) {
      try {
        const scheduledAt = moment(campaign.scheduledAt)
        const delay = scheduledAt.diff(moment(), 'milliseconds')

        logger.info(
          `Campanha enviada para a fila de processamento: Campanha=${campaign.id}, Delay Inicial=${delay}`
        )

        await campaignQueue.add(
          'ProcessCampaign',
          {
            id: campaign.id,
            delay,
          },
          {
            removeOnComplete: true,
          }
        )
      } catch (err) {
        Sentry.captureException(err)
        if (err instanceof Error) {
          logger.error(
            `Erro ao processar a campanha ${campaign.id}: ${err.message}`
          )
        }
      }
    }
  } catch (err) {
    Sentry.captureException(err)
    if (err instanceof Error) {
      logger.error(`Erro ao verificar campanhas: ${err.message}`)
    }
  }
}
