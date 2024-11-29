import { Prisma, Whatsapp } from '@prisma/client'
import prisma from '../../prisma/client'
import { RequestListWhatsApp } from '../../@types/WhatsApp'

const ListWhatsApps = async ({
  session,
  companyId,
}: RequestListWhatsApp): Promise<Whatsapp[]> => {
  const options: Prisma.WhatsappFindManyArgs = {
    where: {
      companyId,
    },
    include: {
      queues: {
        select: {
          id: true,
          name: true,
          color: true,
          greetingMessage: true,
        },
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
      greetingMessage: true,
      complationMessage: true,
      outOfHoursMessage: true,
      ratingMessage: true,
      isDefault: true,
      token: session === 0 ? false : true,
      provider: true,
      sendIdQueue: true,
      timeSendQueue: true,
    },
  }

  const whatsapps = await prisma.whatsapp.findMany(options)

  return whatsapps
}

export default ListWhatsApps
