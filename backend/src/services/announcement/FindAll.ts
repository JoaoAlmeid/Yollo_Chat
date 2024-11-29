import prisma from '../../prisma/client'
import { Announcement } from '@prisma/client'

const FindAllService = async (): Promise<Announcement[]> => {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return announcements
}

export default FindAllService
