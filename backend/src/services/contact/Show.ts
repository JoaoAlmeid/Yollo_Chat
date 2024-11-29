import { Contact } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const ShowContact = async (id: string | number, companyId: number): Promise<Contact> => {
  try {
    if (!id || !companyId) {
      throw new AppError('Erro: Dados do contato inválidos', 400)
    }

    const contact = await prisma.contact.findUnique({
      where: { id: Number(id) },
      include: {
        extraInfo: true,
        whatsapp: true
      }
    })

    if (!contact) {
      throw new AppError('Erro: Contato não encontrado', 404)
    }

    return contact
  } catch (error: any) {
    console.error(`Erro ao exibir contato: ${error}`)
    throw new AppError('Erro interno ao exibir contato', 500)
  }
}

export default ShowContact