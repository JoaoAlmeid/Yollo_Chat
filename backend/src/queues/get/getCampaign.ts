import prisma from '../../prisma/client'

type ContactListWithItems = {
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
  message1?: string
  message2?: string
  message3?: string
  message4?: string
  message5?: string
  confirmationMessage5?: string
  confirmationMessage4?: string
  confirmationMessage3?: string
  confirmationMessage2?: string
  confirmationMessage1?: string
}

async function getCampaign(id: number): Promise<CampaignWithContacts | null> {
  return await prisma.campaign.findUnique({
    where: { id },
    include: {
      contactList: {
        select: {
          id: true,
          name: true,
          items: {
            where: { isWhatsappValid: true },
            select: {
              id: true,
              name: true,
              number: true,
              email: true,
              isWhatsappValid: true,
            },
          },
        }
      },
      whatsapp: {
        select: { id: true, name: true }
      },
      shipping: {
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              number: true,
              email: true,
            }
          },
        },
      },
    },
  })
}

export default getCampaign