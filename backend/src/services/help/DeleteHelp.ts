import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'

const DeleteHelp = async (id: number): Promise<void> => {
  try {
    // Verifica se existe no DB
    const record = await prisma.help.findFirst({
      where: {
        id,
      },
    })

    if (!record) {
      throw new AppError('ERR_NO_HELP_FOUND', 404)
    }

    // Deletar Help
    await prisma.help.delete({
      where: {
        id,
      },
    })
  } catch (error: any) {
    console.error(`Erro ao Deletar Help: ${error}`)
    throw new AppError('ERR_DELETE_HELP_SERVICE', 500)
  } finally {
    await prisma.$disconnect()
  }
}

export default DeleteHelp
