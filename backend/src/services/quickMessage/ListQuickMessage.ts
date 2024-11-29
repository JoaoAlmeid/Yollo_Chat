import { Prisma } from '@prisma/client';
import prisma from '../../prisma/client';
import { ReqQuickMessage, ResQuickMessage } from '../../@types/Message';
import AppError from '../../errors/AppError';

const ListQMessage = async ({
  searchParam = '',
  pageNumber = '1',
  companyId,
  userId,
}: ReqQuickMessage): Promise<ResQuickMessage> => {
  // Sanitização e validação dos parâmetros de entrada
  const sanitizedSearchParam = searchParam.toLowerCase().trim();
  const page = parseInt(pageNumber, 10);
  if (isNaN(page) || page < 1) {
    throw new AppError('Número da página inválido', 400);
  }

  if (isNaN(Number(companyId)) || isNaN(Number(userId))) {
    throw new AppError('Parâmetros de empresa ou usuário inválidos', 400);
  }

  const where: Prisma.QuickMessageWhereInput = {
    OR: [
      {
        shortcode: {
          contains: sanitizedSearchParam,
        },
      },
    ],
    companyId: Number(companyId),
    userId: Number(userId),
  };

  const limit = 20;
  const offset = limit * (page - 1);

  try {
    const records = await prisma.quickMessage.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        shortcode: 'asc',
      },
    });

    const count = await prisma.quickMessage.count({ where });

    const hasMore = count > offset + records.length;

    return {
      records,
      count,
      hasMore,
    };
  } catch (error: any) {
    throw new AppError('Erro ao listar mensagens rápidas', 500);
  }
};

export default ListQMessage;