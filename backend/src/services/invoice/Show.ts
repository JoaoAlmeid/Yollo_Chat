import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { Invoice } from '@prisma/client'

const ShowInvoice = async (InvoiceId: string | number): Promise<Invoice> => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: Number(InvoiceId),
      },
    })

    if (!invoice) {
      throw new AppError('Fatura não encontrada', 404)
    }

    return invoice
  } catch (error: any) {
    console.error(`Error ao carregar fatura: ${error.message}`)
    throw new AppError(`Error ao carregar fatura: ${error.message}`, 500)
  }
}

export default ShowInvoice