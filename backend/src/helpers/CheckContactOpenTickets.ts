import prisma from '../prisma/client'
import AppError from '../errors/AppError'

const CheckContactOpenTickets = async (contactId: number, whatsappId?: string): Promise<void> => {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        contactId,
        status: {
          in: ['open', 'pending']
        }
      }
    })
    
    if (ticket) { 
      throw new AppError('Erro: Ticket não encontrado', 404)
    }
  } catch (error: any) {
    throw new AppError(`Ocorreu um erro desconhecido: ${error.message}`, 500)
  }
}

export default CheckContactOpenTickets