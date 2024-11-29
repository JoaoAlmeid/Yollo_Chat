import { QuickMessage } from '@prisma/client'
import prisma from '../../prisma/client'
import AppError from 'src/errors/AppError';

const findAllQMessage = async (): Promise<QuickMessage[]> => {
  try {
    const qMessages: QuickMessage[] = await prisma.quickMessage.findMany({
      orderBy: {
        shortcode: 'asc',
      },
    });
    return qMessages;
  } catch (error: any) {
    throw new AppError('Erro ao recuperar mensagens rápidas', 500);
  }
};

export default findAllQMessage;
