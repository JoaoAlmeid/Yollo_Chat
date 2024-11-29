import ListWhatsAppsService from '../../services/whatsapp/ListWhatsApps'
import { StartWhatsAppSession } from './StartWhatsAppSession'
import * as Sentry from '@sentry/node'

const StartAllWhatsAppsSessions = async (companyId: number): Promise<void> => {
  try {
    const whatsapps = await ListWhatsAppsService({ companyId })
    if (whatsapps.length > 0) {
      whatsapps.forEach(whatsapp => {
        StartWhatsAppSession(whatsapp, companyId)
      })
    }
  } catch (e) {
    Sentry.captureException(e)
  }
}

export default StartAllWhatsAppsSessions