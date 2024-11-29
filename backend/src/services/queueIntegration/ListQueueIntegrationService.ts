import prisma from "../../prisma/client";
import { QueueIntegrations } from "@prisma/client";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  companyId: number;
}

interface Response {
  queueIntegrations: QueueIntegrations[];
  count: number;
  hasMore: boolean;
}

const ListQueueIntegrationService = async ({ searchParam = "", pageNumber = "1", companyId }: Request): Promise<Response> => {
  const limit = 20
  const offset = limit * (+pageNumber - 1)

  // Criação do filtro de busca
  const whereCondition = {
    companyId,
    name: {
      contains: searchParam,
      mode: "insensitive"
    }
  }

  // Obtenção dos dados e contagem total
  const [queueIntegrations, count] = await Promise.all([
    prisma.queueIntegrations.findMany({
      where: whereCondition,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.queueIntegrations.count({
      where: whereCondition
    })
  ])

  const hasMore = count > offset + queueIntegrations.length;

  return {
    queueIntegrations,
    count,
    hasMore
  };
};

export default ListQueueIntegrationService;