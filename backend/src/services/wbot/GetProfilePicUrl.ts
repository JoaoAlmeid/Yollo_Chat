import * as Sentry from '@sentry/node'
import GetDefaultWhatsApp from '../../helpers/GetDefaultWhatsApp'
import { getWbot } from '../../libs/wbot'

const GetProfilePicUrl = async (number: string, companyId: number): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId)
  const wbot = getWbot(defaultWhatsapp.id)

  // Garanta que "wbot" seje definido
  if (!wbot) {
    const errMessage = 'Não foi possível obter a instância do bot do WhatsApp.'
    Sentry.captureException(new Error(errMessage))
    console.error(errMessage)
    throw new Error(errMessage)
  }

  let profilePicUrl: string

  try {
    profilePicUrl = await wbot.profilePictureUrl(`${number}@s.whatsapp.net`)
    if (!profilePicUrl) {
      throw new Error('A URL da foto de perfil está indefinido ou vazio')
    }
  } catch (error: any) {
    console.error('Erro ao buscar a foto de perfil:', error)
    profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`
  }

  return profilePicUrl
}

export default GetProfilePicUrl