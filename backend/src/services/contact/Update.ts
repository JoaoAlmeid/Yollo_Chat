import { Contact } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { UpRequestContact } from '../../@types/Contact'
import { Data, UpdateRequest } from './types'

const UpdateContact = async ({ contactData,  contactId, companyId }: UpdateRequest): Promise<Contact> => {
  try {
    const { email, name, number, extraInfo } = contactData

    if (!contactId || !companyId || !contactData) {
      throw new AppError('Erro: Dados do contato inválidos', 400)
    }

    const contact = await prisma.contact.findUnique({
      where: { id: Number(contactId) },
    })

    if (!contact) {
      throw new AppError('Erro: Contato não encontrado', 404)
    }

    if (contact.companyId !== companyId) {
      throw new AppError('Não é possível alterar registros de outra empresa')
    }

    await prisma.contact.update({
      where: { id: contact.id },
      data: { name, number, email },
    })

    if (extraInfo) {
      const updatePromises = extraInfo.map(async info => {
        if (info.id) {
          await prisma.contactCustomField.upsert({
            where: { id: info.id },
            update: {
              name: info.name,
              value: info.value,
            },
            create: {
              name: info.name,
              value: info.value,
              contactId: contact.id,
              updatedAt: new Date(),
            },
          })
        } else {
          await prisma.contactCustomField.create({
            data: {
              name: info.name,
              value: info.value,
              contactId: contact.id,
              updatedAt: new Date(),
            },
          })
        }
      })
      await Promise.all(updatePromises)

      // Remove campos personalizados que não foram atualizados
      const existingInfoIds = (
        await prisma.contactCustomField.findMany({
          where: { contactId: contact.id },
        })
      ).map(field => field.id)

      const infoIdsToRemove = existingInfoIds.filter(
        id => !extraInfo.some(info => info.id === id)
      )

      if (infoIdsToRemove.length > 0) {
        await prisma.contactCustomField.deleteMany({
          where: {
            id: { in: infoIdsToRemove },
          },
        })
      }
    }

    // Recarrega o contato atualizado com as informações extras
    const updatedContact = await prisma.contact.findUnique({
      where: { id: contact.id },
    })

    return updatedContact
  } catch (error: any) {
    console.error(`Erro ao atualizar contato: ${error}`)
    throw new AppError(`Erro interno ao atualizar contato: ${error.message}`, 500)
  }
}

export default UpdateContact