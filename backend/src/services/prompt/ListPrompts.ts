import prisma from "../../prisma/client"
import { ResponseListPrompt, RequestListPrompt } from "src/@types/Prompt"

const ListPromptsService = async ({ searchParam = "", pageNumber = "1", companyId }: RequestListPrompt): Promise<ResponseListPrompt> => {
  const limit = 20
  const offset = limit * (Number(pageNumber) - 1)

  // Cria a condição de filtro baseada no parâmetro da pesquisa
  const whereCondition = searchParam
    ? {
      AND: [
        {
          companyId: Number(companyId)
        },
        {
          name: {
            contains: searchParam,
            mode: 'insensitive',
          },
        },
      ],
    }
    : {
      companyId: Number(companyId)
    }

  // Busca os prompts com contagem
  const [prompts, count] = await prisma.$transaction([
    prisma.prompt.findMany({
      where: whereCondition,
      include: {
        queue: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.prompt.count({ where: whereCondition })
  ])

  const hasMore = count > offset + prompts.length

  return {
    prompts,
    count,
    hasMore
  }
}

export default ListPromptsService
