import { Prisma } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { ListRequest, ListResponse } from './types'

const ListContacts = async ({ searchParam = '', pageNumber = '1', companyId }: ListRequest): Promise<ListResponse> => {
  try {
    if (!companyId) {
      throw new AppError('Erro: Id da empresa inválido', 400)
    }

    const whereCondition: Prisma.ContactWhereInput = {
      OR: [
        { name: { contains: searchParam.toLowerCase().trim() } },
        { number: { contains: searchParam.toLowerCase().trim() } },
      ],
      companyId: companyId,
    }

    const limit = 20
    const offset = limit * (+pageNumber - 1)

    const contacts = await prisma.contact.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      orderBy: { name: 'asc' },
    })

    const count = await prisma.contact.count({ where: whereCondition })
    const hasMore = count > offset + contacts.length

    return {
      contacts,
      count,
      hasMore,
    }
  } catch (error: any) {
    console.error(`Erro ao listar contatos: ${error.message}`)
    throw new AppError(`Erro interno ao listar contatos: ${error.message}`, 500)
  }
}

export default ListContacts
