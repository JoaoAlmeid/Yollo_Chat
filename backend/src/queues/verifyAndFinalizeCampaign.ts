import moment from 'moment'
import { getIO } from '../libs/socket'
import prisma from '../prisma/client'

type ContactListWithItems = {
  contactListItem?: string;
  id: number;
  name: string;
  items: {
    id: number;
    name: string;
    number: string;
    email: string;
    isWhatsappValid: boolean;
  }[];
};

type CampaignWithContacts = {
  companyId?: number;
  mediaName?: string;
  mediaPath?: string;
  confirmation: boolean;
  id: number;
  name: string;
  contactList: ContactListWithItems | null;
  whatsapp: { id: number; name: string } | null;
  shipping: {
    id: number;
    contact: {
      id: number;
      name: string;
      number: string;
      email: string;
    };
  }[];
}

export default async function verifyAndFinalizeCampaign(campaign: CampaignWithContacts) {
  const contacts = campaign.contactList.contactListItem

  // Conta o número de contatos
  const count1 = contacts.length

  // Conta o número de envios concluídos
  const count2 = await prisma.campaignShipping.count({
    where: {
      campaignId: campaign.id,
      deliveredAt: {
        not: {
          equals: null as any,
        },
      },
    },
  })

  // Verifica se todos os contatos foram entregues
  if (count1 === count2) {
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: 'FINALIZADA',
        completedAt: moment().toDate(),
      },
    })
  }

  // Emite um evento para notificar sobre a atualização da campanha
  const io = getIO()
  io.emit(`company-${campaign.companyId}-campaign`, {
    action: 'update',
    record: campaign,
  })
}
