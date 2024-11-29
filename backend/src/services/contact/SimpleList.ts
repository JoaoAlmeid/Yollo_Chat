import { Contact } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { SearchContactParams } from './types'

const SimpleContactList = async ({ name, companyId }: SearchContactParams): Promise<Contact[]> => {
  try {
    if (!companyId) {
      throw new AppError('Erro: Id da empresa inválido', 400)
    }

    const whereCondition: any = {
      companyId: Number(companyId),
    }

    if (name) {
      whereCondition.name = {
        contains: name,
        mode: 'insensitive',
      }
    }

    const contacts = await prisma.contact.findMany({
      where: whereCondition,
      orderBy: {
        name: 'asc',
      },
    })

    if (!contacts || contacts.length === 0) {
      throw new AppError('Erro: Contato não encontrado', 404)
    }

    return contacts
  } catch (error: any) {
    console.error(`Erro ao listar contato: ${error}`)
    throw new AppError('Erro interno ao listar contato', 500)
  }
}

export default SimpleContactList