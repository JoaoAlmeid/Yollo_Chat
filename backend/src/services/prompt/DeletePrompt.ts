import ShowPromptService from "./ShowPrompt"
import prisma from "../../prisma/client"
import AppError from "src/errors/AppError"

const DeletePromptService = async (promptId: number | string, companyId: number | string): Promise<void> => {
  try {
    // Certifica que o prompt existe e está associado a empresa correta
    const prompt = await ShowPromptService({ promptId, companyId })
    if (!prompt) {
      throw new AppError('Prompt não encontrado!', 404)
    }

    // Deletar o prompt do banco de dados
    await prisma.prompt.delete({
      where: { id: Number(promptId) }
    })
  } catch (error: any) {
    throw new AppError(error.message || 'Erro ao excluir o prompt')
  }
}

export default DeletePromptService