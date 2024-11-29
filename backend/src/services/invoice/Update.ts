import AppError from '../../errors/AppError'
import { Invoice } from '@prisma/client'
import prisma from '../../prisma/client'
import { Data } from './types'

const UpdateInvoice = async (invoiceData: Data): Promise<Invoice> => {
  try {
    const { id, status } = invoiceData

    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) }
    })

    if (!invoice) {
      throw new AppError('Fatura não encontrada', 404)
    }

    const updateInvoice = await prisma.invoice.update({
      where: { id: invoice.id},
      data: { status }
    })

    return updateInvoice
  } catch (error: any) {
    console.error(`Erro ao atualizar fatura: ${error.message}`)
    throw new AppError(`Erro interno ao atualizar fatura: ${error.message}`, 500)
  }
}

export default UpdateInvoice