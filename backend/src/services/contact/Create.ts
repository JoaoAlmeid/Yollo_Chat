import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { Contact } from '@prisma/client'
import { Data, ExtraInfo } from './types'

const CreateContact = async ({
  name,
  number,
  email = '',
  companyId,
  extraInfo = [],
}: Data): Promise<Contact> => {
  try {
    const existingContact = await prisma.contact.findFirst({
      where: {
        number,
        companyId,
      },
    })

    if (existingContact) {
      throw new AppError('Contato já existe')
    }

    const createdContact = await prisma.contact.create({
      data: {
        name,
        number,
        email,
        companyId,
        extraInfo: {
          create: extraInfo.map((info: ExtraInfo) => ({
            name: info.name,
            value: info.value
          }))
        }
      },
      include: {
        extraInfo: true
      }
    })

    return createdContact
  } catch (error: any) {
    console.error(`Erro ao criar contato: ${error.message}`)
    throw new AppError(`Erro interno ao criar contato: ${error.message}`, 500)
  }
}

export default CreateContact