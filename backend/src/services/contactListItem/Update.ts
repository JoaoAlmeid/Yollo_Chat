import { ContactListItem } from '@prisma/client'
import AppError from '../../errors/AppError'
import { logger } from '../../utils/Logger'
import CheckContactNumber from '../wbot/CheckNumber'
import prisma from '../../prisma/client'
import { UpdateData } from './types'

const UpdateContactList = async (data: UpdateData): Promise<ContactListItem> => {
  try {
    const { id, name, number, email } = data
  
    const listItem = await prisma.contactListItem.findUnique({
      where: { id: Number(id) },
    })
  
    if (!listItem) {
      throw new AppError('ERR_NO_CONTACTLISTITEM_FOUND', 404)
    }
  
    const updatedRecord = await prisma.contactListItem.update({
      where: { id: listItem.id },
      data: { name, number, email }
    })

    try {
      const response = await CheckContactNumber(
        updatedRecord.number,
        updatedRecord.companyId
      )
      
      const finalRecord = await prisma.contactListItem.update({
        where: { id: updatedRecord.id },
        data: {
          isWhatsappValid: response.exists,
          number: response.jid.replace(/\D/g, ''),
        },
      })

      return finalRecord
    } catch (error) {
      logger.error(`Número de contato inválido: ${updatedRecord.number}`)
      return updatedRecord
    }
  } catch (error: any) {
    console.error(`Erro ao atualizar lista de items: ${error.message}`)
    throw new AppError(`Erro interno ao atualizar lista de items: ${error.message}`, 500)
  }
}

export default UpdateContactList