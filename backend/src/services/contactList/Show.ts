import { ContactList } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const ShowContactList = async (id: string | number): Promise<ContactList> => {
  try {
    const contactList = await prisma.contactList.findUnique({
      where: { id: Number(id) }
    })

    if (!contactList) {
      throw new AppError('Lista de contato não encontrada', 404)
    }

    return contactList
  } catch (error: any) {
    console.error(`Erro ao exibir a lista de contato: ${error.message}`)
    throw new AppError(`Erro interno ao exibir a lista de contato: ${error.message}`, 500)
  }
}

export default ShowContactList