import prisma from '../prisma/client'
import AppError from '../errors/AppError'

const CheckContactSomeTickets = async ( contactId: number, companyId: number ): Promise<void> => {
  try {
    const ticket = await prisma.ticket.findFirst({ 
      where: { 
        contactId, 
        companyId 
      }
    })
    if (ticket) { 
      throw new AppError('Erro: Ticket não encontrado', 404)
    }
  } catch (error: any) {
    throw new AppError(`Ocorreu um erro desconhecido: ${error.message}`, 500)
  }
}

export default CheckContactSomeTickets