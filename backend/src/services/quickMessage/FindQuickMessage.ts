import { QuickMessage } from '@prisma/client'
import prisma from '../../prisma/client'
import { ParamsQuickMessage } from '../../@types/Message'
import AppError from 'src/errors/AppError'

const FindQuickMessage = async ({
  companyId,
  userId,
}: ParamsQuickMessage): Promise<QuickMessage[]> => {
  try {
    const qMessage = await prisma.quickMessage.findMany({
      where: {
        companyId: Number(companyId),
        userId: Number(userId),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        shortcode: 'asc',
      },
    })
  
    return qMessage
  } catch (error: any) {
    throw new AppError('Erro ao recuperar mensagem rápida', 500);
  }
}

export default FindQuickMessage
