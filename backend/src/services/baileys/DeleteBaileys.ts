import prisma from '../../prisma/client'

const DeleteBaileysService = async (id: string | number): Promise<void> => {
  try {
    const baileysData = await prisma.baileys.findUnique({
      where: {
        id: Number(id)
      },
    })

    if (baileysData) {
      await prisma.baileys.delete({
        where: {
          id: baileysData.id,
        },
      })
    }
  } catch (error: any) {
    console.error(`Erro ao deletar bailey: ${error}`)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export default DeleteBaileysService