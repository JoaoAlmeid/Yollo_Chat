import prisma from "../../prisma/client"
import AppError from "../../errors/AppError"

const DeleteAllService = async (companyId: number): Promise<void> => {
  try {
    const files = await prisma.files.findMany({
      where: { companyId }
    })
  
    if (files.length === 0) {
      throw new AppError("ERR_NO_RATING_FOUND", 404)
    }
  
    await prisma.files.deleteMany({
      where: { companyId }
    })
  } catch (error) {
    console.error(`Erro ao deletar todos arquivos: ${error.message}`)
    throw new AppError(`Erro interno ao deletar todos arquivos: ${error.message}`, 500)
  }
}

export default DeleteAllService