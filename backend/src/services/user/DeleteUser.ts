import { Ticket } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import UpdateDeletedUserOpenTicketsStatus from '../../helpers/UpdateDeletedUserOpenTicketsStatus'

const DeleteUser = async (id: string | number, companyId: number): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    })

    if (!user) {
      throw new AppError('Erro usuário não encontrado!', 404)
    }

    const userOpenTickets: Ticket[] = await prisma.ticket.findMany({
      where: { 
        userId: user.id, 
        status: 'open' 
      }
    })

    if (userOpenTickets.length > 0) {
      await UpdateDeletedUserOpenTicketsStatus(userOpenTickets, companyId)
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    })
  } catch (error: any) {
    console.error(`Erro ao deletar usuário: ${error}`)
    throw new AppError(`Erro ao deletar usuário: ${error.message}`, 400)
  }
}

export default DeleteUser