import prisma from '../prisma/client'
import AppError from '../errors/AppError'

const CheckSettings = async (key: string): Promise<string> => {
  try {
    const setting = await prisma.setting.findFirst({ 
      where: { key }
    })
    if (!setting) { 
      throw new AppError('ERR_NO_SETTING_FOUND', 404)
    }
    return setting.value
  } catch (error: any) {
    const errorMessage = error.message ? error.message : 'Erro desconhecido'
    throw new AppError(`Ocorreu um erro desconhecido: ${errorMessage}`, 500)
  }
}

export default CheckSettings