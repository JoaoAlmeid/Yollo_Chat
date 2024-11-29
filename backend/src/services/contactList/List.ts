import prisma from '../../prisma/client'
import { isEmpty } from 'lodash'
import { ListRequest, ListResponse } from './types'
import AppError from 'src/errors/AppError'

const ListContactList = async ({ searchParam = '', pageNumber = '1', companyId }: ListRequest): Promise<ListResponse> => {
  try {
    let whereCondition: any = { companyId }

    if (!isEmpty(searchParam)) {
      whereCondition.AND = [
        {
          name: {
            contains: searchParam.toLowerCase().trim(),
          },
        },
      ]
    }

    const limit = 20
    const offset = limit * (+pageNumber - 1)

    const records = await prisma.contactList.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        companyId: true,
      },
    })

    const count = await prisma.contactList.count({
      where: whereCondition,
    })

    const hasMore = count > offset + records.length

    return {
      records,
      count,
      hasMore,
    }
  } catch (error: any) {
    console.error(`Erro ao listar as listas de contato: ${error.message}`)
    throw new AppError(`Erro interno ao listar as listas de contato: ${error.message}`, 500)
  }
}

export default ListContactList