import prisma from "../../prisma/client"
import AppError from "../../errors/AppError"

const DeleteService = async (id: string | number, companyId: number): Promise<void> => {
  try {
    const file = await prisma.files.findUnique({
      where: { id: Number(id), companyId }
    })
  
    if (!file) {
      throw new AppError("Arquivo não encontrado", 404)
    }
  
    await prisma.files.delete({
      where: { id: file.id }
    })
  } catch (error) {
    console.error(`Erro ao deletar arquivo: ${error.message}`)
    throw new AppError(`Erro interno ao deletar arquivo: ${error.message}`, 500)
  }
}

export default DeleteService