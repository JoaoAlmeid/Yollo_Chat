import { Campaign } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from 'src/errors/AppError'

type Params = {
  companyId: string
}

const findCampaignsService = async ({ companyId }: Params): Promise<Campaign[]> => {
  try {
    const campanhas: Campaign[] = await prisma.campaign.findMany({
      where: { id: Number(companyId) },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return campanhas
  } catch (error: any) {
    console.error(`Erro ao buscar campanha: ${error}`)
    throw new AppError(`Erro interno ao buscar campanha: ${error.message}`, 500)
  }
}

export default findCampaignsService