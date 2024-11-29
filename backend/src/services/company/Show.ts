import { Company } from '@prisma/client'
import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'

const ShowCompanyService = async (id: number): Promise<Company> => {
  try {
    const company = await prisma.company.findUnique({ 
      where: { id: Number(id)}
    })
  
    if (!company) { 
      throw new AppError('Erro: Empresa não encontrada', 404)
    }
  
    return company
  } catch (error: any) {
    console.error(`Erro ao exibir empresa ${error.message}`)
    throw new AppError(`Erro interno ao exibir empresa ${error.message}`, 500)
  }
}

export default ShowCompanyService