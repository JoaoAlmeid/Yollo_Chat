import { isString, isArray } from 'lodash'
import * as Sentry from '@sentry/node'
import path from 'path'
import fs from 'fs'
import GetDefaultWhatsApp from '../../helpers/GetDefaultWhatsApp'
import { getWbot } from '../../libs/wbot'
import ShowBaileysService from '../../services/baileys/ShowBaileys'
import CreateContactService from '../contact/Create'
import prisma from '../../prisma/client'
import { logger } from 'src/utils/Logger'

const ImportContactsService = async (companyId: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId)

  // Garanta que o WhatsApp padrão não seja indefinido
  if (!defaultWhatsapp || !defaultWhatsapp.id) {
    const errMessage =
      'Não foi possível obter a instância padrão do WhatsApp ou seu Id é indefinido.'
    Sentry.captureException(errMessage)
    console.error(errMessage)
    throw new Error(errMessage)
  }

  const wbot = getWbot(defaultWhatsapp.id)

  // Garanta que "wbot" seje definido
  if (!wbot) {
    const errMessage = 'Não foi possível obter a instância do bot do WhatsApp.'
    Sentry.captureException(new Error(errMessage))
    console.error(errMessage)
    throw new Error(errMessage)
  }

  let phoneContacts: any[]

  try {
    const contactsString = await ShowBaileysService(wbot.id)
    phoneContacts = JSON.parse(JSON.stringify(contactsString.contacts))

    const publicFolder = path.resolve(__dirname, '..', '..', '..', 'public')
    const beforeFilePath = path.join(publicFolder, 'contatos_antes.txt')
    fs.writeFile(beforeFilePath, JSON.stringify(phoneContacts, null, 2), (err) => {
      if (err) {
        logger.error(`Falha ao gravar contatos no arquivo: ${err}`)
        throw new Error(`Falha ao gravar contatos no arquivo: ${err}`)
      }
      console.log('O arquivo contatos_antes.txt foi criado!')
    })
  } catch (err) {
    Sentry.captureException(err)
    console.error(`Não foi possivel obter os contatos do whatssap do telefone. Error: ${err}`)
    throw new Error(`Não foi possivel obter os contatos do whatssap do telefone. Error: ${err}`)
  }

  const publicFolder = path.resolve(__dirname, '..', '..', '..', 'public')
  const afterFilePath = path.join(publicFolder, 'contatos_depois.txt')
  fs.writeFile(afterFilePath, JSON.stringify(phoneContacts, null, 2), (err) => {
    if (err) {
      logger.error(`Falha ao gravar contatos no arquivo`)
      throw err
    }
  })

  const phoneContactsList = isString(phoneContacts)
    ? JSON.parse(phoneContacts)
    : phoneContacts

  if (isArray(phoneContactsList)) {
    for (const { id, name, notify } of phoneContactsList) {
      if (id === 'status@broadcast' || id.includes('g.us')) 
        return
      const number = id.replace(/\D/g, '')

      try {
        let existingContact = await prisma.contact.findFirst({
          where: { number, companyId },
        })

        if (existingContact) {
          // Atualiza o nome do contato existente
          existingContact = await prisma.contact.update({
            where: { id: existingContact.id },
            data: { name: name || notify },
          })
        } else {
          // Cria um novo contato
          await CreateContactService({
            number,
            name: name || notify,
            companyId,
          })
        }
      } catch (error: any) {
        Sentry.captureException(error)
        console.warn(`Could not create or update contact. Error: ${error}`)
      }
    }
  }
}

export default ImportContactsService