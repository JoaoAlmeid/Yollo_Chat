import { ContactList } from '@prisma/client'
import prisma from '../../prisma/client'
import { SearchParams } from './types'
import AppError from 'src/errors/AppError'

const FindContactList = async ({ companyId }: SearchParams): Promise<ContactList[]> => {
  try {
    const contactList = await prisma.contactList.findMany({
      where: {
        companyId: Number(companyId),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
  
    return contactList
  } catch (error: any) {
    console.error(`Erro ao buscar lista de contato: ${error.message}`)
    throw new AppError(`Erro interno ao buscar lista de contato: ${error.message}`, 500)
  }
}

export default FindContactList