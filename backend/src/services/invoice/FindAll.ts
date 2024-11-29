import { Invoice } from '@prisma/client'
import prisma from '../../prisma/client'
import { RequestFAll } from './types'
import AppError from 'src/errors/AppError'

const FindAllInvoice = async ({ companyId }: RequestFAll): Promise<Invoice[]> => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { companyId },
      orderBy: { id: 'asc' }
    })

    return invoices
  } catch (error: any) {
    console.error(`Erro ao tentar encontrar faturas: ${error.message}`)
    throw new AppError(`Erro interno ao tentar encontrar faturas: ${error.message}`, 500)
  }
}

export default FindAllInvoice
