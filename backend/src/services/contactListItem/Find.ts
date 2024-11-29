import prisma from '../../prisma/client'
import { ContactListItem } from '@prisma/client'
import { SearchParams } from './types'
import AppError from 'src/errors/AppError'

const FindContactItem = async ({ companyId, contactListId }: SearchParams): Promise<ContactListItem[]> => {
  try {
    let where: any = { companyId }
    
    if (contactListId) {
      where = {
        ...where,
        contactListId
      }
    }

    const notes: ContactListItem[] = await prisma.contactListItem.findMany({
      where,
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
  
    return notes
  } catch (error) {
    console.error(`Erro ao buscar lista de item: ${error.message}`)
    throw new AppError(`Erro interno ao buscar lista de item: ${error.message}`, 500)
  }
}

export default FindContactItem