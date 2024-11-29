import { Help } from '@prisma/client'
import prisma from '../../prisma/client'

const FindHelp = async (): Promise<Help[]> => {
  const notes: Help[] = await prisma.help.findMany({
    orderBy: {
      title: 'asc',
    },
  })

  return notes
}

export default FindHelp
