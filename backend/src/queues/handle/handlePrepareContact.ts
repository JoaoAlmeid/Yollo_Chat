import prisma from '../../prisma/client'
import { logger } from '../../utils/Logger'
import { PrepareContactData } from '../../@types/Queues'
import { Job } from 'bull'

import getCampaignValidMessages from '../get/getCampaignValidMessages'
import getProcessedMessage from '../get/getProcessedMessage'
import getCampaignValidConfirmationMessages from '../get/getCampaignValidConfirmationMessages'
import verifyAndFinalizeCampaign from '../verifyAndFinalizeCampaign'
import { campaignQueue } from '../../queues'
import getCampaign from '../get/getCampaign'
import getContact from '../get/getContact'
import { CampaignShipping } from '@prisma/client'
import { CampaignWithContacts } from '../types'

export default async function handlePrepareContact(job: Job): Promise<void> {
  try {
    const { contactId, campaignId, delay, variables }: PrepareContactData = job.data

    // Obtém a campanha e o contato
    const campaign = await getCampaign(campaignId)
    const contact = await getContact(contactId)

    if (!campaign) { throw new Error('Campanha não encontrada.') }
    if (!contact) { throw new Error('Contato não encontrado.') }
    
    const now = new Date()

    const campaignShipping: CampaignShipping = {
      number: contact.number,
      contactId: contactId,
      campaignId: campaignId,
      createdAt: now,
      updatedAt: now,
      id: 0,
      jobId: '',
      message: '',
      confirmationMessage: '',
      confirmation: false,
      confirmationRequestedAt: undefined,
      confirmedAt: undefined,
      deliveredAt: undefined
    }

    const campaignMessages = {
      message1: campaign.message1,
      message2: campaign.message2,
      message3: campaign.message3,
      message4: campaign.message4,
      message5: campaign.message5,
    }

    const messages = getCampaignValidMessages(campaignMessages)
    if (messages.length) {
      const randomIndex = randomValue(0, messages.length)
      const message = getProcessedMessage(messages[randomIndex], variables, contact)
      campaignShipping.message = `\u200c${message}`
    }

    if (campaign.confirmation) {
      const campaignConfirmationMessages = {
        confirmationMessage1: campaign.confirmationMessage1,
        confirmationMessage2: campaign.confirmationMessage2,
        confirmationMessage3: campaign.confirmationMessage3,
        confirmationMessage4: campaign.confirmationMessage4,
        confirmationMessage5: campaign.confirmationMessage5,
      }
      const confirmationMessages =
        getCampaignValidConfirmationMessages(campaignConfirmationMessages)
      if (confirmationMessages.length) {
        const randomIndex = randomValue(0, confirmationMessages.length)
        const message = getProcessedMessage(confirmationMessages[randomIndex], variables, contact)
        campaignShipping.confirmationMessage = `\u200c${message}`
      }
    }

    const existingRecord = await prisma.campaignShipping.findUnique({
      where: {
        contactId_campaignId: {
          contactId: campaignShipping.contactId,
          campaignId: campaignShipping.campaignId,
        },
      },
    })

    if (existingRecord) {
      await prisma.campaignShipping.update({
        where: {
          id: existingRecord.id,
        },
        data: {
          ...campaignShipping,
          updatedAt: now,
        },
      });
    } else {
      await prisma.campaignShipping.create({
        data: campaignShipping,
      });
    }

    if (
      existingRecord.deliveredAt === null &&
      existingRecord.confirmationRequestedAt === null
    ) {
      const nextJob = await campaignQueue.add(
        'DispatchCampaign',
        {
          campaignId: campaign.id,
          campaignShippingId: existingRecord.id,
          contactListItemId: contactId,
        },
        {
          delay,
        }
      )

      await prisma.campaignShipping.update({
        where: { id: existingRecord.id },
        data: { jobId: String(nextJob.id) },
      })
    }

    if (campaign) {
      await verifyAndFinalizeCampaign(campaign)
    }
  } catch (err: any) {
    logger.error(`campaignQueue -> PrepareContact -> error: ${err.message}`)
  }
}

function randomValue(min: number, max: number): number {
  if (max <= min) {
    throw new Error('O valor máximo deve ser maior que o valor mínimo.')
  }
  return Math.floor(Math.random() * (max - min)) + min
}
