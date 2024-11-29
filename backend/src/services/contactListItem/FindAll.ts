import AppError from 'src/errors/AppError'
import prisma from '../../prisma/client'
import { ContactListItem } from '@prisma/client'

const FindAllContactListItem = async (): Promise<ContactListItem[]> => {
  try {
    const records: ContactListItem[] = await prisma.contactListItem.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return records
  } catch (error) {
    console.error(`Erro ao buscar todas as lista de items: ${error.message}`)
    throw new AppError(`Erro interno ao buscar todas as lista de items: ${error.message}`, 500)
  }
}

export default FindAllContactListItem