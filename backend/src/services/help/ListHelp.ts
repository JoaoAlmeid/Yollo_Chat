import { Prisma } from '@prisma/client'
import prisma from '../../prisma/client'
import { RequestHelp, ResponseHelp } from '../../@types/Help'

const ListHelp = async ({
  searchParam = '',
  pageNumber = '1',
}: RequestHelp): Promise<ResponseHelp> => {
  const perPage = 20
  const skip = perPage * (parseInt(pageNumber, 10) - 1)

  const where: Prisma.HelpWhereInput = {
    OR: [
      {
        title: {
          contains: searchParam.toLowerCase().trim(),
        },
      },
    ],
  }

  const countPromise = prisma.help.count({
    where,
  })

  const recordsPromise = prisma.help.findMany({
    where,
    orderBy: {
      title: 'asc',
    },
    skip,
    take: perPage,
  })

  const [count, records] = await Promise.all([countPromise, recordsPromise])

  const hasMore = count > skip + records.length

  return {
    records,
    count,
    hasMore,
  }
}

export default ListHelp
