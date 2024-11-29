import prisma from "../../prisma/client"
import { SimpleListRequest } from "./types"
import AppError from "src/errors/AppError";

const SimpleListService = async ({ searchParam, companyId }: SimpleListRequest): Promise<{id: number; name: string }[]> => {
  try {
    const whereCondition: any = { companyId }
  
    if (searchParam) {
      whereCondition.name = {
        contains: searchParam,
        mode: "insensitive",
      }
    }
  
    const ratings = await prisma.rating.findMany({
      where: whereCondition,
      orderBy: {
        name: "asc"
      },
      select: {
        id: true,
        name: true
      }
    })
  
    return ratings
  } catch (error: any) {
    console.error(`Erro ao listar arquivos: ${error.message}`)
    throw new AppError(`Erro interno ao listar arquivos: ${error.message}`, 500)
  }
}

export default SimpleListService