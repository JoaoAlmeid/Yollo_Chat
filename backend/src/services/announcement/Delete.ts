import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const DeleteService = async (id: string): Promise<void> => {
  const announcementId = Number(id)

  if (isNaN(announcementId)) {
    throw new AppError('ID inválido', 400)
  }

  try {
    const anuncio = await prisma.announcement.findUnique({
      where: { id: announcementId }
    })

    if (!anuncio) {
      throw new AppError('Anúncio não encontrado', 404)
    }

    await prisma.announcement.delete({ 
      where: { id: announcementId } 
    })
  } catch (error: any) {
    throw new AppError(`Erro ao deletar anúncio: ${error.message}`, 500)
  }
}

export default DeleteService