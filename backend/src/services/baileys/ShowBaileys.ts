import prisma from '../../prisma/client'
import { Baileys } from '@prisma/client'
import AppError from '../../errors/AppError'

const ShowBaileysService = async (id: string | number): Promise<Baileys> => {
  try {
    const baileysData = await prisma.baileys.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!baileysData) {
      throw new AppError('Erro: Dados não encontrado', 404)
    }

    return baileysData
  } catch (error: any) {
    console.error(`Erro ao mostrar baileys: ${error}`)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export default ShowBaileysService