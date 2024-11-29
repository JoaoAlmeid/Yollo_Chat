import { Prisma } from '@prisma/client'
import prisma from '../../prisma/client'
import { RequestL, ResponseL } from './types'
import AppError from 'src/errors/AppError'

const ListInvoices = async ({ searchParam = '', pageNumber = '1' }: RequestL): Promise<ResponseL> => {
  const whereCondition = {
    OR: [
      {
        detail: {
          contains: searchParam.toLowerCase().trim(),
        },
      },
    ],
  }

  const limit = 20
  const offset = limit * (+pageNumber - 1)

  try {
    const invoices = await prisma.invoice.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      orderBy: {
        id: 'asc',
      },
    })

    const count = await prisma.invoice.count({ where: whereCondition })
    const hasMore = count > offset + invoices.length

    return {
      invoices,
      count,
      hasMore,
    }
  } catch (error: any) {
    console.error(`Erro ao listar faturas: ${error.message}`)
    throw new AppError(`Erro interno ao Listar Faturas: ${error.message}`, 500)
  }
}

export default ListInvoices