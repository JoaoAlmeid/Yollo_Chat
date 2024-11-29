import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const DeleteCompanyService = async (id: string): Promise<void> => {
  try {
    const company = await prisma.company.findUnique({ where: { id: Number(id) } })
    if (!company) {
      throw new AppError('Erro: Empresa não encontrada', 404)
    }

    await prisma.company.delete({
      where: { id: Number(id) }
    })
  } catch (error: any) {
    console.error(`Erro ao deletar empresa: ${error.message}`)
    throw new AppError(`Erro interno ao deletar empresa: ${error.message}`, 500)
  }
}

export default DeleteCompanyService