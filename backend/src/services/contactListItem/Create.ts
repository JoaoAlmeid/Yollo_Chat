import AppError from '../../errors/AppError'
import { logger } from '../../utils/Logger'
import { ContactListItem } from '@prisma/client'
import CheckContactNumber from '../wbot/CheckNumber'
import prisma from '../../prisma/client'
import { CreateData } from './types'
import validateListItemSchema from './validation'

const CreateContactListItem = async (data: CreateData): Promise<ContactListItem> => {
  try {
    const { name, number, companyId, contactListId, email } = data
    validateListItemSchema(data)
    
    const listItem = await prisma.contactListItem.findFirst({
      where: {
        number,
        companyId,
        contactListId,
      },
    })

    if (!listItem) {
      const listItem = await prisma.contactListItem.create({
        data: {
          name,
          number,
            companyId,
            contactListId,
            email: email || '',
            isWhatsappValid: false,
            updatedAt: new Date(),
          },
      })
    
      return listItem
    }

    try {
      const response = await CheckContactNumber(listItem.number, listItem.companyId)
      const updatedRecord = await prisma.contactListItem.update({
        where: { id: listItem.id },
        data: {
          isWhatsappValid: response.exists,
          number: response.jid.replace(/\D/g, ''),
        },
      })
      return updatedRecord
    } catch (e) {
      logger.error(`Número de contato inválido: ${listItem.number}`)
      return listItem
    }
  } catch (error: any) {
    console.error(`Erro ao criar Lista de Items: ${error.message}`)
    throw new AppError(`Erro interno ao criar Lista de Items: ${error.message}`, 500)
  }
}

export default CreateContactListItem