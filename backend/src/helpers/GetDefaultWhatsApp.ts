import prisma from '../prisma/client'
import { Whatsapp } from '@prisma/client'
import AppError from '../errors/AppError'
import GetDefaultWhatsAppByUser from './GetDefaultWhatsAppByUser'

const GetDefaultWhatsApp = async (companyId: number, userId?: number): Promise<Whatsapp> => {
  let connection: Whatsapp

  const defaultWhatsapp = await prisma.whatsapp.findFirst({ where: { isDefault: true, companyId }})
  if (!defaultWhatsapp) { throw new AppError('ERR_NO_DEF_WAPP_FOUND', 404)}

  if (defaultWhatsapp?.status === 'CONNECTED') {
    connection = defaultWhatsapp
  } else {
    const whatsapp = await prisma.whatsapp.findFirst({
      where: {
        status: "CONNECTED",
        companyId
      }
    })
    connection = whatsapp
  }

  if (userId) {
    const whatsappByUser = await GetDefaultWhatsAppByUser(userId)
    if (whatsappByUser?.status === 'CONNECTED') {
      connection = whatsappByUser
    } else {
      const whatsapp = await prisma.whatsapp.findFirst({
        where: {
          status: "CONNECTED",
          companyId
        }
      })
      connection = whatsapp
    }
  }

  if (!connection) {
    throw new AppError(`ERR_NO_DEF_WAPP_FOUND in COMPANY ${companyId}`)
  }
  
  return connection
}

export default GetDefaultWhatsApp
