import { Whatsapp } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import ShowWhatsAppService from './ShowWhatsApp' // Certifique-se de que o caminho está correto
import AssociateWhatsappQueue from './AssociateWhatsApp'
import { RequestUpWhatsApp, ResponseWhatsApp } from '../../@types/WhatsApp'
import { updatedSchema } from './WhatsAppSchema'

const UpdateWhatsApp = async ({ whatsappData, whatsappId, companyId }: RequestUpWhatsApp): Promise<ResponseWhatsApp> => {
  const {
    name,
    status,
    isDefault,
    session,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    ratingMessage,
    queueIds = [],
    token,
    timeSendQueue,
    sendIdQueue,
  } = whatsappData

  try {
    await updatedSchema.validate({ name, status, isDefault })
  } catch (err: any) {
    throw new AppError(err.message)
  }

  if (queueIds.length > 1 && !greetingMessage) {
    throw new AppError('ERR_WAPP_GREETING_REQUIRED')
  }

  let oldDefaultWhatsapp: Whatsapp | null = null

  if (isDefault) {
    oldDefaultWhatsapp = await prisma.whatsapp.findFirst({
      where: {
        isDefault: true,
        id: { not: whatsappId },
        companyId,
      },
    })
    if (oldDefaultWhatsapp) {
      await prisma.whatsapp.update({
        where: { id: oldDefaultWhatsapp.id },
        data: { isDefault: false },
      })
    }
  }

  const whatsapp = await ShowWhatsAppService(Number(whatsappId), companyId) // Converta whatsappId para número

  if (!whatsapp) {
    throw new AppError('ERR_NO_WAPP_FOUND', 404)
  }

  const dataToUpdate: any = {
    name,
    status,
    session,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    ratingMessage,
    isDefault,
    token,
    timeSendQueue,
    sendIdQueue,
  }

  // Remove chaves com valores undefined
  Object.keys(dataToUpdate).forEach(
    key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
  )

  await prisma.whatsapp.update({
    where: { id: Number(whatsappId) }, // Converta whatsappId para número
    data: dataToUpdate,
  })

  await AssociateWhatsappQueue(whatsapp.id, queueIds) // Garante que whatsapp.id não seja null ou undefined

  return { whatsapp, oldDefaultWhatsapp }
}

export default UpdateWhatsApp
