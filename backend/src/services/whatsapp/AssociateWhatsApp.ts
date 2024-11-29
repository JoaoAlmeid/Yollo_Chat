import prisma from '../../prisma/client'

const AssociateWhatsappQueue = async ( whatsappId: number, queueIds: number[] ): Promise<void> => {
  try {
    const queueInputs = queueIds.map(queueId => ({ id: queueId }))

    await prisma.whatsapp.update({
      where: { id: whatsappId },
      data: { queues: { set: queueInputs } },
    })

    await prisma.whatsapp.findUnique({ where: { id: whatsappId } })
  } catch (error: any) {
    console.error('Error associating queues to WhatsApp:', error)
    throw error
  }
}

export default AssociateWhatsappQueue
