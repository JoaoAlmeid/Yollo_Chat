import { ContactListItem } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const ShowContactListItem = async (
  id: string | number
): Promise<ContactListItem> => {
  try {
    const listIem = await prisma.contactListItem.findUnique({
      where: { id: Number(id) },
    })
  
    if (!listIem) {
      throw new AppError('Erro: Lista de items não encontrada', 404)
    }
  
    return listIem
  } catch (error) {
    console.error(`Erro ao buscar todas as lista de items: ${error.message}`)
    throw new AppError(`Erro interno ao buscar todas as lista de items: ${error.message}`, 500)
  }
}

export default ShowContactListItem