import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const DeleteContactListItem = async (id: number): Promise<void> => {
  try {
    const contactList = await prisma.contactListItem.findUnique({
      where: { id }
    })

    if (!contactList) {
      throw new AppError('Erro: Lista de items não encontrada', 404)
    }

    await prisma.contactListItem.delete({
      where: { id }
    })
  } catch (error: any) {
    console.error(`Erro ao deletar Lista de Items: ${error.message}`)
    throw new AppError(`Erro interno ao deletar Lista de Items: ${error.message}`, 500)
  }
}

export default DeleteContactListItem