import prisma from "../../prisma/client"
import { RequestListFiles, ResponseListFiles } from "src/@types/Files"
import AppError from "src/errors/AppError"

const ListService = async ({ searchParam, pageNumber = "1", companyId }: RequestListFiles): Promise<ResponseListFiles> => {
  try {
    const whereCondition = {
      companyId,
      ...(searchParam && {
        name: {
          contains: searchParam,
          mode: 'insensitive'
        }
      })
    }
    
    const limit = 20
    const offset = limit * (+pageNumber - 1)

    const [files, count] = await Promise.all([
      prisma.files.findMany({
        where: whereCondition,
        take: limit,
        skip: offset,
        orderBy: { name: "asc" }
      }),
      prisma.files.count({
        where: whereCondition
      })
    ])
  
    const hasMore = count > offset + files.length
  
    return {
      files,
      count,
      hasMore
    }
  } catch (error) {
    console.error(`Erro ao listar arquivos: ${error.message}`)
    throw new AppError(`Erro interno ao listar arquivos: ${error.message}`, 500)
  }
}

export default ListService