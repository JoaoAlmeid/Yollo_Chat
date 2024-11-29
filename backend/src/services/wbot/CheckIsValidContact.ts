import * as Sentry from '@sentry/node'
import GetDefaultWhatsApp from '../../helpers/GetDefaultWhatsApp'
import AppError from '../../errors/AppError'
import { getWbot } from '../../libs/wbot'

const CheckIsValidContact = async (number: string, companyId: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId)

  // Verifica se defaultWhatsapp e seu id são definidos
  if (!defaultWhatsapp || !defaultWhatsapp.id) {
    const errMessage =
      'Não foi possível obter o WhatsApp padrão ou seu ID está indefinido.'
    Sentry.captureException(new Error(errMessage))
    console.error(errMessage)
    throw new Error(errMessage)
  }

  const wbot = getWbot(defaultWhatsapp.id)

  // Garanta que "wbot" seja definido
  if (!wbot) {
    const errMessage = 'Não foi possível obter a instância do bot do WhatsApp.'
    Sentry.captureException(new Error(errMessage))
    console.error(errMessage)
    throw new Error(errMessage)
  }

  try {
    const isValidNumber = await wbot.onWhatsApp(`${number}`)
    if (!isValidNumber) {
      throw new AppError('invalidNumber')
    }
  } catch (err: any) {
    if (err.message === 'invalidNumber') {
      throw new AppError('ERR_WAPP_INVALID_CONTACT')
    }
    throw new AppError('ERR_WAPP_CHECK_CONTACT')
  }
}

export default CheckIsValidContact