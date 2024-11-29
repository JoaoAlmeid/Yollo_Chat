import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { Setting } from '@prisma/client'

const ListSettings = async (companyId: number): Promise<Setting[]> => {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        companyId: companyId,
      },
    })
    return settings
  } catch (error: any) {
    throw new AppError('Erro ao listar configurações', 500)
  }
}

export default ListSettings
