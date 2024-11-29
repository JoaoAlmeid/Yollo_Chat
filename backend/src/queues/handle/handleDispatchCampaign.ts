import path from 'path'
import { getIO } from '../../libs/socket'
import GetWhatsappWbot from '../../helpers/GetWhatsappWbot'
import { getMessageOptions } from '../../services/wbot/SendWhatsAppMedia'
import verifyAndFinalizeCampaign from '../verifyAndFinalizeCampaign'
import Sentry from '@sentry/node'
import { logger } from '../../utils/Logger'
import { DispatchCampaignData } from '../../@types/Queues'
import getCampaign from '../get/getCampaign'
import prisma from '../../prisma/client'

async function handleDispatchCampaign(job) {
  try {
    const { data } = job
    const { campaignShippingId, campaignId }: DispatchCampaignData = data

    // Obtém a campanha e o bot do WhatsApp
    const ExistCampaign = await getCampaign(campaignId);

    const campaign = await prisma.campaign.findUnique({
      where: { id: Number(ExistCampaign.id) },
      include: {
        whatsapp: true,
        contactList: {
          include: {
            items: true,
          }
        },
        shipping: {
          include: {
            contact: true
          }
        }
      }
    })
    
    if (!campaign) {
      throw new Error(`Campanha com ID ${campaignId} ou WhatsApp não encontrado.`);
    }

    const wbot = await GetWhatsappWbot(campaign.whatsapp)
    if (!wbot) {
      throw new Error(
        `WhatsApp bot para campanha com ID ${campaignId} não encontrado.`
      )
    }

    logger.info(
      `Disparo de campanha solicitado: Campanha=${campaignId} Registro=${campaignShippingId}`
    )

    // Obtém o envio da campanha e o contato associado
    const campaignShipping = await prisma.campaignShipping.findUnique({
      where: { id: campaignShippingId },
      include: { contact: true },
    })
    if (!campaignShipping) {
      throw new Error(
        `Envio da campanha com ID ${campaignShippingId} não encontrado.`
      )
    }

    const contactNumber = campaignShipping.contact.number
    if (!contactNumber) {
      throw new Error(
        `Número de contato não encontrado para o envio da campanha.`
      )
    }

    const chatId = `${contactNumber}@s.whatsapp.net`

    if (campaign.confirmation && !campaignShipping.confirmationRequestedAt) {
      if (!campaignShipping.confirmationMessage) {
        throw new Error(
          `Mensagem de confirmação não encontrada para o envio da campanha.`
        )
      }

      await wbot.sendMessage(chatId, {
        text: campaignShipping.confirmationMessage,
      })
      await prisma.campaignShipping.update({
        where: { id: campaignShippingId },
        data: { confirmationRequestedAt: new Date() },
      })
    } else {
      await wbot.sendMessage(chatId, {
        text: campaignShipping.message ?? 'Mensagem não disponível.',
      })

      if (campaign.mediaPath) {
        const filePath = path.resolve('public', campaign.mediaPath)
        const options = await getMessageOptions(campaign.mediaName, filePath)
        if (options) {
          await wbot.sendMessage(chatId, { ...options })
        }
      }

      await prisma.campaignShipping.update({
        where: { id: campaignShippingId },
        data: { deliveredAt: new Date() },
      })
    }

    // Verifica e finaliza a campanha se necessário
    await verifyAndFinalizeCampaign(campaign)

    // Emite um evento para notificar sobre a atualização da campanha
    const io = getIO()
    io.emit(`company-${campaign.companyId}-campaign`, {
      action: 'update',
      record: campaign,
    })

    logger.info(
      `Campanha enviada para: Campanha=${campaignId} Contato=${campaignShipping.contact.name}`
    )
  } catch (err: any) {
    Sentry.captureException(err)
    logger.error(
      `Erro ao processar campanha ${job.data.campaignId}: ${err.message}`
    )
    console.log(err.stack)
  }
}

export default handleDispatchCampaign