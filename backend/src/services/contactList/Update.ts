import { ContactList } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { Data } from './types'

const UpdateContactList = async (data: Data): Promise<ContactList> => {
  try {
    const { id, name } = data

    const existingList = await prisma.contactList.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!existingList) {
      throw new AppError('Lista de contato não encontrada', 404)
    }

    const updatedRecord = await prisma.contactList.update({
      where: { id: Number(id) },
      data: { name }
    })

    return updatedRecord
  } catch (error: any) {
    console.error(`Erro ao atualizar a lista de contato: ${error.message}`)
    throw new AppError(`Erro interno ao atualizar a lista de contato: ${error.message}`, 500)
  }
}

export default UpdateContactList