import { Campaign } from '@prisma/client'
import prisma from '../../prisma/client'

const FindAllAnnouncementService = async (): Promise<Campaign[]> => {
  const todasCampanhas: Campaign[] = await prisma.campaign.findMany({
    orderBy: { name: 'asc' },
  })
  return todasCampanhas
}

export default FindAllAnnouncementService