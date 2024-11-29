import AppError from 'src/errors/AppError'
import prisma from '../../prisma/client'
import { ListRequest, ListResponse } from './types'

const ListContactItem = async ({ searchParam = '', pageNumber = '1', companyId, contactListId }: ListRequest): Promise<ListResponse> => {
  try {
    const whereCondition: any = {
      companyId: Number(companyId),
      contactListId: Number(contactListId),
      OR: [
        {
          name: {
            contains: searchParam.trim().toLowerCase(),
            mode: 'insensitive',
          },
        },
        {
          number: {
            contains: searchParam.trim().toLowerCase(),
          },
        },
      ],
    }
  
    const limit = 20
    const offset = limit * (+pageNumber - 1)
  
    const [contacts, count] = await Promise.all([
      prisma.contactListItem.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.contactListItem.count({
        where: whereCondition,
      }),
    ])
  
    const hasMore = count > offset + contacts.length
  
    return {
      contacts,
      count,
      hasMore,
    }
  } catch (error) {
    console.error(`Erro ao listar a lista de items: ${error.message}`)
    throw new AppError(`Erro interno ao listar a lista de items: ${error.message}`, 500)
  }
}

export default ListContactItem