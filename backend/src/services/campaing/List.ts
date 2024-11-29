import { ListRequest, ListResponse } from './types'
import prisma from '../../prisma/client'
import { isEmpty } from 'lodash'
import AppError from 'src/errors/AppError'

const listCampaigns = async ({ searchParam = '', pageNumber = '1', companyId }: ListRequest): Promise<ListResponse> => {
  let whereCondition: any = {
    companyId
  }
  
  try {
    if (!isEmpty(searchParam)) {
      whereCondition.AND.push({
        name: {
          contains: searchParam.toLowerCase().trim(),
          mode: 'insensitive',
        },
      })
    }

    const limit = 20
    const offset = limit * (Number(pageNumber) - 1)

    const campanhas = await prisma.campaign.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      orderBy: {
        name: 'asc',
      },
      include: {
        contactList: true,
        whatsapp: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const contaTotal = await prisma.campaign.count({
      where: whereCondition,
    })

    const hasMore = contaTotal > offset + campanhas.length

    return {
      records: campanhas,
      count: contaTotal,
      hasMore,
    }
  } catch (error: any) {
    console.error(`Erro ao listar campanhas: ${error}`)
    throw new AppError(`Erro interno ao listar campanha: ${error.message}`, 500)
  }
}

export default listCampaigns