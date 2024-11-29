import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const DeleteContact = async (id: string): Promise<void> => {
  try {
    const contact = await prisma.contact.findUnique({ where: { id: Number(id) } })

    if (!contact) {
      throw new AppError('Contato não encontrado', 404)
    }

    await prisma.contact.delete({ where: { id: Number(id) } })
  } catch (error: any) {
    console.error(`Erro ao deletar contato: ${error}`)
    throw new AppError('Erro interno ao deletar contato', 500)
  }
}

export default DeleteContact