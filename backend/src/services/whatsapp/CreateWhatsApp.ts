import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import AssociateWhatsappQueue from './AssociateWhatsApp'
import { RequestWhatsApp, ResponseWhatsApp } from '../../@types/WhatsApp'
import { createdSchema } from './WhatsAppSchema'

const CreateWhatsApp = async ({
  name,
  status = 'OPENING',
  queueIds = [],
  greetingMessage,
  complationMessage,
  outOfHoursMessage,
  ratingMessage,
  isDefault = false,
  companyId,
  token = '',
  provider = 'beta',
  transferQueueId,
  timeToTransfer,    
  promptId,
  maxUseBotQueues = 3,
  timeUseBotQueues = 0,
  expiresTicket = 0,
  expiresInactiveMessage = ""
}: RequestWhatsApp): Promise<ResponseWhatsApp> => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { plan: true }
  })

  if (!company) {
    throw new AppError('Empresa não encontrada', 404)
  }
  
  const whatsappCount = await prisma.whatsapp.count({
    where: { companyId },
  })

  if (whatsappCount >= company.plan.connections) {
    throw new AppError(
      `Número máximo de conexões já alcançado: ${whatsappCount}`
    )
  }

  try {
    await createdSchema.validate({ name, status, isDefault, token })
  } catch (err: any) {
    throw new AppError(err.message)
  }

  const whatsappFound = await prisma.whatsapp.findFirst({ where: { companyId } })
  isDefault = !whatsappFound
  let oldDefaultWhatsapp: ResponseWhatsApp['oldDefaultWhatsapp'] = null

  if (isDefault) {
    oldDefaultWhatsapp = await prisma.whatsapp.findFirst({
      where: { isDefault: true, companyId },
    })
    if (oldDefaultWhatsapp) {
      await prisma.whatsapp.update({
        where: { id: oldDefaultWhatsapp.id },
        data: { isDefault: false, companyId },
      })
    }
  }
  if (queueIds.length > 1 && !greetingMessage) {
    throw new AppError('ERR_WAPP_GREETING_REQUIRED')
  }

  const whatsapp = await prisma.whatsapp.create({
    data: {
      name,
      status,
      greetingMessage,
      complationMessage,
      outOfHoursMessage,
      ratingMessage,
      isDefault,
      companyId,
      token,
      provider,
      transferQueueId,
      timeToTransfer,	  
      promptId,
      maxUseBotQueues,
      timeUseBotQueues: String(timeUseBotQueues),
      expiresTicket,
      expiresInactiveMessage
    }
  })

  // Associa filas ao WhatsApp
  await AssociateWhatsappQueue(whatsapp.id, queueIds)
  return { whatsapp, oldDefaultWhatsapp }
}

export default CreateWhatsApp