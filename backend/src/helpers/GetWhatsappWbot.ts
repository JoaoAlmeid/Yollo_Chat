import { Whatsapp } from '@prisma/client'
import { getWbot } from '../libs/wbot'
import AppError from '../errors/AppError'

const GetWhatsappWbot = async (whatsapp: Whatsapp) => {
  try {
    const wbot = await getWbot(whatsapp.id)
    
    if (!wbot) {
      throw new AppError('Whatsapp não encontrado', 404)
    }

    return wbot
  } catch (error: any) {
    console.error(`Erro ao obter o Wbot para WhatsApp ID ${whatsapp.id}:`, error)
    throw new AppError(`Erro na conexão com o WhatsApp: ${error.message}`, 500)
  }
}

export default GetWhatsappWbot