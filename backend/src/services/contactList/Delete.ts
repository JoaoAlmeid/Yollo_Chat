import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const DeleteContactList = async (id: number): Promise<void> => {
  try {
    const listContact = await prisma.contactList.findUnique({
      where: { id },
    })

    if (!listContact) {
      throw new AppError('Erro: Lista de contato não encontrada', 404)
    }

    await prisma.contactList.delete({
      where: { id },
    })
  } catch (error: any) {
    console.error(`Error ao deletar lista de contato: ${error.message}`)
    throw new AppError(`Error interno ao deletar lista de contato: ${error.message}`, 500)
  }
}

export default DeleteContactList