import { Announcement } from '@prisma/client'
import prisma from '../../prisma/client'

type Params = {
  companyId: string
}

const FindService = async ({ companyId }: Params): Promise<Announcement[]> => {
  const parsedCompanyId = parseInt(companyId)

  if (isNaN(parsedCompanyId)) {
    throw new Error('ID da empresa inválido')
  }

  const announcements: Announcement[] = await prisma.announcement.findMany({
    where: { companyId: parsedCompanyId },
    include: { company: { 
      select: { 
        id: true, 
        name: true 
      } 
    }},
    orderBy: { createdAt: 'desc' },
  })

  return announcements
}

export default FindService
