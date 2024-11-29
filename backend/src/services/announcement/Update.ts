import { UpData } from '../../@types/Announcement'
import { Announcement } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const UpdateService = async (data: UpData): Promise<Announcement> => {
  const { id, priority, title, text, status, companyId } = data

  const announcementId = typeof id === 'string' ? Number(id) : id

  if (isNaN(announcementId)) {
    throw new AppError('ID inválido', 400)
  }

  const existingAnnouncement = await prisma.announcement.findUnique({
    where: { id: announcementId }
  })

  if (!existingAnnouncement) {
    throw new AppError('Anúncio não encontrado', 404)
  }

  try {
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: { priority, title, text, status, companyId },
    })

    return updatedAnnouncement
  } catch (error: any) {
    console.error(`Erro ao atualizar anúncio: ${error.message}`)
    throw new AppError(`Erro ao autalizar anúncio: ${error.message}`, 500)
  }
}

export default UpdateService