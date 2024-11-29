import AppError from 'src/errors/AppError'
import prisma from '../../prisma/client'
import { ListRequest, ListResponse } from './types'

const ListCompanies = async ({ searchParam, pageNumber }: ListRequest): Promise<ListResponse> => {
  try {
    const whereCondition = {
      name: {
        contains: searchParam.toLowerCase().trim(),
        mode: 'insensitive',
      },
    }
    
    const limit = 20
    const offset = limit * (+pageNumber - 1)
  
    const companies = await prisma.company.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      orderBy: {
        name: 'asc'
      }
    })
  
    const count = await prisma.company.count({ where: whereCondition })
  
    const hasMore = count > offset + companies.length
  
    return {
      companies,
      count,
      hasMore,
    }
  } catch (error) {
    console.error(`Erro ao listar empresas: ${error.message}`)
    throw new AppError(`Erro interno ao listar empresas: ${error.message}`, 500)
  }
}

export default ListCompanies