import { ProcessCampaignData } from '../../@types/Queues'
import getCampaign from '../get/getCampaign'
import getSettings from '../get/getSettings'
import { campaignQueue } from '../../queues'
import { logger } from '../../utils/Logger'
import Sentry from '@sentry/node'
import { isArray } from 'lodash'
import { parseToMilliseconds, randomValue } from '../../queues'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

export default async function handleProcessCampaign(job: {
  data: ProcessCampaignData
}) {
  try {
    const { id, delay: initialDelay } = job.data

    // Obtém a campanha e as configurações associadas
    const campaign = await getCampaign(id)
    if (!campaign) {
      throw new AppError(`Campanha com ID: ${id}, não encontrada.`, 404)
    }

    const settings = await getSettings(campaign)

    // Obtém a lista de contatos a partir da contactListId
    const contactList = await prisma.contactList.findUnique({
      where: { id: campaign.contactList.id },
      include: { items: true },
    })

    if (!contactList) {
      throw new AppError(
        `Lista de contatos com ID: ${campaign.contactList}, não encontrada.`,
        404
      )
    }

    const contacts = contactList.items.filter(
      item => item.isWhatsappValid
    )

    if (isArray(contacts)) {
      let delay = initialDelay || 0 // Usa o delay inicial fornecido ou 0 por padrão
      let index = 0

      for (const contact of contacts) {
        // Adiciona o trabalho à fila
        await campaignQueue.add(
          'PrepareContact',
          {
            contactId: contact.id,
            campaignId: campaign.id,
            variables: settings.variables,
            delay,
          },
          {
            removeOnComplete: true,
          }
        )

        logger.info(
          `Registro enviado pra fila de disparo: Campanha=${campaign.id} Contato=${contact.name} Delay=${delay}`
        )

        index++
        if (index % settings.longerIntervalAfter === 0) {
          // Aplica um intervalo maior após o número configurado de mensagens
          delay += parseToMilliseconds(settings.greaterInterval)
        } else {
          // Adiciona um atraso aleatório baseado no intervalo configurado
          delay += parseToMilliseconds(randomValue(0, settings.messageInterval))
        }
      }

      // Atualiza o status da campanha para "EM_ANDAMENTO"
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'EM_ANDAMENTO' },
      })
    }
  } catch (err: any) {
    // Captura e registra exceções usando Sentry
    Sentry.captureException(err)
    logger.error(`Erro ao processar campanha ${job.data.id}: ${err.message}`)
  }
}
