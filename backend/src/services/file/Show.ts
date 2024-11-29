import prisma from "../../prisma/client"
import { Files } from "@prisma/client"
import AppError from "../../errors/AppError"

const ShowFileService = async (id: string | number, companyId: number): Promise<Files> => {
  try {
    const fileList = await prisma.files.findUnique({
      where: { id: Number(id), companyId },
      include: {
        options: {
          orderBy: { id: "asc" }
        }
      }
    })
  
    if (!fileList) {
      throw new AppError("Arquivo não encontrado", 404)
    }
  
    return fileList
  } catch (error: any) {
    console.error(`Erro ao exibir arquivo: ${error.message}`)
    throw new AppError(`Erro interno ao exibir arquivo: ${error.message}`, 500)
  }
}

export default ShowFileService