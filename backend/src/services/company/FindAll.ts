import { Company } from '@prisma/client'
import prisma from '../../prisma/client'

const FindAllCompanyService = async (): Promise<Company[]> => {
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          value: true
        }
      },
      settings: true
    }
  })

  return companies
}

export default FindAllCompanyService