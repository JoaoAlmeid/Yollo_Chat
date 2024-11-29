import { Campaign } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const showCampaign = async (id: string | number): Promise<Campaign> => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: Number(id) },
      include: {
        shipping: true,
        contactList: {
          include: {
            items: true,
          },
        },
        whatsapp: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!campaign) {
      throw new AppError('Erro: Campanha não encontrada', 404)
    }

    return campaign
  } catch (error: any) {
    console.error(`Erro ao exibir campanha: ${error}`)
    throw new AppError(`Erro interno ao exibir campanha: ${error.message}`, 500)
  }
}

export default showCampaign