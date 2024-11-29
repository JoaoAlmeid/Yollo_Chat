import prisma from '../../prisma/client'
import AppError from '../../errors/AppError'
import { Setting } from '@prisma/client'

const UpdateSetting = async (
  key: string,
  value: string,
  companyId: number
): Promise<Setting> => {
  try {
    // Busca ou cria a configuração
    let setting = await prisma.setting.findFirst({ where: { key, companyId } })

    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          key,
          value,
          companyId,
          updatedAt: new Date(),
        },
      })
    } else {
      if (setting.companyId !== companyId) {
        throw new AppError(
          'Não é possível consultar registros de outra empresa'
        )
      }

      // Atualiza a configuração existente
      setting = await prisma.setting.update({
        where: { id: setting.id },
        data: { value },
      })
    }

    return setting
  } catch (error: any) {
    throw new AppError('Erro ao atualizar configuração', 500)
  }
}

export default UpdateSetting
