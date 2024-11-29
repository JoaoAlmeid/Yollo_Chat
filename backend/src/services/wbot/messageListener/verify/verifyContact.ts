import * as Sentry from '@sentry/node'
import { Contact } from '@prisma/client'
import { IMe } from '../../../../@types/wbot'
import AppError from '../../../../errors/AppError'
import CreateOrUpdateContactService from '../../../contact/CreateOrUpdate'
import { Session } from '../../../../@types/Session'

const verifyContact = async (msgContact: IMe, wbot: Session, companyId: number): Promise<Contact> => {
  let profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`
  try {
    if (wbot?.profilePictureUrl && msgContact?.id) {
      profilePicUrl = await wbot.profilePictureUrl(msgContact.id)
    }
  } catch (e) {
    Sentry.captureException(e)
    console.error(`Erro ao obter a URL da imagem de perfil para o contato ${msgContact.id}:`, e)
  }

  const contactData = {
    name: msgContact?.name || msgContact.id.replace(/\D/g, ''),
    number: msgContact.id.replace(/\D/g, ''),
    profilePicUrl,
    isGroup: msgContact.id.includes("g.us"),
    companyId,
    whatsappId: wbot.id
  }

  const contact = await CreateOrUpdateContactService(contactData)
  if (!contact) {
    throw new AppError('Contato não encontrado ou não foi criado', 404)
  }

  return contact
}

export default verifyContact