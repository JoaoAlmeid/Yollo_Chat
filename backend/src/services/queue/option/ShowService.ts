import AppError from "src/errors/AppError";
import { QueueOption } from "@prisma/client";
import prisma from "../../../prisma/client";

const ShowQOptionService = async (queueOptionId: number | string): Promise<QueueOption> => {
  // Tenta encontrar a opção de fila especifica pelo Id
  const queue = await prisma.queueOption.findUnique({
    where: {
      id: Number(queueOptionId)
    },
    include: {
      parent: true
    }
  });

  // Se a opção de fila não for encontrada, lança um erro
  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND", 404)
  }

  // Retorna a opção de fila encontrada
  return queue;
};

export default ShowQOptionService;
