import prisma from '../../prisma/client'
import { ContactList } from '@prisma/client'
import validateContactListSchema from './validation'
import { Data } from './types'
import AppError from 'src/errors/AppError'

const CreateContactList = async (data: Data): Promise<ContactList> => {
  try {
    validateContactListSchema(data)

    const { name, companyId } = data
  
    const newContactList = await prisma.contactList.create({
      data: {
        name,
        companyId: Number(companyId),
        updatedAt: new Date(),
      },
    })
  
    return newContactList
  } catch (error: any) {
    console.error(`Erro ao criar lista de contatos: ${error.message}`)
    throw new AppError(`Erro interno ao criar lista de contatos: ${error.message}`, 500)
  }
}

export default CreateContactList