import prisma from '../../prisma/client'
import { Help } from '@prisma/client'

const FindAllHelp = async (): Promise<Help[]> => {
  const records: Help[] = await prisma.help.findMany({
    orderBy: {
      title: 'asc',
    },
  })

  return records
}

export default FindAllHelp
