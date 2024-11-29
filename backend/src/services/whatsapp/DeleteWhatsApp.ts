import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const DeleteWhatsApp = async (id: number): Promise<void> => {
  const whatsapp = await prisma.whatsapp.findUnique({
    where: { id },
  })

  if (!whatsapp) {
    throw new AppError('ERR_NO_WAPP_FOUND', 404)
  }

  await prisma.whatsapp.delete({
    where: { id },
  })
}

export default DeleteWhatsApp
