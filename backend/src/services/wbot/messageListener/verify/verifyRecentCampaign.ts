import prisma from '../../../../prisma/client'
import { proto } from '@whiskeysockets/baileys'
import moment from 'moment'
import { campaignQueue, parseToMilliseconds, randomValue } from '../../../../queues'

const verifyRecentCampaign = async (message: proto.IWebMessageInfo, companyId: number) => {
  try {
    // Verifica se a mensagem não é enviada pelo próprio bot
    if (!message.key?.fromMe) {
      const number = message.key?.remoteJid?.replace(/\D/g, '')
      if (number) {
        const campaigns = await prisma.campaign.findMany({
          where: { companyId, status: 'EM_ANDAMENTO', confirmation: true },
        })

        if (campaigns.length > 0) {
          const ids = campaigns.map(c => c.id)
          const campaignShipping = await prisma.campaignShipping.findFirst({
            where: {
              campaignId: { in: ids },
              number,
              confirmation: false,
            },
          })

          if (campaignShipping) {
            await prisma.campaignShipping.update({
              where: { id: campaignShipping.id },
              data: {
                confirmedAt: moment().toDate(),
                confirmation: true,
              },
            })
            console.log('Envio de campanha confirmado:', campaignShipping.id)

            await campaignQueue.add(
              'DispatchCampaign',
              {
                campaignShippingId: campaignShipping.id,
                campaignId: campaignShipping.campaignId,
              },
              {
                delay: parseToMilliseconds(randomValue(0, 10))
              }
            )
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Erro em verifyRecentCampaign:', error)
    throw new Error('Falha ao verificar campanha recente.')
  } finally {
    await prisma.$disconnect()
  }
}

export default verifyRecentCampaign