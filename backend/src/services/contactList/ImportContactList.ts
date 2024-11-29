import Papa from 'papaparse'
import fs from 'fs'
import { ContactListItem } from '@prisma/client'
import { logger } from '../../utils/Logger'
import prisma from '../../prisma/client'
import CheckContactNumber from '../wbot/CheckNumber'
import AppError from 'src/errors/AppError'
import { ContactRow } from './types'
import contactListItem from 'src/controllers/contactListItem'

export async function ImportContactList(contactListId: number, companyId: number, file: Express.Multer.File | undefined): Promise<ContactListItem[]> {
  // Validação da existência do arquivo
  if (!file) {
    throw new AppError('Arquivo não encontrado!', 404)
  }

  const fileContent = fs.readFileSync(file.path , 'utf8')

  const parsedData = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  const rows = parsedData.data as ContactRow[]
  const contactList: ContactListItem[] = []

  for (const row of rows) {
    let name = row.nome || row.Nome || ''
    let number = row.numero || row['número'] || row.Numero || row['Número'] || ''
    let email = row.email || row['e-mail'] || row.Email || row['E-mail'] || ''

    // Normaliza o número de telefone
    number = number.replace(/\D/g, '')

    try {
      const existingContact = await prisma.contactListItem.findFirst({
        where: {
          number,
          contactListId,
          companyId
        }
      })

      // Verifica e atualiza o status do WhatsApp
      const updateWhatsAppStatus = async (contact: ContactListItem) => {
        const response = await CheckContactNumber(contact.number, companyId)
        contact.isWhatsappValid = response.exists
        contact.number = response.jid.replace(/\D/g, '')

        return await prisma.contactListItem.update({
          where: { id: contact.id },
          data: {
            isWhatsappValid: contact.isWhatsappValid,
            number: contact.number,
          },
        })
      }

      if (existingContact) {
        const updatedContact = await prisma.contactListItem.update({
          where: { id: existingContact.id },
          data: { name, email, isWhatsappValid: false }
        })

        const finalUpdatedContact = await updateWhatsAppStatus(updatedContact)
        contactList.push(finalUpdatedContact)
      } else {
        const newContact = await prisma.contactListItem.create({
          data: {
            name,
            number,
            email,
            isWhatsappValid: false,
            contactListId,
            companyId,
            updatedAt: new Date(),
          },
        })

        const finalNewContact = await updateWhatsAppStatus(newContact)
        contactList.push(finalNewContact)
      }
    } catch (error: any) {
      logger.error(`Erro ao processar o número: ${number}. Erro: ${error.message}`)
      throw new AppError(`Erro ao processar o número: ${number} | Erro: ${error.message}`, 500)
    }
  }

  return contactList
}
