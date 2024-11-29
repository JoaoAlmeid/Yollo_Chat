import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { Contact } from '@prisma/client'
import CreateContact from './Create'
import { Data } from './types'

const GetContact = async ({ name, number, companyId }: Data): Promise<Contact> => {
  try {
    if (!number || !companyId) {
      throw new AppError('Erro: Dados do contato inválidos', 400)
    }

    const existingContact = await prisma.contact.findFirst({
      where: {
        number,
        companyId,
      },
    })

    if (!existingContact) {
      const createdContact = await CreateContact({
        name,
        number,
        companyId,
      })

      if (!createdContact) {
        throw new AppError('Erro: Não foi possivel criar contato', 500)
      }

      return createdContact
    }

    return existingContact
  } catch (error: any) {
    console.error(`Erro ao buscar contato: ${error.message}`)
    throw new AppError(`Erro interno ao buscar contato: ${error.message}`, 500)
  }
}

export default GetContact