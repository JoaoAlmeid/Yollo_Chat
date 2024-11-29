import AppError from '../../errors/AppError'
import prisma from '../../prisma/client'
import { Setting } from '@prisma/client'

const ListSettingsOne = async (
  companyId: number,
  key?: string
): Promise<Setting | null> => {
  try {
    const setting = await prisma.setting.findFirst({
      where: {
        companyId: companyId,
        ...(key && { key }),
      },
    })
    return setting
  } catch (error: any) {
    throw new AppError('Erro ao buscar configuração', 500)
  }
}

export default ListSettingsOne
