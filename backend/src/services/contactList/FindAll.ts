import AppError from 'src/errors/AppError'
import prisma from '../../prisma/client'
import { ContactList } from '@prisma/client'

const FindAllContactList = async (): Promise<ContactList[]> => {
  try {
    const allContactList = await prisma.contactList.findMany({
      orderBy: { name: 'asc' }
    })
  
    return allContactList
  } catch (error: any) {
    console.error(`Erro ao buscar todas as listas de contato: ${error.message}`)
    throw new AppError(`Erro interno ao buscar todas as listas de contato: ${error.message}`, 500)
  }
}

export default FindAllContactList