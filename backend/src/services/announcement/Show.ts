import { Announcement } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const ShowService = async (id: string | number): Promise<Announcement> => {
  const announcementId = typeof id === 'string' ? Number(id) : id

  if (isNaN(announcementId)) {
    throw new AppError('ID inválido', 400)
  }

  const record = await prisma.announcement.findUnique({ where: { id: announcementId } })

  if (!record) {
    throw new AppError('Anúncio não encontrado', 404)
  }

  return record
}

export default ShowService
